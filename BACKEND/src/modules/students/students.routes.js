import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { logAudit } from '../audit/audit.service.js'

export const studentsRouter = Router()
studentsRouter.use(requireAuth)

function scopeToParent(query, req) {
  if (req.user.portal === 'parent') return query.eq('parent_user_id', req.user.id)
  return query
}

// ---- Directory / listing ----
studentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { classId, className, section, status, query } = req.query
    let q = supabaseAdmin.from('students').select('*').order('full_name', { ascending: true })
    q = scopeToParent(q, req)
    if (className || classId) q = q.eq('class_name', className || classId)
    if (section) q = q.eq('section', section)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)

    let rows = data
    if (query) {
      const needle = String(query).toLowerCase()
      rows = rows.filter((s) => `${s.full_name} ${s.admission_no}`.toLowerCase().includes(needle))
    }
    res.json({ data: rows })
  }),
)

studentsRouter.get(
  '/me/children',
  requirePortal('parent'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('students').select('*').eq('parent_user_id', req.user.id)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

studentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin.from('students').select('*').eq('id', req.params.id)
    q = scopeToParent(q, req)
    const { data, error } = await q.maybeSingle()
    if (error) throw new ApiError(500, error.message)
    if (!data) throw new ApiError(404, 'Student not found')
    res.json({ data })
  }),
)

studentsRouter.post(
  '/',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('students').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Student Record Created', entityType: 'student', entityId: data.id })
    res.status(201).json({ data })
  }),
)

studentsRouter.patch(
  '/:id',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('students').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Student Record Updated', entityType: 'student', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Financial snapshot ----
studentsRouter.get(
  '/:id/outstanding',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('dues')
      .select('amount_due, amount_paid, status')
      .eq('student_id', req.params.id)
      .in('status', ['pending', 'overdue', 'partially_paid'])
    if (error) throw new ApiError(500, error.message)
    const outstanding = data.reduce((sum, d) => sum + Number(d.amount_due) - Number(d.amount_paid), 0)
    res.json({ data: { outstanding, dueCount: data.length } })
  }),
)

studentsRouter.get(
  '/:id/fee-structure',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('student_fee_assignments')
      .select('*, fee_structures(*)')
      .eq('student_id', req.params.id)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Admissions ----
studentsRouter.get(
  '/admissions/list',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('admissions').select('*').order('submitted_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

studentsRouter.post(
  '/admissions/list',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('admissions').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

studentsRouter.patch(
  '/admissions/:id/status',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.body
    const { data, error } = await supabaseAdmin
      .from('admissions')
      .update({ status, decided_at: new Date().toISOString(), decided_by: req.user.id })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Promotion ----
studentsRouter.get(
  '/promotion/candidates',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { currentClass } = req.query
    let q = supabaseAdmin.from('students').select('*').eq('status', 'active')
    if (currentClass) q = q.eq('class_name', currentClass)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Transfer requests ----
studentsRouter.get(
  '/transfer-requests/list',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('transfer_requests')
      .select('*, students(full_name, admission_no)')
      .order('requested_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Bulk import ----
studentsRouter.get(
  '/import/history',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('import_jobs')
      .select('*')
      .eq('module', 'students')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
