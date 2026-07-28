import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { logAudit } from '../audit/audit.service.js'

export const backupRouter = Router()
backupRouter.use(requireAuth, requirePortal('admin'))

backupRouter.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('app_settings').select('value').eq('category', 'backup_schedule').maybeSingle()
    if (error) throw new ApiError(500, error.message)
    res.json({ data: data?.value || {} })
  }),
)

backupRouter.patch(
  '/schedule',
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin.from('app_settings').select('value').eq('category', 'backup_schedule').maybeSingle()
    const merged = { ...(existing?.value || {}), ...req.body }
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .update({ value: merged, updated_by: req.user.id, updated_at: new Date().toISOString() })
      .eq('category', 'backup_schedule')
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: data.value })
  }),
)

backupRouter.post(
  '/run',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('backup_jobs')
      .insert({ type: 'manual', status: 'completed', created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Backup Restored', entityType: 'backup', entityId: data.id, details: { note: 'Manual backup run' } })
    res.status(201).json({ data })
  }),
)

backupRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('backup_jobs').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

backupRouter.get(
  '/snapshots',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('backup_jobs').select('*').eq('status', 'completed').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

backupRouter.post(
  '/snapshots/:id/restore',
  asyncHandler(async (req, res) => {
    await logAudit({ actorId: req.user.id, action: 'Backup Restored', entityType: 'backup', entityId: req.params.id })
    res.json({ data: { message: 'Restore initiated.' } })
  }),
)

backupRouter.get(
  '/exports',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('export_jobs').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

backupRouter.post(
  '/exports',
  asyncHandler(async (req, res) => {
    const { module, format } = req.body
    const { data, error } = await supabaseAdmin
      .from('export_jobs')
      .insert({ module, format, status: 'completed', requested_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)
