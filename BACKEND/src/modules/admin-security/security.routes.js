import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { logAudit } from '../audit/audit.service.js'

export const securityRouter = Router()
securityRouter.use(requireAuth, requirePortal('admin'))

securityRouter.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*, users(full_name, email, portal)')
      .is('revoked_at', null)
      .order('last_active_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

securityRouter.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('id', req.params.id)
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { message: 'Session revoked.' } })
  }),
)

securityRouter.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('security_alerts').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

securityRouter.patch(
  '/alerts/:id/resolve',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('security_alerts')
      .update({ status: 'resolved', resolved_by: req.user.id, resolved_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

securityRouter.patch(
  '/alerts/:id/block-ip',
  asyncHandler(async (req, res) => {
    const { data: alert, error: fetchError } = await supabaseAdmin.from('security_alerts').select('ip').eq('id', req.params.id).single()
    if (fetchError) throw new ApiError(404, 'Alert not found')
    if (alert.ip) await supabaseAdmin.from('allowed_ips').delete().eq('ip_or_cidr', alert.ip)
    const { data, error } = await supabaseAdmin
      .from('security_alerts')
      .update({ status: 'blocked' })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

securityRouter.get(
  '/policies',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('app_settings').select('*').eq('category', 'security_policies').maybeSingle()
    if (error) throw new ApiError(500, error.message)
    res.json({ data: data?.value || {} })
  }),
)

securityRouter.patch(
  '/policies',
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin.from('app_settings').select('value').eq('category', 'security_policies').maybeSingle()
    const merged = { ...(existing?.value || {}), ...req.body }
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .update({ value: merged, updated_by: req.user.id, updated_at: new Date().toISOString() })
      .eq('category', 'security_policies')
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Security Policy Updated', entityType: 'settings' })
    res.json({ data: data.value })
  }),
)

securityRouter.get(
  '/access-control',
  asyncHandler(async (req, res) => {
    const [{ data: ips, error: ipsError }, { data: deviceTrust, error: dtError }] = await Promise.all([
      supabaseAdmin.from('allowed_ips').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('app_settings').select('value').eq('category', 'device_trust').maybeSingle(),
    ])
    if (ipsError) throw new ApiError(500, ipsError.message)
    if (dtError) throw new ApiError(500, dtError.message)
    res.json({ data: { allowedIps: ips, deviceTrust: deviceTrust?.value || {} } })
  }),
)

securityRouter.post(
  '/access-control/allowed-ips',
  asyncHandler(async (req, res) => {
    const { ipOrCidr, label } = req.body
    const { data, error } = await supabaseAdmin
      .from('allowed_ips')
      .insert({ ip_or_cidr: ipOrCidr, label, created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

securityRouter.delete(
  '/access-control/allowed-ips/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.from('allowed_ips').delete().eq('id', req.params.id)
    if (error) throw new ApiError(400, error.message)
    res.status(204).send()
  }),
)

securityRouter.patch(
  '/access-control/device-trust',
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin.from('app_settings').select('value').eq('category', 'device_trust').maybeSingle()
    const merged = { ...(existing?.value || {}), ...req.body }
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .update({ value: merged, updated_by: req.user.id, updated_at: new Date().toISOString() })
      .eq('category', 'device_trust')
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: data.value })
  }),
)
