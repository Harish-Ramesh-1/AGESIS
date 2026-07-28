import { Router } from 'express'
import crypto from 'crypto'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { generateOtpCode, hashOtp } from '../../utils/otp.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js'
import { env } from '../../config/env.js'
import { sendEmail } from '../../config/mailer.js'
import { buildOtpEmailHtml } from '../../utils/emailTemplates.js'
import { requireAuth, attachFullUser } from '../../middleware/auth.js'
import { logAudit } from '../audit/audit.service.js'

export const authRouter = Router()

const PORTALS = ['parent', 'accountant', 'admin']

function sanitizeUser(user) {
  return {
    id: user.id,
    portal: user.portal,
    uniqueId: user.unique_id,
    email: user.email,
    phone: user.phone,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    roleId: user.role_id,
    status: user.status,
    twoFactorEnabled: user.two_factor_enabled,
    preferences: user.preferences,
  }
}

async function findUser({ portal, idValue, email }) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('portal', portal)
    .eq('unique_id', idValue)
    .ilike('email', email)
    .maybeSingle()
  if (error) throw new ApiError(500, error.message)
  return data
}

authRouter.post(
  '/otp/generate',
  asyncHandler(async (req, res) => {
    const { portal, idValue, email } = req.body || {}
    if (!PORTALS.includes(portal) || !idValue || !email) {
      throw new ApiError(400, 'portal, idValue and email are required.')
    }

    const user = await findUser({ portal, idValue, email })
    if (!user) throw new ApiError(404, 'No account found matching those details.')
    if (user.status === 'suspended') throw new ApiError(403, 'This account has been suspended.')
    if (user.status === 'rejected') throw new ApiError(403, 'This account is not active.')

    const code = env.otpDemoMode ? env.otpDemoCode : generateOtpCode()
    const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000).toISOString()

    const { error } = await supabaseAdmin.from('otp_codes').insert({
      portal,
      id_value: idValue,
      email: user.email,
      otp_hash: hashOtp(code),
      expires_at: expiresAt,
    })
    if (error) throw new ApiError(500, error.message)

    // @agesis.com is a fictional "just trying it out" sample domain (not a real
    // inbox) — skip the real send so we don't bounce mail against it, and rely
    // on the fallback code instead.
    const isSampleAccount = user.email.toLowerCase().endsWith('@agesis.com')
    if (isSampleAccount) {
      console.log(`[auth] sample account ${user.unique_id} — skipping real email, use the fallback code.`)
      return res.json({ message: 'Sample account — use the fallback code on the next step.' })
    }

    // Fire-and-forget: the OTP is already stored and valid, so the response
    // must not wait on SMTP — some hosts have slow/throttled outbound mail
    // delivery, and awaiting it here risked the platform's own gateway
    // timeout killing the connection before we could respond at all.
    sendEmail({
      to: user.email,
      subject: 'Your AGESIS login code',
      text: `Your one-time login code is ${code}. It expires in ${env.otpTtlMinutes} minutes.`,
      html: buildOtpEmailHtml(code),
    }).catch((error) => console.error('[auth] background email send failed', error.message))

    res.json({ message: 'A one-time code has been sent to your registered email.' })
  }),
)

authRouter.post(
  '/otp/verify',
  asyncHandler(async (req, res) => {
    const { portal, idValue, email, otp } = req.body || {}
    if (!PORTALS.includes(portal) || !idValue || !email || !otp) {
      throw new ApiError(400, 'portal, idValue, email and otp are required.')
    }

    const user = await findUser({ portal, idValue, email })
    if (!user) throw new ApiError(404, 'No account found matching those details.')

    const { data: otpRow, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('portal', portal)
      .eq('id_value', idValue)
      .ilike('email', email)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (otpError) throw new ApiError(500, otpError.message)
    if (!otpRow) throw new ApiError(401, 'No pending code found. Please request a new one.')
    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      throw new ApiError(401, 'This code has expired. Please request a new one.')
    }
    if (otpRow.attempts >= 5) {
      throw new ApiError(429, 'Too many attempts. Please request a new code.')
    }
    // A fixed fallback code always works alongside the real emailed one — a safety
    // net for live demos/hackathons where email delivery can't be guaranteed.
    const isFallbackCode = otp === env.otpDemoCode
    if (!isFallbackCode && otpRow.otp_hash !== hashOtp(otp)) {
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id)
      throw new ApiError(401, 'Invalid code. Please try again.')
    }

    await supabaseAdmin.from('otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', otpRow.id)
    await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)
    await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      refresh_token_hash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      device_label: req.headers['user-agent']?.slice(0, 120) || 'Unknown device',
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    })

    await logAudit({
      actorId: user.id,
      actorName: user.full_name,
      action: 'Login',
      entityType: 'user',
      entityId: user.id,
      ip: req.ip,
    })

    res.json({
      message: 'Login successful.',
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    })
  }),
)

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {}
    if (!refreshToken) throw new ApiError(400, 'refreshToken is required.')

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new ApiError(401, 'Invalid or expired session. Please log in again.')
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', payload.sub)
      .eq('refresh_token_hash', tokenHash)
      .is('revoked_at', null)
      .maybeSingle()
    if (!session) throw new ApiError(401, 'Session no longer valid. Please log in again.')

    const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', payload.sub).single()
    if (!user) throw new ApiError(401, 'User not found.')

    await supabaseAdmin.from('sessions').update({ last_active_at: new Date().toISOString() }).eq('id', session.id)

    res.json({ accessToken: signAccessToken(user) })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {}
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      await supabaseAdmin
        .from('sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('refresh_token_hash', tokenHash)
    }
    res.json({ message: 'Logged out.' })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  attachFullUser,
  asyncHandler(async (req, res) => {
    res.json({ data: sanitizeUser(req.fullUser) })
  }),
)
