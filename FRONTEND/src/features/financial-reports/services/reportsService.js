import { apiGet, apiPatch, apiPost } from '../../../services/apiClient'
import { useAuthStore } from '../../../store/authStore'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

export const ACCOUNTANT_NAME = accountantName()

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Net Banking', 'Wallet']

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function growthPercent(current, previous) {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

// ---------------------------------------------------------------------------
// Daily Collection
// ---------------------------------------------------------------------------

export async function fetchDailyCollection() {
  const today = todayKey()
  const [trendRes, paymentsRes] = await Promise.all([
    apiGet('/reports/daily-collection').catch(() => ({ data: [] })),
    apiGet(`/payments?dateFrom=${today}&dateTo=${today}`).catch(() => ({ data: [] })),
  ])
  const trend = trendRes.data ?? []
  const payments = paymentsRes.data ?? []
  const successful = payments.filter((row) => row.status !== 'failed')
  const total = successful.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const hourBuckets = new Map()
  successful.forEach((row) => {
    if (!row.paid_at) return
    const hour = new Date(row.paid_at).getHours()
    const label = `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`
    const entry = hourBuckets.get(label) ?? { label, revenue: 0, transactions: 0 }
    entry.revenue += Number(row.amount || 0)
    entry.transactions += 1
    hourBuckets.set(label, entry)
  })
  const hourlyTrend = hourBuckets.size > 0 ? [...hourBuckets.values()] : trend.map((row) => ({ label: row.date, revenue: Number(row.amount) || 0, transactions: 0 }))

  const transactions = successful.map((row) => ({
    time: row.paid_at ? new Date(row.paid_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
    studentName: row.students?.full_name ?? '',
    receiptNumber: row.reference_no,
    method: row.method,
    collectedBy: accountantName(),
    amount: Number(row.amount) || 0,
    status: row.status,
  }))

  const highestTransaction = successful.reduce(
    (max, row) => (Number(row.amount) > (max?.amount ?? -1) ? { studentName: row.students?.full_name ?? '', amount: Number(row.amount) || 0 } : max),
    null,
  )
  const topHour = hourlyTrend.reduce((max, row) => (row.revenue > (max?.revenue ?? -1) ? row : max), null)

  return {
    summary: {
      todaysCollection: total,
      totalTransactions: successful.length,
      averageCollection: successful.length ? Math.round(total / successful.length) : 0,
      // No daily collection-target concept exists on the backend — 0 rather than fabricated.
      pendingCollections: 0,
      collectionTarget: 0,
      achievementPercent: 0,
    },
    hourlyTrend,
    transactions,
    insights: {
      highestCollectionHour: topHour?.label ?? '—',
      topCollector: accountantName(),
      highestTransaction: highestTransaction ?? { studentName: '—', amount: 0 },
    },
  }
}

// ---------------------------------------------------------------------------
// Monthly Revenue
// ---------------------------------------------------------------------------

export async function fetchMonthlyRevenue() {
  const { data } = await apiGet('/reports/monthly-revenue')
  const rows = data ?? []
  const monthlyTable = rows.map((row, index) => {
    const amount = Number(row.amount) || 0
    const previous = index > 0 ? Number(rows[index - 1].amount) || 0 : 0
    return { month: row.month, revenue: amount, transactions: null, averagePayment: null, growthPercent: growthPercent(amount, previous) }
  })
  const currentMonth = monthlyTable.at(-1) ?? { revenue: 0, growthPercent: 0 }
  const previousMonth = monthlyTable.at(-2) ?? { revenue: 0 }

  return {
    summary: {
      monthlyRevenue: currentMonth.revenue,
      previousMonth: previousMonth.revenue,
      growthPercent: currentMonth.growthPercent,
      // No revenue-target concept exists on the backend.
      targetAchievement: 0,
    },
    monthlyTrend: monthlyTable.map((row) => ({ label: (row.month ?? '').slice(0, 3), revenue: row.revenue })),
    // Class/fee-category/installment breakdowns and forward forecasting have no backend source
    // (GET /reports/monthly-revenue only returns an overall month->amount series) — left empty
    // rather than fabricated.
    revenueByClass: [],
    revenueByFeeCategory: [],
    revenueByInstallment: [],
    forecast: [],
    comparison: { currentMonth: currentMonth.revenue, previousMonth: previousMonth.revenue, previousYear: 0 },
    monthlyTable,
  }
}

// ---------------------------------------------------------------------------
// Outstanding Dues
// ---------------------------------------------------------------------------

export async function fetchOutstandingDues() {
  const { data } = await apiGet('/reports/outstanding-dues')
  const rows = data ?? []
  const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)

  const [analyticsRes, duesRes] = await Promise.all([apiGet('/dues/analytics').catch(() => ({ data: null })), apiGet('/dues/overdue').catch(() => ({ data: [] }))])
  const analytics = analyticsRes.data
  const overdue = duesRes.data ?? []

  const table = overdue.map((row) => {
    const daysPending = row.due_date ? Math.max(0, Math.round((Date.now() - new Date(row.due_date).getTime()) / 86_400_000)) : 0
    const dueAmount = Number(row.amount_due) - Number(row.amount_paid || 0)
    return {
      studentId: row.student_id,
      studentName: row.students?.full_name ?? '',
      className: [row.students?.class_name, row.students?.section].filter(Boolean).join('-'),
      dueAmount,
      daysPending,
      // No dedicated late-fee-per-due figure available from this listing without another round
      // trip per row — left at 0 rather than fabricated.
      lateFee: 0,
      priority: daysPending > 30 ? 'critical' : daysPending > 20 ? 'high' : daysPending > 7 ? 'medium' : 'low',
    }
  })

  return {
    summary: {
      outstandingAmount: total || Number(analytics?.totalOutstanding) || 0,
      pendingStudents: analytics ? Number(analytics.pendingCount) : table.length,
      overdueStudents: analytics ? Number(analytics.overdueCount) : table.filter((row) => row.daysPending > 0).length,
      // No recovery-rate concept exists on the backend's dues analytics.
      recoveryRate: 0,
    },
    // Only a current snapshot is available, not a historical series.
    outstandingTrend: [{ label: 'Current', amount: total }],
    classWiseOutstanding: rows.map((row) => ({ className: row.className, amount: Number(row.amount) || 0 })),
    // Fee-category and ageing distributions have no backend source at this report's level of
    // detail — left empty rather than fabricated.
    feeCategoryDistribution: [],
    ageingAnalysis: [],
    table,
  }
}

// ---------------------------------------------------------------------------
// Collection Analytics
// ---------------------------------------------------------------------------

export async function fetchCollectionAnalytics() {
  const { data } = await apiGet('/reports/collection-analytics')
  const analytics = data ?? {}
  const byMethod = analytics.byMethod ?? []

  return {
    summary: {
      collectionEfficiency: Math.round(Number(analytics.successRate) || 0),
      recoveryRate: 0,
      targetAchievement: 0,
      collectionRatio: Number(analytics.successRate) ? Number(analytics.successRate) / 100 : 0,
    },
    trend: { daily: [], weekly: [], monthly: [] },
    // Hourly/day-of-week transaction heatmaps, department comparisons, funnels and per-class
    // collection efficiency all require data the backend doesn't expose at this granularity —
    // left empty rather than fabricated.
    heatmap: null,
    classWiseCollection: [],
    departmentComparison: [],
    topPerformingClasses: [],
    funnel: [],
    table: byMethod.map((row) => ({
      className: row.method,
      expectedRevenue: Number(row.amount) || 0,
      collected: Number(row.amount) || 0,
      pending: 0,
      collectionPercent: 100,
    })),
  }
}

// ---------------------------------------------------------------------------
// Payment Analytics
// ---------------------------------------------------------------------------

export async function fetchPaymentAnalytics() {
  const { data } = await apiGet('/reports/payment-analytics')
  const analytics = data ?? {}
  const byGateway = analytics.byGateway ?? []
  const totalRevenue = byGateway.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)

  return {
    summary: {
      totalPayments: Number(analytics.total) || 0,
      successfulPayments: Number(analytics.success) || 0,
      failedPayments: Number(analytics.failed) || 0,
      refunds: 0,
    },
    methodDistribution: byGateway.map((row) => ({
      method: row.gateway,
      amount: Number(row.amount) || 0,
      percent: totalRevenue > 0 ? Math.round(((Number(row.amount) || 0) / totalRevenue) * 100) : 0,
      count: Number(row.count) || 0,
    })),
    // Online/offline split, peak-hour and failure-reason breakdowns have no backend source at
    // this report's level of detail — left empty rather than fabricated.
    onlineVsOffline: [],
    peakHours: [],
    failureAnalysis: [],
    table: byGateway.map((row) => ({
      method: row.gateway,
      transactions: Number(row.count) || 0,
      revenue: Number(row.amount) || 0,
      averageAmount: row.count ? Math.round((Number(row.amount) || 0) / Number(row.count)) : 0,
      successRate: 0,
    })),
  }
}

// ---------------------------------------------------------------------------
// Export / Schedule
// ---------------------------------------------------------------------------

export async function requestExport(payload) {
  const { data } = await apiPost('/reports/export', { module: payload.reportName ?? payload.module, format: payload.format })
  return {
    id: data.id,
    reportName: data.module ?? payload.reportName,
    format: data.format ?? payload.format,
    requestedAt: data.created_at ?? new Date().toISOString(),
    status: data.status ?? 'completed',
    fileSizeKb: data.file_size_kb ?? 0,
  }
}

export async function fetchExportHistory() {
  const { data } = await apiGet('/reports/export/history')
  return (data ?? []).map((row) => ({
    id: row.id,
    reportName: row.module ?? row.reportName,
    format: row.format,
    requestedAt: row.created_at ?? row.requestedAt,
    status: row.status,
    fileSizeKb: row.file_size_kb ?? 0,
  }))
}

export async function scheduleReport(payload) {
  const { data } = await apiPost('/reports/scheduled', payload)
  return {
    id: data.id,
    reportName: data.report_name ?? payload.reportName,
    frequency: data.frequency ?? payload.frequency,
    email: data.email ?? payload.email,
    active: data.active ?? true,
  }
}

export async function fetchScheduledReports() {
  const { data } = await apiGet('/reports/scheduled')
  return (data ?? []).map((row) => ({
    id: row.id,
    reportName: row.report_name ?? row.reportName,
    frequency: row.frequency,
    email: row.email,
    active: row.active,
  }))
}

export async function toggleSchedule(id) {
  const { data } = await apiPatch(`/reports/scheduled/${id}/toggle`)
  return { id: data.id ?? id, reportName: data.report_name ?? data.reportName, frequency: data.frequency, email: data.email, active: data.active }
}
