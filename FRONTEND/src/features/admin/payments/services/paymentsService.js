import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

export const ACCOUNTANTS = ['Kavita Sharma', 'Rohit Verma', 'Ananya Iyer', 'Priya Deshmukh', 'Arjun Mehta']

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Demand Draft', 'Wallet']

const METHOD_LABEL = {
  cash: 'Cash',
  cheque: 'Cheque',
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
  razorpay: 'Razorpay',
  bank_transfer: 'Bank Transfer',
}

function mapMethod(method) {
  return METHOD_LABEL[method] || method || '—'
}

function formatPercent(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function formatRevenueLabel(dateStr, range) {
  const date = new Date(dateStr)
  if (range === 'year') return date.toLocaleDateString('en-US', { month: 'short' })
  if (range === 'week') return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Looks up a payment (with its student join) by re-querying the history endpoint,
 * since the decision/retry/resolve endpoints only return the bare `payments` row. */
async function fetchPaymentWithStudent(paymentId, studentId) {
  if (!studentId) return null
  try {
    const { data } = await apiGet(`/payments?studentId=${studentId}`)
    return (data || []).find((row) => row.id === paymentId) || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export async function fetchOverviewSummary() {
  const [{ data: summary }, { data: analytics }, { data: monthPoints }, { data: weekPoints }, { data: failed }, { data: pending }] =
    await Promise.all([
      apiGet('/dashboard/summary'),
      apiGet('/payments/analytics'),
      apiGet('/dashboard/revenue?range=month'),
      apiGet('/dashboard/revenue?range=week'),
      apiGet('/payments/failed'),
      apiGet('/payments/verification-queue'),
    ])

  const collectedToday = Number(summary?.todayCollected) || 0
  const monthRows = (monthPoints || []).map((p) => ({ date: p.date, amount: Number(p.amount) || 0 }))
  const collectedMonth = monthRows.reduce((sum, p) => sum + p.amount, 0)

  const successCount = Number(analytics?.transactionCount) || 0
  const totalAttempts = successCount + (failed || []).length + (pending || []).length
  const successRate = totalAttempts > 0 ? Number(((successCount / totalAttempts) * 100).toFixed(1)) : 0
  const avgTransactionValue = successCount > 0 ? Math.round((Number(analytics?.totalCollected) || 0) / successCount) : 0

  const weekRows = (weekPoints || []).map((p) => ({ date: p.date, amount: Number(p.amount) || 0 }))
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const yesterdayAmount = weekRows.find((p) => p.date === yesterdayStr)?.amount ?? 0
  const collectedTodayTrend = yesterdayAmount
    ? {
        direction: collectedToday >= yesterdayAmount ? 'up' : 'down',
        value: formatPercent(((collectedToday - yesterdayAmount) / yesterdayAmount) * 100),
      }
    : undefined

  const mid = Math.floor(monthRows.length / 2)
  const firstHalf = monthRows.slice(0, mid).reduce((sum, p) => sum + p.amount, 0)
  const secondHalf = monthRows.slice(mid).reduce((sum, p) => sum + p.amount, 0)
  const collectedMonthTrend = firstHalf
    ? {
        direction: secondHalf >= firstHalf ? 'up' : 'down',
        value: formatPercent(((secondHalf - firstHalf) / firstHalf) * 100),
      }
    : undefined

  return {
    collectedToday,
    collectedTodayTrend,
    collectedMonth,
    collectedMonthTrend,
    successRate,
    // No historical success-rate/avg-transaction-value snapshot exists on the backend to diff against.
    successRateTrend: undefined,
    avgTransactionValue,
    avgTransactionValueTrend: undefined,
  }
}

export async function fetchRevenueTrend(range = 'month') {
  const backendRange = range === 'today' ? 'week' : range
  const { data } = await apiGet(`/dashboard/revenue?range=${backendRange}`)
  const rows = (data || []).map((row) => ({ date: row.date, amount: Number(row.amount) || 0 }))

  let grouped = rows
  if (range === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10)
    grouped = rows.filter((row) => row.date === todayStr)
  } else if (range === 'year') {
    const byMonth = new Map()
    rows.forEach((row) => {
      const key = row.date.slice(0, 7)
      byMonth.set(key, (byMonth.get(key) || 0) + row.amount)
    })
    grouped = Array.from(byMonth.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, amount]) => ({ date: `${key}-01`, amount }))
  }

  const points = grouped.map((row, index) => {
    const prevAmount = index > 0 ? grouped[index - 1].amount : 0
    const growthPercent = prevAmount ? ((row.amount - prevAmount) / prevAmount) * 100 : 0
    return {
      label: formatRevenueLabel(row.date, range),
      revenue: row.amount,
      // Per-bucket transaction counts aren't returned by /dashboard/revenue (amount-only).
      transactions: 0,
      growthPercent,
    }
  })

  return { points }
}

function mapPaymentStatus(status) {
  const map = { success: 'paid', pending: 'pending', failed: 'failed', refunded: 'refunded', partially_refunded: 'partial' }
  return map[status] || status
}

export async function fetchRecentTransactions() {
  const { data } = await apiGet('/dashboard/recent-transactions')
  return (data || []).map((row) => ({
    id: row.id,
    studentName: row.students?.full_name || '—',
    // received_by/verified_by are user IDs with no join on this endpoint — no real staff name to show.
    accountant: row.gateway === 'razorpay' ? 'Parent (Online)' : row.received_by ? 'Accountant' : 'System',
    method: mapMethod(row.method),
    amount: Number(row.amount) || 0,
    status: mapPaymentStatus(row.status),
    date: row.paid_at || row.created_at,
  }))
}

// ---------------------------------------------------------------------------
// Verification queue
// ---------------------------------------------------------------------------

function mapVerificationItem(row) {
  return {
    id: row.id,
    studentName: row.students?.full_name || '—',
    amount: Number(row.amount) || 0,
    method: mapMethod(row.method),
    referenceNumber: row.reference_no,
    // received_by is a user ID with no join on this endpoint — no real staff name to show.
    submittedBy: row.received_by ? 'Accountant' : '—',
    submittedDate: row.created_at,
    status: row.status === 'success' ? 'verified' : row.status === 'failed' ? 'rejected' : 'pending',
    decidedDate: row.verified_at || undefined,
  }
}

export async function fetchVerificationQueue() {
  // Backend only ever returns status='pending' rows here, so items already
  // decided elsewhere never reappear — "Verified Today" stays accurate only
  // for decisions made in the current session (see decideVerification below).
  const { data } = await apiGet('/payments/verification-queue')
  return (data || []).map(mapVerificationItem)
}

export async function decideVerification(id, decision) {
  const { data } = await apiPatch(`/payments/${id}/verification-decision`, {
    decision: decision === 'approve' ? 'approved' : 'rejected',
  })
  const enriched = (await fetchPaymentWithStudent(data.id, data.student_id)) || data
  return mapVerificationItem({ ...enriched, verified_at: data.verified_at || new Date().toISOString() })
}

// ---------------------------------------------------------------------------
// Gateway transactions
// ---------------------------------------------------------------------------

function mapGatewayStatus(status) {
  if (status === 'failed') return 'failed'
  if (status === 'pending') return 'authorized'
  // success / refunded / partially_refunded all imply the charge was captured at some point.
  return 'captured'
}

function mapGatewayTransaction(row) {
  return {
    id: row.id,
    gatewayReferenceId: row.gateway_payment_id || row.gateway_order_id || row.reference_no,
    orderId: row.gateway_order_id || '—',
    studentName: row.students?.full_name || '—',
    amount: Number(row.amount) || 0,
    method: mapMethod(row.method),
    gatewayStatus: mapGatewayStatus(row.status),
    timestamp: row.created_at,
  }
}

export async function fetchGatewayTransactions(filters = {}) {
  const { query, gatewayStatus, method } = filters
  const { data } = await apiGet('/payments/gateway-transactions')
  const rows = (data || []).map(mapGatewayTransaction)
  return rows.filter((row) => {
    if (gatewayStatus && row.gatewayStatus !== gatewayStatus) return false
    // Some PAYMENT_METHODS labels (Credit Card/Debit Card/Demand Draft/Wallet) have no
    // matching value in the backend's payment-method enum, so they correctly match nothing.
    if (method && row.method !== method) return false
    if (query) {
      const q = query.toLowerCase()
      if (![row.id, row.gatewayReferenceId, row.orderId, row.studentName].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  })
}

// ---------------------------------------------------------------------------
// Refund approvals (above accountant's approval threshold)
// ---------------------------------------------------------------------------

function mapRefundStatus(status) {
  return status === 'processed' ? 'approved' : status
}

function mapRefund(row) {
  return {
    id: row.id,
    studentName: row.payments?.students?.full_name || '—',
    amount: Number(row.amount) || 0,
    reason: row.reason || '',
    // requested_by is a user ID with no join on this endpoint — no real staff name to show.
    requestedBy: row.requested_by || '—',
    requestedDate: row.created_at,
    status: mapRefundStatus(row.status),
  }
}

export async function fetchRefundApprovals() {
  const { data } = await apiGet('/payments/refunds')
  return (data || []).map(mapRefund)
}

export async function decideRefundApproval(id, decision) {
  await apiPatch(`/payments/refunds/${id}/decision`, { decision: decision === 'approve' ? 'approved' : 'rejected' })
  const { data } = await apiGet('/payments/refunds')
  const updated = (data || []).find((row) => row.id === id)
  return updated ? mapRefund(updated) : null
}

// ---------------------------------------------------------------------------
// Failed transactions
// ---------------------------------------------------------------------------

function mapFailedStatus(status) {
  return status === 'failed' ? 'failed' : 'resolved'
}

function mapFailedTransaction(row, overrides = {}) {
  return {
    id: row.id,
    studentName: row.students?.full_name || '—',
    // received_by is a user ID with no join on this endpoint — no real staff name to show.
    accountant: row.received_by ? 'Accountant' : 'System',
    amount: Number(row.amount) || 0,
    method: mapMethod(row.method),
    failureReason: row.failure_reason || 'Unknown error',
    // The payments table has no retry-count column — not persisted server-side.
    retryCount: 0,
    status: mapFailedStatus(row.status),
    date: row.created_at,
    ...overrides,
  }
}

export async function fetchFailedTransactions() {
  const { data } = await apiGet('/payments/failed')
  return (data || []).map((row) => mapFailedTransaction(row))
}

export async function retryFailedTransaction(id) {
  const { data } = await apiPost(`/payments/${id}/retry`)
  const enriched = (await fetchPaymentWithStudent(data.id, data.student_id)) || data
  const retrySucceeded = data.status !== 'failed'
  return { ...mapFailedTransaction(enriched, { retryCount: 1 }), retrySucceeded }
}

export async function escalateFailedTransaction(id) {
  // The payments.status enum has no "escalated" value, so there is no dedicated backend
  // action for this. Best-effort: call the /resolve endpoint (leaves an audit trail via
  // payments.notes) and flip status to "escalated" client-side for immediate feedback —
  // this will not persist across a refetch since the backend has nowhere to store it.
  const { data } = await apiPatch(`/payments/${id}/resolve`)
  const enriched = (await fetchPaymentWithStudent(data.id, data.student_id)) || data
  return mapFailedTransaction(enriched, { status: 'escalated' })
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

function mapReconciliationRow(row) {
  const records = row.reconciliation_records || []
  const record = records[0]
  const matchStatus = !record ? 'missing' : record.matched ? 'matched' : 'mismatch'
  const amount = Number(row.amount) || 0
  return {
    id: row.id,
    transactionId: row.reference_no,
    studentName: row.students?.full_name || 'Unmapped Bank Entry',
    // The schema has no separate bank-statement amount field — bank and recorded amounts
    // are always the same figure sourced from the payment itself, so "mismatch" here only
    // ever comes from reconciliation_records.matched, never from an amount discrepancy.
    bankAmount: amount,
    recordedAmount: amount,
    date: row.paid_at,
    matchStatus,
  }
}

export async function fetchReconciliation() {
  const { data } = await apiGet('/payments/reconciliation')
  const rows = (data || []).map(mapReconciliationRow)
  const matched = rows.filter((row) => row.matchStatus === 'matched').length
  const mismatched = rows.filter((row) => row.matchStatus === 'mismatch').length
  const unreconciledAmount = rows.filter((row) => row.matchStatus !== 'matched').reduce((sum, row) => sum + row.bankAmount, 0)
  return { summary: { matched, mismatched, unreconciledAmount }, rows }
}
