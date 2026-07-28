import { Router } from 'express'
import crypto from 'crypto'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { razorpay, isPaymentsLive } from '../../config/razorpay.js'
import { env } from '../../config/env.js'
import { generatePaymentRef } from '../../utils/ids.js'
import { logAudit } from '../audit/audit.service.js'
import { notifyUser } from '../notifications/notifications.service.js'

export const paymentsRouter = Router()
paymentsRouter.use(requireAuth)

function scopeToParent(query, req, alias = 'students') {
  if (req.user.portal === 'parent') return query.eq(`${alias}.parent_user_id`, req.user.id)
  return query
}

async function markDuePaid(dueId, amount) {
  if (!dueId) return
  const { data: due } = await supabaseAdmin.from('dues').select('*').eq('id', dueId).single()
  if (!due) return
  const newPaid = Number(due.amount_paid) + Number(amount)
  const status = newPaid >= Number(due.amount_due) ? 'paid' : 'partially_paid'
  await supabaseAdmin.from('dues').update({ amount_paid: newPaid, status }).eq('id', dueId)
}

// ---- Checkout (Razorpay order creation — used by the parent "Pay Fees" flow) ----
paymentsRouter.post(
  '/checkout',
  requirePortal('parent'),
  asyncHandler(async (req, res) => {
    const { studentId, dueId, amount, method = 'razorpay' } = req.body
    if (!studentId || !amount) throw new ApiError(400, 'studentId and amount are required.')

    const referenceNo = generatePaymentRef()
    let orderId = `demo_order_${referenceNo}`
    if (isPaymentsLive) {
      const order = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: referenceNo,
      })
      orderId = order.id
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        reference_no: referenceNo,
        student_id: studentId,
        due_id: dueId || null,
        amount,
        method,
        gateway: 'razorpay',
        gateway_order_id: orderId,
        status: 'pending',
        received_by: req.user.id,
      })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)

    res.status(201).json({
      data: {
        paymentId: data.id,
        orderId,
        amount,
        currency: 'INR',
        keyId: env.razorpayKeyId || null,
        isDemo: !isPaymentsLive,
      },
    })
  }),
)

// ---- Verify a completed gateway payment (called by the frontend after checkout) ----
paymentsRouter.post(
  '/verify',
  requirePortal('parent'),
  asyncHandler(async (req, res) => {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const { data: payment, error: fetchError } = await supabaseAdmin.from('payments').select('*').eq('id', paymentId).single()
    if (fetchError) throw new ApiError(404, 'Payment not found')

    if (isPaymentsLive) {
      const expectedSignature = crypto
        .createHmac('sha256', env.razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex')
      if (expectedSignature !== razorpaySignature) {
        await supabaseAdmin.from('payments').update({ status: 'failed', failure_reason: 'Signature mismatch' }).eq('id', paymentId)
        throw new ApiError(400, 'Payment verification failed.')
      }
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        gateway_payment_id: razorpayPaymentId || `demo_${paymentId}`,
        gateway_signature: razorpaySignature || null,
        verified_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)

    await markDuePaid(payment.due_id, payment.amount)
    await notifyUser({ studentId: payment.student_id, title: 'Payment received', message: `Your payment of ${payment.amount} was successful.`, type: 'payment' })
    await logAudit({ actorId: req.user.id, action: 'Payment Recorded', entityType: 'payment', entityId: data.id })

    res.json({ data })
  }),
)

// ---- Manual payment recording (accountant) ----
paymentsRouter.post(
  '/',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { studentId, dueId, amount, method = 'cash', notes } = req.body
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        reference_no: generatePaymentRef(),
        student_id: studentId,
        due_id: dueId || null,
        amount,
        method,
        gateway: 'manual',
        status: 'success',
        received_by: req.user.id,
        verified_by: req.user.id,
        verified_at: new Date().toISOString(),
        notes,
      })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)

    await markDuePaid(dueId, amount)
    await logAudit({ actorId: req.user.id, action: 'Payment Recorded', entityType: 'payment', entityId: data.id })
    res.status(201).json({ data })
  }),
)

// ---- History ----
paymentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { studentId, method, status, dateFrom, dateTo, query } = req.query
    let q = supabaseAdmin
      .from('payments')
      .select('*, students!inner(full_name, admission_no, parent_user_id)')
      .order('paid_at', { ascending: false })
    q = scopeToParent(q, req)
    if (studentId) q = q.eq('student_id', studentId)
    if (method) q = q.eq('method', method)
    if (status) q = q.eq('status', status)
    if (dateFrom) q = q.gte('paid_at', dateFrom)
    if (dateTo) q = q.lte('paid_at', `${dateTo}T23:59:59`)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)

    let rows = data
    if (query) {
      const needle = String(query).toLowerCase()
      rows = rows.filter((p) => `${p.reference_no} ${p.students?.full_name}`.toLowerCase().includes(needle))
    }
    res.json({ data: rows })
  }),
)

paymentsRouter.get(
  '/students/search',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { query } = req.query
    let q = supabaseAdmin.from('students').select('id, full_name, admission_no, class_name, section').limit(20)
    if (query) q = q.ilike('full_name', `%${query}%`)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

// ---- Verification queue ----
paymentsRouter.get(
  '/verification-queue',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, students(full_name, admission_no)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

paymentsRouter.patch(
  '/:id/verification-decision',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { decision } = req.body // 'approved' | 'rejected'
    const status = decision === 'approved' ? 'success' : 'failed'
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ status, verified_by: req.user.id, verified_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    if (status === 'success') await markDuePaid(data.due_id, data.amount)
    await logAudit({ actorId: req.user.id, action: decision === 'approved' ? 'Payment Verified' : 'Payment Rejected', entityType: 'payment', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Failed transactions ----
paymentsRouter.get(
  '/failed',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, students(full_name, admission_no)')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

paymentsRouter.post(
  '/:id/retry',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ status: 'pending', failure_reason: null })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

paymentsRouter.patch(
  '/:id/resolve',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ notes: 'Resolved by accountant' })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

// ---- Refunds ----
paymentsRouter.get(
  '/refunds',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('refunds')
      .select('*, payments(reference_no, amount, students(full_name))')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

paymentsRouter.post(
  '/:id/refunds',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { amount, reason } = req.body
    const { data, error } = await supabaseAdmin
      .from('refunds')
      .insert({ payment_id: req.params.id, amount, reason, requested_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

paymentsRouter.patch(
  '/refunds/:id/decision',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { decision } = req.body // approved | rejected
    const { data: refund, error: fetchError } = await supabaseAdmin.from('refunds').select('*').eq('id', req.params.id).single()
    if (fetchError) throw new ApiError(404, 'Refund not found')

    let gatewayRefundId = null
    if (decision === 'approved') {
      const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('id', refund.payment_id).single()
      if (isPaymentsLive && payment?.gateway_payment_id) {
        const refundResult = await razorpay.payments.refund(payment.gateway_payment_id, { amount: Math.round(refund.amount * 100) })
        gatewayRefundId = refundResult.id
      }
      await supabaseAdmin.from('payments').update({ status: 'refunded' }).eq('id', refund.payment_id)
    }

    const { data, error } = await supabaseAdmin
      .from('refunds')
      .update({
        status: decision === 'approved' ? 'processed' : 'rejected',
        decided_by: req.user.id,
        decided_at: new Date().toISOString(),
        gateway_refund_id: gatewayRefundId,
      })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    await logAudit({ actorId: req.user.id, action: decision === 'approved' ? 'Refund Approved' : 'Refund Rejected', entityType: 'refund', entityId: data.id })
    res.json({ data })
  }),
)

// ---- Reconciliation ----
paymentsRouter.get(
  '/reconciliation',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, students(full_name, admission_no), reconciliation_records(*)')
      .eq('status', 'success')
      .order('paid_at', { ascending: false })
      .limit(200)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

paymentsRouter.post(
  '/reconciliation/auto',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data: unmatched, error } = await supabaseAdmin
      .from('payments')
      .select('id, reference_no')
      .eq('status', 'success')
      .not('gateway_payment_id', 'is', null)
    if (error) throw new ApiError(500, error.message)

    const rows = unmatched.map((p) => ({ payment_id: p.id, bank_reference: p.reference_no, matched: true, method: 'auto' }))
    if (rows.length) await supabaseAdmin.from('reconciliation_records').insert(rows)
    res.json({ data: { matchedCount: rows.length } })
  }),
)

paymentsRouter.post(
  '/reconciliation/manual',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { paymentId, bankReference, notes } = req.body
    const { data, error } = await supabaseAdmin
      .from('reconciliation_records')
      .insert({ payment_id: paymentId, bank_reference: bankReference, matched: true, matched_by: req.user.id, method: 'manual', notes })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

// ---- Analytics / overview ----
paymentsRouter.get(
  '/analytics',
  requirePortal('accountant', 'admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('payments').select('amount, method, status, paid_at').eq('status', 'success')
    if (error) throw new ApiError(500, error.message)

    const totalCollected = data.reduce((sum, p) => sum + Number(p.amount), 0)
    const byMethod = data.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
      return acc
    }, {})
    res.json({ data: { totalCollected, transactionCount: data.length, byMethod } })
  }),
)

paymentsRouter.get(
  '/gateway-transactions',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, students(full_name, admission_no)')
      .eq('gateway', 'razorpay')
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
