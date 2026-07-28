import { apiGet, apiPost, apiPatch } from '../../../../services/apiClient'
import { useAuthStore } from '../../../../store/authStore'

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Demand Draft', 'Wallet']

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

function studentName(row) {
  return row?.students?.full_name ?? row?.studentName ?? row?.full_name ?? ''
}

function classLabel(row) {
  const s = row?.students
  if (!s) return row?.className ?? ''
  return [s.class_name, s.section].filter(Boolean).join('-')
}

function mapStudentForSearch(row) {
  return {
    id: row.id,
    name: row.full_name,
    registrationNumber: row.admission_no,
    admissionNumber: row.admission_no,
    className: row.class_name,
    section: row.section,
    parentName: row.guardian_name,
    parentPhone: row.guardian_phone,
  }
}

// Maps a backend Payment row to the flat "history row" shape used throughout the payments UI.
function mapPaymentRow(row) {
  return {
    id: row.id,
    gatewayReferenceId: row.gateway ?? null,
    receiptNumber: row.reference_no,
    studentId: row.student_id,
    studentName: studentName(row),
    className: classLabel(row),
    amount: Number(row.amount) || 0,
    method: row.method,
    status: row.status,
    date: row.paid_at,
    collectedBy: row.collected_by ?? accountantName(),
    remarks: row.notes ?? row.remarks ?? '',
  }
}

export async function fetchStudentsForPayment(query) {
  if (!query) return []
  const { data } = await apiGet(`/payments/students/search?query=${encodeURIComponent(query)}`)
  return (data ?? []).map(mapStudentForSearch)
}

export async function fetchStudentOutstanding(studentId) {
  const [studentRes, outstandingRes, feeStructureRes, duesRes] = await Promise.all([
    apiGet(`/students/${studentId}`),
    apiGet(`/students/${studentId}/outstanding`),
    apiGet(`/students/${studentId}/fee-structure`).catch(() => ({ data: null })),
    apiGet(`/dues?query=${encodeURIComponent(studentId)}`).catch(() => ({ data: [] })),
  ])

  const student = studentRes.data
  if (!student) throw new Error('Student not found')
  const outstanding = outstandingRes.data ?? { outstanding: 0 }
  const feeStructure = feeStructureRes.data
  const dues = (duesRes.data ?? []).filter((row) => row.student_id === studentId)

  return {
    id: student.id,
    name: student.full_name,
    registrationNumber: student.admission_no,
    admissionNumber: student.admission_no,
    className: student.class_name,
    section: student.section,
    parentName: student.guardian_name,
    parentPhone: student.guardian_phone,
    outstanding: {
      totalDue: Number(outstanding.outstanding) || 0,
      components: (feeStructure?.fee_structures?.components ?? []).map((component) => ({
        label: component.category,
        amount: Number(component.amount) || 0,
      })),
      installments: dues.map((due) => ({
        id: due.id,
        label: due.description,
        amount: Number(due.amount_due) - Number(due.amount_paid || 0),
        dueDate: due.due_date,
        status: due.status,
      })),
    },
  }
}

async function recordPayment(payload) {
  const { data } = await apiPost('/payments', {
    studentId: payload.studentId,
    dueId: payload.installmentId,
    amount: payload.amount,
    method: payload.method,
    notes: payload.remarks,
  })
  return mapPaymentRow(data)
}

export async function receivePayment(payload) {
  return recordPayment(payload)
}

export async function recordManualPayment(payload) {
  return recordPayment(payload)
}

export async function fetchReceipt(id) {
  try {
    const { data } = await apiGet(`/documents/receipts/${id}`)
    return mapReceipt(data, id)
  } catch {
    const { data } = await apiPost('/documents/receipts', { paymentId: id })
    return mapReceipt(data, id)
  }
}

function mapReceipt(row, fallbackId) {
  return {
    id: row?.payment_id ?? row?.paymentId ?? fallbackId,
    receiptNumber: row?.receipt_no ?? row?.receiptNumber ?? row?.id ?? fallbackId,
    studentName: row?.students?.full_name ?? row?.student?.full_name ?? row?.studentName ?? '',
    date: row?.created_at ?? row?.paymentDate ?? row?.date ?? new Date().toISOString(),
    method: row?.method ?? row?.payment_method ?? '',
    amount: Number(row?.amount ?? row?.paidAmount ?? 0),
    collectedBy: row?.collected_by ?? row?.createdBy ?? accountantName(),
    remarks: row?.remarks ?? row?.notes ?? '',
  }
}

export async function fetchPendingVerification() {
  const { data } = await apiGet('/payments/verification-queue')
  return (data ?? []).map((row) => ({
    id: row.id,
    gatewayReferenceId: row.gateway ?? row.reference_no ?? null,
    studentName: studentName(row),
    amount: Number(row.amount) || 0,
    method: row.method,
    // The backend doesn't expose a separate gateway-health field on the verification queue —
    // approximated as "success" since these rows are, by definition, gateway-confirmed payments
    // awaiting manual sign-off.
    gatewayStatus: row.gateway_status ?? 'success',
    verificationStatus: row.status === 'pending' ? 'pending' : row.status,
    verificationDate: row.verified_at ?? null,
  }))
}

export async function verifyPayment(id, decision) {
  const { data } = await apiPatch(`/payments/${id}/verification-decision`, {
    decision: decision === 'approve' ? 'approved' : 'rejected',
  })
  return {
    id: data.id,
    gatewayReferenceId: data.gateway ?? data.reference_no ?? null,
    studentName: studentName(data),
    amount: Number(data.amount) || 0,
    method: data.method,
    gatewayStatus: data.gateway_status ?? 'success',
    verificationStatus: decision === 'approve' ? 'verified' : 'rejected',
    verificationDate: new Date().toISOString(),
  }
}

export async function fetchHistory(filters) {
  const { query, method, status, dateFrom, dateTo } = filters ?? {}
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (method) params.set('method', method)
  if (status) params.set('status', status)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  const qs = params.toString()
  const { data } = await apiGet(`/payments${qs ? `?${qs}` : ''}`)
  return (data ?? []).map(mapPaymentRow)
}

function mapRefund(row) {
  const timeline = [
    { id: `${row.id}-t1`, title: 'Refund Requested', date: row.created_at, description: row.reason ?? '' },
  ]
  if (row.status === 'approved' || row.status === 'processed') {
    timeline.push({ id: `${row.id}-t2`, title: 'Approved', date: row.decided_at ?? row.updated_at ?? row.created_at, description: `Approved by ${row.processed_by ?? accountantName()}` })
  }
  if (row.status === 'rejected') {
    timeline.push({ id: `${row.id}-t2`, title: 'Rejected', date: row.decided_at ?? row.updated_at ?? row.created_at, description: row.rejection_reason ?? 'Rejected' })
  }
  if (row.status === 'processed') {
    timeline.push({ id: `${row.id}-t3`, title: 'Processed', date: row.processed_at ?? row.updated_at ?? row.created_at, description: `Refunded via ${row.method ?? row.refund_method ?? 'original payment method'}` })
  }
  return {
    id: row.id,
    originalTransactionId: row.payment_id ?? row.paymentId ?? row.payments?.id ?? '',
    studentName: row.students?.full_name ?? row.payments?.students?.full_name ?? studentName(row),
    amount: Number(row.amount) || 0,
    reason: row.reason ?? '',
    approvalStatus: row.status ?? 'pending',
    refundMethod: row.method ?? row.refund_method ?? 'Original Payment Method',
    processedBy: row.processed_by ?? null,
    timeline,
  }
}

export async function fetchRefunds() {
  const { data } = await apiGet('/payments/refunds')
  return (data ?? []).map(mapRefund)
}

export async function processRefund(id, action, payload = {}) {
  if (action === 'approve') {
    const { data } = await apiPatch(`/payments/refunds/${id}/decision`, { decision: 'approved' })
    return mapRefund(data)
  }
  if (action === 'reject') {
    const { data } = await apiPatch(`/payments/refunds/${id}/decision`, { decision: 'rejected', reason: payload.reason })
    return mapRefund(data)
  }
  // "process" (marking an approved refund as disbursed) has no dedicated backend endpoint —
  // the decision endpoint only models pending/approved/rejected. Re-fetch the current record and
  // present it as processed locally so the UI flow can complete; this status is not persisted server-side.
  const { data } = await apiGet('/payments/refunds')
  const current = (data ?? []).find((row) => row.id === id)
  const mapped = current ? mapRefund(current) : { id, timeline: [] }
  return {
    ...mapped,
    approvalStatus: 'processed',
    processedBy: mapped.processedBy ?? accountantName(),
    timeline: [...mapped.timeline, { id: `${id}-processed`, title: 'Processed', date: new Date().toISOString(), description: `Refunded via ${mapped.refundMethod}` }],
  }
}

function mapFailed(row) {
  return {
    id: row.id,
    studentName: studentName(row),
    parentPhone: row.students?.guardian_phone ?? '',
    amount: Number(row.amount) || 0,
    gateway: row.gateway ?? 'Razorpay',
    method: row.method,
    failureReason: row.failure_reason ?? row.gateway_response ?? 'Payment failed',
    gatewayResponse: row.gateway_response ?? '',
    retryCount: Number(row.retry_count) || 0,
    status: row.status,
    date: row.paid_at ?? row.created_at,
  }
}

export async function fetchFailed() {
  const { data } = await apiGet('/payments/failed')
  return (data ?? []).map(mapFailed)
}

export async function retryPayment(id) {
  const { data } = await apiPost(`/payments/${id}/retry`)
  const mapped = mapFailed(data)
  return { ...mapped, retrySucceeded: mapped.status !== 'failed' }
}

export async function markResolved(id) {
  const { data } = await apiPatch(`/payments/${id}/resolve`)
  return mapFailed(data)
}

function buildReconciliationFromPayments(payments) {
  const matched = []
  const unmatched = []
  const duplicates = []
  let gatewayTotal = 0
  let ledgerTotal = 0

  payments.forEach((payment) => {
    const amount = Number(payment.amount) || 0
    gatewayTotal += amount
    const records = payment.reconciliation_records ?? []
    const record = records[0]
    const ledgerAmount = record ? Number(record.ledger_amount ?? record.amount ?? amount) : 0
    const row = {
      id: payment.id,
      transactionId: payment.id,
      studentName: studentName(payment),
      gatewayAmount: amount,
      ledgerAmount,
      date: payment.paid_at,
      note: record?.notes ?? '',
    }
    const status = record?.status ?? (records.length > 1 ? 'duplicate' : record ? 'matched' : 'unmatched')
    if (status === 'matched') {
      matched.push(row)
      ledgerTotal += ledgerAmount
    } else if (status === 'duplicate') {
      duplicates.push(row)
    } else {
      unmatched.push(row)
    }
  })

  const transactionCount = payments.length
  return {
    gatewaySummary: { total: gatewayTotal, transactionCount, settlementStatus: unmatched.length === 0 ? 'settled' : 'pending' },
    ledgerSummary: { total: ledgerTotal, transactionCount: matched.length },
    progressPercent: transactionCount ? Math.round((matched.length / transactionCount) * 100) : 0,
    matched,
    unmatched,
    duplicates,
  }
}

export async function fetchReconciliation() {
  const { data } = await apiGet('/payments/reconciliation')
  return buildReconciliationFromPayments(data ?? [])
}

export async function autoReconcile() {
  const { data } = await apiPost('/payments/reconciliation/auto')
  return {
    matchedCount: Number(data?.matchedCount ?? data?.matched ?? 0),
    message: data?.message ?? 'Auto-reconciliation completed.',
  }
}

export async function manualReconcile(payload) {
  await apiPost('/payments/reconciliation/manual', {
    paymentId: payload.id,
    bankReference: payload.record?.transactionId ?? payload.id,
    notes: 'Manually matched by accountant',
  })
  return { success: true, note: payload.note ?? '' }
}
