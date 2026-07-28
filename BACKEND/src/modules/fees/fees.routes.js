import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { logAudit } from '../audit/audit.service.js'

export const feesRouter = Router()
feesRouter.use(requireAuth)

// ---- Fee categories ----
feesRouter.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('fee_categories').select('*').order('name')
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

feesRouter.post(
  '/categories',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('fee_categories').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

feesRouter.patch(
  '/categories/:id',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('fee_categories').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Fee structures ----
feesRouter.get(
  '/structures',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin.from('fee_structures').select('*').order('created_at', { ascending: false })
    if (req.query.className) q = q.eq('class_name', req.query.className)
    if (req.query.status) q = q.eq('status', req.query.status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

feesRouter.post(
  '/structures',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const total = (req.body.components || []).reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const { data, error } = await supabaseAdmin
      .from('fee_structures')
      .insert({ ...req.body, total_amount: total, created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Fee Structure Edited', entityType: 'fee_structure', entityId: data.id })
    res.status(201).json({ data })
  }),
)

feesRouter.patch(
  '/structures/:id',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const patch = { ...req.body }
    if (patch.components) patch.total_amount = patch.components.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const { data, error } = await supabaseAdmin.from('fee_structures').update(patch).eq('id', req.params.id).select().single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Fee Structure Edited', entityType: 'fee_structure', entityId: data.id })
    res.json({ data })
  }),
)

feesRouter.patch(
  '/structures/:id/status',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('fee_structures')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Assignment batches ----
feesRouter.get(
  '/assignment-batches',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('assignment_batches').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

feesRouter.post(
  '/assignment-batches/preview',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { classId, section } = req.body
    let q = supabaseAdmin.from('students').select('id', { count: 'exact' }).eq('status', 'active')
    if (classId) q = q.eq('class_name', classId)
    if (section) q = q.eq('section', section)
    const { count, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data: { studentCount: count || 0 } })
  }),
)

feesRouter.post(
  '/assignment-batches',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { feeStructureId, classId, section } = req.body
    const { data: structure, error: structureError } = await supabaseAdmin
      .from('fee_structures')
      .select('*')
      .eq('id', feeStructureId)
      .single()
    if (structureError) throw new ApiError(404, 'Fee structure not found')

    let studentQuery = supabaseAdmin.from('students').select('id').eq('status', 'active')
    if (classId) studentQuery = studentQuery.eq('class_name', classId)
    if (section) studentQuery = studentQuery.eq('section', section)
    const { data: students, error: studentsError } = await studentQuery
    if (studentsError) throw new ApiError(500, studentsError.message)

    if (students.length) {
      const rows = students.map((s) => ({
        student_id: s.id,
        fee_structure_id: structure.id,
        components: structure.components,
        total_amount: structure.total_amount,
        assigned_by: req.user.id,
      }))
      const { error: insertError } = await supabaseAdmin.from('student_fee_assignments').insert(rows)
      if (insertError) throw new ApiError(400, insertError.message)
    }

    const { data: batch, error: batchError } = await supabaseAdmin
      .from('assignment_batches')
      .insert({
        fee_structure_id: structure.id,
        class_name: classId,
        section,
        student_count: students.length,
        created_by: req.user.id,
      })
      .select()
      .single()
    if (batchError) throw new ApiError(400, batchError.message)
    res.status(201).json({ data: batch })
  }),
)

// ---- Single-student fee structure assignment (used by the per-student profile screens) ----
feesRouter.post(
  '/students/:studentId/assign-structure',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { feeStructureId, components } = req.body
    let componentsToUse = components
    let totalAmount

    if (feeStructureId) {
      const { data: structure, error: structureError } = await supabaseAdmin
        .from('fee_structures')
        .select('*')
        .eq('id', feeStructureId)
        .single()
      if (structureError) throw new ApiError(404, 'Fee structure not found')
      componentsToUse = componentsToUse || structure.components
      totalAmount = structure.total_amount
    } else if (components) {
      totalAmount = components.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    } else {
      throw new ApiError(400, 'feeStructureId or components is required.')
    }

    const { data, error } = await supabaseAdmin
      .from('student_fee_assignments')
      .insert({
        student_id: req.params.studentId,
        fee_structure_id: feeStructureId || null,
        components: componentsToUse,
        total_amount: totalAmount,
        assigned_by: req.user.id,
      })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: 'Fee Structure Edited', entityType: 'student_fee_assignment', entityId: data.id })
    res.status(201).json({ data })
  }),
)

// ---- Scholarships ----
feesRouter.get(
  '/scholarships/policies',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('scholarship_policies').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

feesRouter.post(
  '/scholarships/policies',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('scholarship_policies').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

feesRouter.patch(
  '/scholarships/policies/:id/toggle',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('scholarship_policies')
      .select('status')
      .eq('id', req.params.id)
      .single()
    if (fetchError) throw new ApiError(404, 'Policy not found')
    const nextStatus = current.status === 'active' ? 'inactive' : 'active'
    const { data, error } = await supabaseAdmin
      .from('scholarship_policies')
      .update({ status: nextStatus })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

feesRouter.get(
  '/scholarships/recipients',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('student_scholarships')
      .select('*, students(full_name, admission_no, class_name), scholarship_policies(name)')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Student-scoped sub-resources ----
function studentSubResource(table) {
  const router = Router({ mergeParams: true })

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('student_id', req.params.studentId)
        .order('created_at', { ascending: false })
      if (error) throw new ApiError(500, error.message)
      res.json({ data })
    }),
  )

  router.post(
    '/',
    requirePortal('accountant', 'admin'),
    asyncHandler(async (req, res) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .insert({ ...req.body, student_id: req.params.studentId, created_by: req.user.id })
        .select()
        .single()
      if (error) throw new ApiError(400, error.message)
      res.status(201).json({ data })
    }),
  )

  return router
}

feesRouter.use('/students/:studentId/scholarships', studentSubResource('student_scholarships'))
feesRouter.use('/students/:studentId/discounts', studentSubResource('student_discounts'))
feesRouter.use('/students/:studentId/concessions', studentSubResource('student_concessions'))
feesRouter.use('/students/:studentId/misc-charges', studentSubResource('misc_charges'))

feesRouter.get(
  '/students/:studentId/adjustment-history',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('fee_adjustment_requests')
      .select('*')
      .eq('student_id', req.params.studentId)
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Adjustment requests (global queue for accountant/admin) ----
feesRouter.get(
  '/adjustment-requests',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin
      .from('fee_adjustment_requests')
      .select('*, students(full_name, admission_no)')
      .order('created_at', { ascending: false })
    if (req.query.status) q = q.eq('status', req.query.status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

feesRouter.post(
  '/adjustment-requests',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('fee_adjustment_requests')
      .insert({ ...req.body, requested_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

feesRouter.patch(
  '/adjustment-requests/:id/decision',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { decision } = req.body // 'approved' | 'rejected'
    const { data, error } = await supabaseAdmin
      .from('fee_adjustment_requests')
      .update({ status: decision, decided_by: req.user.id, decided_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)
