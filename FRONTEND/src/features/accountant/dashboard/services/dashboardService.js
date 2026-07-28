import { apiGet } from '../../../../services/apiClient'
import { useAuthStore } from '../../../../store/authStore'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

function studentLabel(row) {
  return row?.students?.full_name ?? row?.student_name ?? row?.full_name ?? 'Unknown Student'
}

function classLabel(row) {
  const s = row?.students
  if (!s) return row?.class_name ?? ''
  return [s.class_name, s.section].filter(Boolean).join('-')
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// ---- summary / KPIs ----

export async function fetchSummary() {
  const [summaryRes, recentRes, overdueRes, analyticsRes, failedRes, refundsRes] = await Promise.all([
    apiGet('/dashboard/summary'),
    apiGet('/dashboard/recent-transactions'),
    apiGet('/dashboard/overdue-accounts'),
    apiGet('/reports/collection-analytics').catch(() => ({ data: null })),
    apiGet('/payments/failed').catch(() => ({ data: [] })),
    apiGet('/payments/refunds').catch(() => ({ data: [] })),
  ])

  const summary = summaryRes.data ?? {}
  const recent = recentRes.data ?? []
  const overdue = overdueRes.data ?? []
  const analytics = analyticsRes.data ?? {}
  const failed = failedRes.data ?? []
  const refunds = refundsRes.data ?? []

  const todayCollected = Number(summary.todayCollected) || 0
  const outstanding = Number(summary.outstanding) || 0
  const dueCount = Number(summary.dueCount) || 0

  const today = todayKey()
  const todaysTransactions = recent.filter((row) => (row.paid_at ?? '').slice(0, 10) === today)
  const todaysCollectionCount = todaysTransactions.length

  const overdueAmount = overdue.reduce((sum, row) => sum + (Number(row.amount_due) - Number(row.amount_paid || 0)), 0)

  const successCount = recent.filter((row) => row.status === 'success' || row.status === 'paid').length
  const failedCount = failed.length

  const pendingRefunds = refunds.filter((row) => row.status === 'pending').length
  const approvedRefunds = refunds.filter((row) => row.status === 'approved').length

  return {
    hero: {
      accountantName: accountantName(),
      department: 'Accounts & Finance',
      academicYear: '2025-2026',
      todaysCollection: todayCollected,
      todaysCollectionCount,
      shiftStatus: 'Active',
      shiftStartedAt: null,
    },
    kpis: {
      todaysCollections: { amount: todayCollected, count: todaysCollectionCount },
      monthlyCollections: { amount: Number(analytics.totalCollected) || todayCollected, growthPercent: 0 },
      pendingDues: { amount: outstanding, count: dueCount },
      overdueAccounts: { amount: overdueAmount, count: overdue.length },
      successfulPayments: { count: successCount, successRate: Number(analytics.successRate) || 0 },
      failedTransactions: { count: failedCount, retryRequired: failedCount },
      refundRequests: { pending: pendingRefunds, approved: approvedRefunds },
    },
  }
}

export async function fetchPerformance() {
  const [performanceRes, summaryRes, refundsRes, verificationRes] = await Promise.all([
    apiGet('/dashboard/performance'),
    apiGet('/dashboard/summary'),
    apiGet('/payments/refunds').catch(() => ({ data: [] })),
    apiGet('/payments/verification-queue').catch(() => ({ data: [] })),
  ])

  const points = performanceRes.data ?? []
  const summary = summaryRes.data ?? {}
  const refunds = refundsRes.data ?? []
  const verificationQueue = verificationRes.data ?? []

  const collected = Number(summary.todayCollected) || 0
  const averageAmount = points.length ? points.reduce((sum, row) => sum + Number(row.amount || 0), 0) / points.length : collected
  const target = averageAmount > 0 ? Math.round(averageAmount) : collected
  const remaining = Math.max(0, target - collected)
  const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0

  const pendingRefundCount = refunds.filter((row) => row.status === 'pending').length
  const pendingVerificationCount = verificationQueue.filter((row) => row.verificationStatus === 'pending' || row.status === 'pending').length

  const upcomingTasks = []
  if (pendingRefundCount > 0) {
    upcomingTasks.push({
      id: 't-refunds',
      title: 'Pending Refund Approval',
      description: `${pendingRefundCount} refund request${pendingRefundCount === 1 ? '' : 's'} awaiting sign-off`,
      due: 'Action required',
      icon: 'Undo2',
      priority: 'high',
    })
  }
  if (pendingVerificationCount > 0) {
    upcomingTasks.push({
      id: 't-verification',
      title: 'Payment Verification',
      description: `${pendingVerificationCount} payment${pendingVerificationCount === 1 ? '' : 's'} pending manual verification`,
      due: 'Action required',
      icon: 'ShieldCheck',
      priority: 'high',
    })
  }
  if (Number(summary.dueCount) > 0) {
    upcomingTasks.push({
      id: 't-dues',
      title: 'Pending Dues Follow-up',
      description: `${summary.dueCount} due record${Number(summary.dueCount) === 1 ? '' : 's'} outstanding`,
      due: 'This week',
      icon: 'BellRing',
      priority: 'medium',
    })
  }

  // System status has no backend equivalent (no infra-monitoring endpoint exists) — presented as a
  // static informational panel rather than fabricated live data.
  const systemStatus = [
    { id: 'gateway', label: 'Payment Gateway', status: 'online', detail: 'Razorpay' },
    { id: 'database', label: 'Database', status: 'healthy', detail: 'Operational' },
    { id: 'notifications', label: 'Notification Service', status: 'running', detail: 'Operational' },
    { id: 'email', label: 'Email Service', status: 'connected', detail: 'Operational' },
  ]

  return { target, collected, remaining, percent, upcomingTasks, systemStatus }
}

export async function fetchRevenue(range) {
  const { data } = await apiGet(`/dashboard/revenue?range=${encodeURIComponent(range)}`)
  const points = (data ?? []).map((row) => ({
    label: row.date ?? row.label,
    revenue: Number(row.amount) || 0,
    transactions: Number(row.transactions) || 0,
    growthPercent: Number(row.growthPercent) || 0,
  }))
  return { range, points }
}

export async function fetchPaymentMethods() {
  const { data } = await apiGet('/dashboard/payment-methods')
  const rows = data ?? []
  const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  return rows.map((row) => ({
    method: row.method,
    amount: Number(row.amount) || 0,
    percent: total > 0 ? Math.round(((Number(row.amount) || 0) / total) * 100) : 0,
    count: Number(row.count) || 0,
  }))
}

export async function fetchPendingDues() {
  const { data } = await apiGet('/dashboard/pending-dues')
  return (data ?? []).map((row) => {
    const dueDate = row.due_date
    const daysRemaining = dueDate ? Math.round((new Date(dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000) : 0
    return {
      id: row.id,
      student: studentLabel(row),
      className: classLabel(row),
      amount: Number(row.amount_due) - Number(row.amount_paid || 0),
      dueDate,
      daysOverdue: daysRemaining < 0 ? Math.abs(daysRemaining) : 0,
      status: row.status ?? (daysRemaining < 0 ? 'overdue' : daysRemaining === 0 ? 'due-soon' : 'pending'),
    }
  })
}

export async function fetchOverdueAccounts() {
  const { data } = await apiGet('/dashboard/overdue-accounts')
  return (data ?? []).map((row) => {
    const dueDate = row.due_date
    const daysOverdue = dueDate ? Math.max(0, Math.round((new Date().setHours(0, 0, 0, 0) - new Date(dueDate).setHours(0, 0, 0, 0)) / 86_400_000)) : 0
    return {
      id: row.id,
      student: studentLabel(row),
      className: classLabel(row),
      amount: Number(row.amount_due) - Number(row.amount_paid || 0),
      lateFee: Number(row.late_fee) || 0,
      daysOverdue,
      priority: daysOverdue > 40 ? 'critical' : daysOverdue > 20 ? 'high' : 'medium',
      parentPhone: row.students?.guardian_phone ?? '',
    }
  })
}

export async function fetchRecentTransactions() {
  const { data } = await apiGet('/dashboard/recent-transactions')
  return (data ?? []).map((row) => ({
    id: row.id,
    student: studentLabel(row),
    method: row.method,
    amount: Number(row.amount) || 0,
    status: row.status,
    date: row.paid_at,
  }))
}

export async function fetchNotifications() {
  const { data } = await apiGet('/dashboard/notifications')
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.message ?? row.description ?? '',
    priority: row.priority ?? 'low',
    timestamp: row.created_at ?? row.timestamp,
    actionLabel: row.action_label ?? 'View',
    unread: row.read === false || row.is_read === false || !!row.unread,
  }))
}

export async function fetchStudentStats() {
  const { data } = await apiGet('/dashboard/student-stats')
  return { registered: Number(data?.total) || 0, active: Number(data?.active) || 0 }
}
