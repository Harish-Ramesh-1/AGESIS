import { Router } from 'express'
import crypto from 'crypto'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { sendEmail, isEmailLive } from '../../config/mailer.js'
import { sendSms, isSmsLive } from '../../config/sms.js'
import { isPaymentsLive } from '../../config/razorpay.js'
import { logAudit } from '../audit/audit.service.js'

export const integrationsRouter = Router()
integrationsRouter.use(requireAuth, requirePortal('admin'))

async function getSetting(category) {
  const { data } = await supabaseAdmin.from('app_settings').select('value').eq('category', category).maybeSingle()
  return data?.value || {}
}

async function patchSetting(category, patch, userId) {
  const current = await getSetting(category)
  const merged = { ...current, ...patch }
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .update({ value: merged, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('category', category)
    .select()
    .single()
  if (error) throw new ApiError(400, error.message)
  return data.value
}

// ---- Payment gateway ----
integrationsRouter.get(
  '/payment-gateway',
  asyncHandler(async (req, res) => {
    const value = await getSetting('payment_gateway')
    res.json({ data: { ...value, keyConfigured: isPaymentsLive } })
  }),
)

integrationsRouter.post(
  '/payment-gateway/regenerate-key',
  asyncHandler(async (req, res) => {
    const value = await patchSetting('payment_gateway', { lastRotatedAt: new Date().toISOString() }, req.user.id)
    await logAudit({ actorId: req.user.id, action: 'Integration Configured', entityType: 'payment_gateway' })
    res.json({ data: value })
  }),
)

integrationsRouter.post(
  '/payment-gateway/test',
  asyncHandler(async (req, res) => {
    res.json({ data: { success: isPaymentsLive, message: isPaymentsLive ? 'Razorpay connection OK.' : 'Running in simulated mode — add RAZORPAY_KEY_ID/SECRET to go live.' } })
  }),
)

// ---- SMS ----
integrationsRouter.get(
  '/sms',
  asyncHandler(async (req, res) => {
    const value = await getSetting('sms_config')
    res.json({ data: { ...value, configured: isSmsLive } })
  }),
)

integrationsRouter.post(
  '/sms/test',
  asyncHandler(async (req, res) => {
    const result = await sendSms({ to: req.body.phoneNumber, body: 'This is a test SMS from AGESIS School.' })
    res.json({ data: result })
  }),
)

// ---- Email ----
integrationsRouter.get(
  '/email',
  asyncHandler(async (req, res) => {
    const value = await getSetting('email_config')
    res.json({ data: { ...value, configured: isEmailLive } })
  }),
)

integrationsRouter.post(
  '/email/test',
  asyncHandler(async (req, res) => {
    const result = await sendEmail({ to: req.body.emailAddress, subject: 'AGESIS test email', text: 'This is a test email.' })
    res.json({ data: result })
  }),
)

// ---- API keys ----
integrationsRouter.get(
  '/api-keys',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('api_keys').select('id, label, key_prefix, created_at, last_used_at, revoked_at').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

integrationsRouter.post(
  '/api-keys',
  asyncHandler(async (req, res) => {
    const rawKey = `agesis_${crypto.randomBytes(24).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({ label: req.body.label, key_prefix: rawKey.slice(0, 12), key_hash: keyHash, created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data: { ...data, key: rawKey } })
  }),
)

integrationsRouter.delete(
  '/api-keys/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', req.params.id)
    if (error) throw new ApiError(400, error.message)
    res.status(204).send()
  }),
)

// ---- Webhooks ----
integrationsRouter.get(
  '/webhooks',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('webhooks').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

integrationsRouter.post(
  '/webhooks',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('webhooks').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)
