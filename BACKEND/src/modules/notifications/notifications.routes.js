import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { sendEmail } from '../../config/mailer.js'
import { sendSms } from '../../config/sms.js'

export const notificationsRouter = Router()
notificationsRouter.use(requireAuth)

// ---- Per-user notification center ----
notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(user_id.is.null,portal.eq.${req.user.portal})`)
      .order('created_at', { ascending: false })
      .limit(100)
    if (req.query.type) q = q.eq('type', req.query.type)
    if (req.query.read !== undefined) q = q.eq('read', req.query.read === 'true')
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

notificationsRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('notifications').update({ read: true }).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

notificationsRouter.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin.from('notifications').update({ read: true }).eq('user_id', req.user.id).eq('read', false)
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { message: 'All notifications marked read.' } })
  }),
)

// ---- Announcements (admin broadcast) ----
notificationsRouter.get(
  '/announcements',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

notificationsRouter.post(
  '/announcements',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { title, message, audience = {}, channel = 'email' } = req.body

    let studentQuery = supabaseAdmin.from('students').select('parent_user_id, guardian_email, guardian_phone').eq('status', 'active')
    if (audience.classes?.length) studentQuery = studentQuery.in('class_name', audience.classes)
    const { data: students } = await studentQuery

    const recipients = students || []
    for (const student of recipients) {
      if (student.parent_user_id) {
        await supabaseAdmin.from('notifications').insert({ user_id: student.parent_user_id, portal: 'parent', title, message, type: 'info' })
      }
      if (channel === 'email' || channel === 'all') await sendEmail({ to: student.guardian_email, subject: title, text: message })
      if (channel === 'sms' || channel === 'all') await sendSms({ to: student.guardian_phone, body: message })
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({ title, message, audience, channel, sent_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data: { ...data, recipientCount: recipients.length } })
  }),
)

// ---- Notification templates ----
notificationsRouter.get(
  '/templates',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('notification_templates').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

notificationsRouter.post(
  '/templates',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('notification_templates').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

notificationsRouter.patch(
  '/templates/:id',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('notification_templates')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

notificationsRouter.post(
  '/templates/:id/duplicate',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (fetchError) throw new ApiError(404, 'Template not found')
    const { id, created_at, updated_at, ...rest } = original
    const { data, error } = await supabaseAdmin
      .from('notification_templates')
      .insert({ ...rest, name: `${rest.name} (Copy)` })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

// ---- Scheduled notifications ----
notificationsRouter.get(
  '/scheduled',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('scheduled_notifications').select('*').order('scheduled_at', { ascending: true })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

notificationsRouter.post(
  '/scheduled',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('scheduled_notifications')
      .insert({ ...req.body, created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

notificationsRouter.patch(
  '/scheduled/:id/cancel',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('scheduled_notifications')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

notificationsRouter.patch(
  '/scheduled/:id',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('scheduled_notifications')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Delivery logs ----
notificationsRouter.get(
  '/logs',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin.from('notification_logs').select('*').order('created_at', { ascending: false }).limit(300)
    if (req.query.channel) q = q.eq('channel', req.query.channel)
    if (req.query.status) q = q.eq('status', req.query.status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
