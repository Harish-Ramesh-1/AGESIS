import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { sendEmail } from '../../config/mailer.js'
import { logAudit } from '../audit/audit.service.js'

export const adminUsersRouter = Router()
adminUsersRouter.use(requireAuth, requirePortal('admin'))

adminUsersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { portal, status, query } = req.query
    let q = supabaseAdmin.from('users').select('*, roles(name)').order('created_at', { ascending: false })
    if (portal) q = q.eq('portal', portal)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    let rows = data
    if (query) {
      const needle = String(query).toLowerCase()
      rows = rows.filter((u) => `${u.full_name} ${u.email} ${u.unique_id}`.toLowerCase().includes(needle))
    }
    res.json({ data: rows })
  }),
)

adminUsersRouter.patch(
  '/:id/suspend',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').update({ status: 'suspended' }).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'User Suspended', entityType: 'user', entityId: data.id })
    res.json({ data })
  }),
)

adminUsersRouter.patch(
  '/:id/reactivate',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').update({ status: 'active' }).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'User Reactivated', entityType: 'user', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Invites ----
adminUsersRouter.get(
  '/invites',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('user_invites').select('*, roles(name)').order('invited_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.post(
  '/invites',
  asyncHandler(async (req, res) => {
    const { email, portal, roleId } = req.body
    const { data, error } = await supabaseAdmin
      .from('user_invites')
      .insert({ email, portal, role_id: roleId, invited_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await sendEmail({ to: email, subject: 'You have been invited to AGESIS', text: `You have been invited to join the ${portal} portal.` })
    await logAudit({ actorId: req.user.id, action: 'User Invited', entityType: 'invite', entityId: data.id, details: { email } })
    res.status(201).json({ data })
  }),
)

adminUsersRouter.post(
  '/invites/:id/resend',
  asyncHandler(async (req, res) => {
    const { data: invite, error: fetchError } = await supabaseAdmin.from('user_invites').select('*').eq('id', req.params.id).single()
    if (fetchError) throw new ApiError(404, 'Invite not found')
    await sendEmail({ to: invite.email, subject: 'Reminder: You have been invited to AGESIS', text: 'Please complete your registration.' })
    const { data, error } = await supabaseAdmin
      .from('user_invites')
      .update({ resent_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Pending approvals ----
adminUsersRouter.get(
  '/pending-approvals',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.patch(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').update({ status: 'active' }).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'User Approved', entityType: 'user', entityId: data.id })
    res.json({ data })
  }),
)

adminUsersRouter.patch(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').update({ status: 'rejected' }).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'User Rejected', entityType: 'user', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Suspended accounts ----
adminUsersRouter.get(
  '/suspended',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('status', 'suspended').order('updated_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Roles & permissions ----
adminUsersRouter.get(
  '/roles',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('roles').select('*').order('portal')
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.get(
  '/roles/permission-matrix',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('roles').select('id, name, portal, permissions')
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.patch(
  '/roles/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('roles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Permission Matrix Updated', entityType: 'role', entityId: data.id })
    res.json({ data })
  }),
)

adminUsersRouter.get(
  '/roles/assignable-users',
  asyncHandler(async (req, res) => {
    const { query } = req.query
    let q = supabaseAdmin.from('users').select('id, full_name, email, unique_id, portal').eq('status', 'active').limit(20)
    if (query) q = q.ilike('full_name', `%${query}%`)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.get(
  '/roles/change-log',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('role_change_logs')
      .select('*, users!role_change_logs_user_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

adminUsersRouter.post(
  '/roles/assign',
  asyncHandler(async (req, res) => {
    const { userId, newRoleId } = req.body
    const { data: user, error: userError } = await supabaseAdmin.from('users').select('role_id, roles(name)').eq('id', userId).single()
    if (userError) throw new ApiError(404, 'User not found')

    const { data: newRole } = await supabaseAdmin.from('roles').select('name').eq('id', newRoleId).single()

    const { data, error } = await supabaseAdmin.from('users').update({ role_id: newRoleId }).eq('id', userId).select().single()
    if (error) throw new ApiError(400, error.message)

    await supabaseAdmin.from('role_change_logs').insert({
      user_id: userId,
      previous_role: user.roles?.name,
      new_role: newRole?.name,
      changed_by: req.user.id,
    })
    await logAudit({ actorId: req.user.id, action: 'Role Changed', entityType: 'user', entityId: userId })
    res.json({ data })
  }),
)
