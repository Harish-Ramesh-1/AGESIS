import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js'
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
  '/login',
  asyncHandler(async (req, res) => {
    const { portal, idValue, email, password } = req.body || {}
    if (!PORTALS.includes(portal) || !idValue || !email || !password) {
      throw new ApiError(400, 'portal, idValue, email and password are required.')
    }

    const user = await findUser({ portal, idValue, email })
    if (!user) throw new ApiError(404, 'No account found matching those details.')
    if (user.status === 'suspended') throw new ApiError(403, 'This account has been suspended.')
    if (user.status === 'rejected') throw new ApiError(403, 'This account is not active.')
    if (!user.password_hash) throw new ApiError(401, 'No password has been set for this account yet.')

    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) throw new ApiError(401, 'Incorrect password. Please try again.')

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
