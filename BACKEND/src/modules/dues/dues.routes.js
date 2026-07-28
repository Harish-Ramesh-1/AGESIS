import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { sendEmail } from '../../config/mailer.js'
import { sendSms } from '../../config/sms.js'
import { logAudit } from '../audit/audit.service.js'

export const duesRouter = Router()
duesRouter.use(requireAuth)

function scopeToParent(query, req) {
  if (req.user.portal === 'parent') return query.eq('students.parent_user_id', req.user.id)
  return query
}

duesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, classId, studentId, query } = req.query
    let q = supabaseAdmin
      .from('dues')
      .select('*, students!inner(full_name, admission_no, class_name, section, parent_user_id)')
      .order('due_date', { ascending: true })
    if (status) q = q.eq('status', status)
    if (classId) q = q.eq('students.class_name', classId)
    if (studentId) q = q.eq('student_id', studentId)
    q = scopeToParent(q, req)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)

    let rows = data
    if (query) {
      const needle = String(query).toLowerCase()
      rows = rows.filter((d) => d.students?.full_name?.toLowerCase().includes(needle))
    }
    res.json({ data: rows })
  }),
)

duesRouter.get(
  '/overdue',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin
      .from('dues')
      .select('*, students!inner(full_name, admission_no, class_name, section, parent_user_id)')
      .lt('due_date', new Date().toISOString().slice(0, 10))
      .in('status', ['pending', 'overdue', 'partially_paid'])
      .order('due_date', { ascending: true })
    q = scopeToParent(q, req)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

duesRouter.get(
  '/analytics',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('dues').select('amount_due, amount_paid, status')
    if (error) throw new ApiError(500, error.message)
    const totalOutstanding = data
      .filter((d) => d.status !== 'paid')
      .reduce((sum, d) => sum + Number(d.amount_due) - Number(d.amount_paid), 0)
    const overdueCount = data.filter((d) => d.status === 'overdue').length
    const pendingCount = data.filter((d) => d.status === 'pending').length
    res.json({ data: { totalOutstanding, overdueCount, pendingCount, totalDues: data.length } })
  }),
)

duesRouter.patch(
  '/:id/escalate',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('dues')
      .update({ status: 'escalated', escalated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Due Escalated', entityType: 'due', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Reminders ----
duesRouter.post(
  '/:id/reminders',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { channel = 'email', message } = req.body
    const { data: due, error: dueError } = await supabaseAdmin
      .from('dues')
      .select('*, students(full_name, guardian_email, guardian_phone)')
      .eq('id', req.params.id)
      .single()
    if (dueError) throw new ApiError(404, 'Due not found')

    const body = message || `Reminder: a fee of ${due.amount_due} is due on ${due.due_date} for ${due.students.full_name}.`
    if (channel === 'email' || channel === 'all') {
      await sendEmail({ to: due.students.guardian_email, subject: 'Fee Payment Reminder', text: body })
    }
    if (channel === 'sms' || channel === 'all') {
      await sendSms({ to: due.students.guardian_phone, body })
    }

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .insert({ due_id: due.id, student_id: due.student_id, channel, message: body, status: 'sent' })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

duesRouter.post(
  '/reminders/bulk',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { filters = {}, channel = 'email', message } = req.body
    let q = supabaseAdmin
      .from('dues')
      .select('*, students!inner(full_name, guardian_email, guardian_phone, class_name)')
      .in('status', ['pending', 'overdue'])
    if (filters.classId) q = q.eq('students.class_name', filters.classId)
    const { data: dues, error } = await q
    if (error) throw new ApiError(500, error.message)

    const campaign = await supabaseAdmin
      .from('reminder_campaigns')
      .insert({ name: `Bulk reminder ${new Date().toISOString()}`, filters, channel, message_template: message, status: 'sent', created_by: req.user.id })
      .select()
      .single()

    for (const due of dues) {
      const body = message || `Reminder: a fee of ${due.amount_due} is due on ${due.due_date} for ${due.students.full_name}.`
      if (channel === 'email' || channel === 'all') await sendEmail({ to: due.students.guardian_email, subject: 'Fee Payment Reminder', text: body })
      if (channel === 'sms' || channel === 'all') await sendSms({ to: due.students.guardian_phone, body })
      await supabaseAdmin.from('reminders').insert({
        due_id: due.id,
        student_id: due.student_id,
        campaign_id: campaign.data?.id,
        channel,
        message: body,
        status: 'sent',
      })
    }

    res.status(201).json({ data: { sentCount: dues.length, campaignId: campaign.data?.id } })
  }),
)

duesRouter.get(
  '/reminders/history',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*, students(full_name, admission_no)')
      .order('sent_at', { ascending: false })
      .limit(200)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

duesRouter.get(
  '/reminders/campaigns',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('reminder_campaigns').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Late fees ----
duesRouter.get(
  '/late-fees/rules',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('late_fee_rules').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

duesRouter.patch(
  '/late-fees/rules',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabaseAdmin.from('late_fee_rules').select('id').limit(1).maybeSingle()
    const payload = { ...req.body, updated_at: new Date().toISOString() }
    const query = existing
      ? supabaseAdmin.from('late_fee_rules').update(payload).eq('id', existing.id)
      : supabaseAdmin.from('late_fee_rules').insert(payload)
    const { data, error } = await query.select().single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

duesRouter.post(
  '/late-fees/calculate',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { dueId } = req.body
    const { data: due, error: dueError } = await supabaseAdmin.from('dues').select('*').eq('id', dueId).single()
    if (dueError) throw new ApiError(404, 'Due not found')
    const { data: rule } = await supabaseAdmin.from('late_fee_rules').select('*').eq('active', true).limit(1).maybeSingle()
    if (!rule) return res.json({ data: { amount: 0 } })

    const daysLate = Math.max(0, Math.floor((Date.now() - new Date(due.due_date).getTime()) / 86400000) - rule.grace_days)
    if (daysLate <= 0) return res.json({ data: { amount: 0 } })
    const amount = rule.fee_type === 'percent' ? (Number(due.amount_due) * Number(rule.amount)) / 100 : Number(rule.amount)
    res.json({ data: { amount, daysLate } })
  }),
)

duesRouter.post(
  '/late-fees/apply',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { dueId, amount } = req.body
    const { data: due } = await supabaseAdmin.from('dues').select('student_id').eq('id', dueId).single()
    const { data, error } = await supabaseAdmin
      .from('late_fee_charges')
      .insert({ due_id: dueId, student_id: due?.student_id, amount, status: 'applied' })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

duesRouter.patch(
  '/late-fees/:id/waive',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { reason } = req.body
    const { data, error } = await supabaseAdmin
      .from('late_fee_charges')
      .update({ status: 'waived', waived_by: req.user.id, waived_reason: reason })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Late Fee Waived', entityType: 'late_fee_charge', entityId: data.id, details: { reason } })
    res.json({ data })
  }),
)

duesRouter.patch(
  '/late-fees/:id/approve-waiver',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('late_fee_charges')
      .update({ approved_waiver: true })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

duesRouter.get(
  '/late-fees/history',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('late_fee_charges')
      .select('*, students(full_name, admission_no)')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
