import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { generateInvoiceNo, generateReceiptNo } from '../../utils/ids.js'
import { generateInvoicePdf, generateReceiptPdf } from '../../utils/pdf.js'
import { uploadPdf } from '../../utils/storage.js'
import { sendEmail } from '../../config/mailer.js'
import { logAudit } from '../audit/audit.service.js'

export const documentsRouter = Router()
documentsRouter.use(requireAuth)

function scopeToParent(query, req, alias = 'students') {
  if (req.user.portal === 'parent') return query.eq(`${alias}.parent_user_id`, req.user.id)
  return query
}

// ---- Templates ----
documentsRouter.get(
  '/templates',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('document_templates').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

documentsRouter.post(
  '/templates',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('document_templates').insert(req.body).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

documentsRouter.patch(
  '/templates/:id/default',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: tpl } = await supabaseAdmin.from('document_templates').select('type').eq('id', req.params.id).single()
    if (tpl) await supabaseAdmin.from('document_templates').update({ is_default: false }).eq('type', tpl.type)
    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .update({ is_default: true })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

documentsRouter.post(
  '/templates/:id/duplicate',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (fetchError) throw new ApiError(404, 'Template not found')
    const { id, created_at, ...rest } = original
    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .insert({ ...rest, name: `${rest.name} (Copy)`, is_default: false })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

// ---- Invoices ----
async function buildInvoiceForStudent({ studentId, feeStructureId, createdBy }) {
  const { data: student, error: studentError } = await supabaseAdmin.from('students').select('*').eq('id', studentId).single()
  if (studentError) throw new ApiError(404, 'Student not found')

  let items = []
  let subtotal = 0
  if (feeStructureId) {
    const { data: structure } = await supabaseAdmin.from('fee_structures').select('*').eq('id', feeStructureId).single()
    items = structure?.components || []
    subtotal = Number(structure?.total_amount || 0)
  } else {
    const { data: assignment } = await supabaseAdmin
      .from('student_fee_assignments')
      .select('*')
      .eq('student_id', studentId)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    items = assignment?.components || []
    subtotal = Number(assignment?.total_amount || 0)
  }

  const invoiceNo = generateInvoiceNo()
  const { data: invoice, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      invoice_no: invoiceNo,
      student_id: studentId,
      fee_structure_id: feeStructureId || null,
      items,
      subtotal,
      tax: 0,
      total: subtotal,
      status: 'issued',
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) throw new ApiError(400, error.message)

  const pdfBuffer = await generateInvoicePdf({ invoice, student })
  const pdfUrl = await uploadPdf(`invoices/${invoice.id}.pdf`, pdfBuffer)
  await supabaseAdmin.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoice.id)
  await supabaseAdmin.from('document_activity').insert({ document_type: 'invoice', document_id: invoice.id, action: 'generated', actor_id: createdBy })

  return { ...invoice, pdf_url: pdfUrl, student }
}

documentsRouter.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin
      .from('invoices')
      .select('*, students!inner(full_name, admission_no, parent_user_id)')
      .order('created_at', { ascending: false })
    q = scopeToParent(q, req)
    if (req.query.status) q = q.eq('status', req.query.status)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

documentsRouter.get(
  '/invoices/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('invoices').select('*, students(*)').eq('id', req.params.id).single()
    if (error) throw new ApiError(404, 'Invoice not found')
    res.json({ data })
  }),
)

documentsRouter.post(
  '/invoices',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { studentId, feeStructureId } = req.body
    const invoice = await buildInvoiceForStudent({ studentId, feeStructureId, createdBy: req.user.id })
    res.status(201).json({ data: invoice })
  }),
)

documentsRouter.post(
  '/invoices/bulk',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { classId, section } = req.body
    let q = supabaseAdmin.from('students').select('id').eq('status', 'active')
    if (classId) q = q.eq('class_name', classId)
    if (section) q = q.eq('section', section)
    const { data: students, error } = await q
    if (error) throw new ApiError(500, error.message)

    let successCount = 0
    let failedCount = 0
    for (const student of students) {
      try {
        await buildInvoiceForStudent({ studentId: student.id, createdBy: req.user.id })
        successCount++
      } catch {
        failedCount++
      }
    }

    const { data: run, error: runError } = await supabaseAdmin
      .from('bulk_generation_runs')
      .insert({
        document_type: 'invoice',
        class_name: classId,
        section,
        total_count: students.length,
        success_count: successCount,
        failed_count: failedCount,
        created_by: req.user.id,
      })
      .select()
      .single()
    if (runError) throw new ApiError(400, runError.message)
    res.status(201).json({ data: run })
  }),
)

documentsRouter.get(
  '/invoices/bulk/history',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('bulk_generation_runs')
      .select('*')
      .eq('document_type', 'invoice')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Receipts ----
documentsRouter.get(
  '/receipts',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin
      .from('receipts')
      .select('*, students!inner(full_name, admission_no, parent_user_id)')
      .order('created_at', { ascending: false })
    q = scopeToParent(q, req)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

documentsRouter.get(
  '/receipts/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('receipts').select('*, students(*)').eq('id', req.params.id).single()
    if (error) throw new ApiError(404, 'Receipt not found')
    res.json({ data })
  }),
)

// Parents may generate a receipt for their own just-completed payment (called
// right after /payments/verify); accountant/admin may generate one for anyone.
documentsRouter.post(
  '/receipts',
  asyncHandler(async (req, res) => {
    const { paymentId } = req.body
    const { data: payment, error: paymentError } = await supabaseAdmin.from('payments').select('*, students(*)').eq('id', paymentId).single()
    if (paymentError) throw new ApiError(404, 'Payment not found')

    if (req.user.portal === 'parent' && payment.students?.parent_user_id !== req.user.id) {
      throw new ApiError(403, 'Not authorized for this payment')
    }

    const receiptNo = generateReceiptNo()
    const { data: receipt, error } = await supabaseAdmin
      .from('receipts')
      .insert({
        receipt_no: receiptNo,
        payment_id: payment.id,
        student_id: payment.student_id,
        items: [{ description: 'Fee Payment', amount: payment.amount }],
        amount: payment.amount,
        created_by: req.user.id,
      })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)

    const pdfBuffer = await generateReceiptPdf({ receipt, student: payment.students })
    const pdfUrl = await uploadPdf(`receipts/${receipt.id}.pdf`, pdfBuffer)
    await supabaseAdmin.from('receipts').update({ pdf_url: pdfUrl }).eq('id', receipt.id)
    await supabaseAdmin.from('document_activity').insert({ document_type: 'receipt', document_id: receipt.id, action: 'generated', actor_id: req.user.id })

    res.status(201).json({ data: { ...receipt, pdf_url: pdfUrl } })
  }),
)

// ---- Combined document archive ----
documentsRouter.get(
  '/archive',
  asyncHandler(async (req, res) => {
    let invoiceQuery = supabaseAdmin
      .from('invoices')
      .select('id, invoice_no, total, status, created_at, pdf_url, students!inner(full_name, admission_no, parent_user_id)')
    let receiptQuery = supabaseAdmin
      .from('receipts')
      .select('id, receipt_no, amount, created_at, pdf_url, students!inner(full_name, admission_no, parent_user_id)')
    invoiceQuery = scopeToParent(invoiceQuery, req)
    receiptQuery = scopeToParent(receiptQuery, req)

    const [{ data: invoices, error: invError }, { data: receipts, error: rcpError }] = await Promise.all([invoiceQuery, receiptQuery])
    if (invError) throw new ApiError(500, invError.message)
    if (rcpError) throw new ApiError(500, rcpError.message)

    const combined = [
      ...invoices.map((i) => ({ id: i.id, type: 'invoice', number: i.invoice_no, amount: i.total, status: i.status, createdAt: i.created_at, pdfUrl: i.pdf_url, student: i.students })),
      ...receipts.map((r) => ({ id: r.id, type: 'receipt', number: r.receipt_no, amount: r.amount, status: 'issued', createdAt: r.created_at, pdfUrl: r.pdf_url, student: r.students })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({ data: combined })
  }),
)

documentsRouter.get(
  '/:type(invoice|receipt)/:id/activity',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('document_activity')
      .select('*')
      .eq('document_type', req.params.type)
      .eq('document_id', req.params.id)
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

async function recordDocAction(req, res, action) {
  const { type, id } = req.params
  await supabaseAdmin.from('document_activity').insert({ document_type: type, document_id: id, action, actor_id: req.user.id })
  res.json({ data: { message: `Document ${action}` } })
}

documentsRouter.post(
  '/:type(invoice|receipt)/:id/email',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const table = req.params.type === 'invoice' ? 'invoices' : 'receipts'
    const { data: doc } = await supabaseAdmin.from(table).select('*, students(guardian_email)').eq('id', req.params.id).single()
    if (doc) {
      await sendEmail({
        to: req.body.email || doc.students?.guardian_email,
        subject: `Your ${req.params.type} from AGESIS School`,
        text: `Please find your ${req.params.type} attached.`,
        attachments: doc.pdf_url ? [{ filename: `${req.params.type}.pdf`, path: doc.pdf_url }] : undefined,
      })
    }
    await recordDocAction(req, res, 'emailed')
  }),
)

documentsRouter.post('/:type(invoice|receipt)/:id/share', requirePortal('accountant', 'admin'), asyncHandler((req, res) => recordDocAction(req, res, 'shared')))
documentsRouter.post('/:type(invoice|receipt)/:id/downloaded', asyncHandler((req, res) => recordDocAction(req, res, 'downloaded')))
documentsRouter.post('/:type(invoice|receipt)/:id/printed', asyncHandler((req, res) => recordDocAction(req, res, 'printed')))

documentsRouter.delete(
  '/:type(invoice|receipt)/:id',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const table = req.params.type === 'invoice' ? 'invoices' : 'receipts'
    const { error } = await supabaseAdmin.from(table).delete().eq('id', req.params.id)
    if (error) throw new ApiError(400, error.message)
    await supabaseAdmin.from('document_activity').insert({ document_type: req.params.type, document_id: req.params.id, action: 'deleted', actor_id: req.user.id })
    await logAudit({ actorId: req.user.id, action: 'Document Deleted', entityType: req.params.type, entityId: req.params.id })
    res.status(204).send()
  }),
)
