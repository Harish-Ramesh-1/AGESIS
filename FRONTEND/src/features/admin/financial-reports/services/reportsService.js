import { apiGet, apiPost } from '../../../../services/apiClient'
import { useAuthStore } from '../../../../store/authStore'

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Net Banking', 'Wallet']
export const TOTAL_STUDENTS = 1240

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

function daysBetween(fromStr, toStr) {
  const diff = new Date(toStr).setHours(0, 0, 0, 0) - new Date(fromStr).setHours(0, 0, 0, 0)
  return Math.round(diff / 86_400_000)
}

function formatMonthLabel(key) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function shiftMonthKey(key, offsetMonths) {
  const date = new Date(`${key}-01T00:00:00`)
  date.setMonth(date.getMonth() + offsetMonths)
  return date.toISOString().slice(0, 7)
}

const CLASS_BANDS = [
  { label: 'Class 1-3', min: 1, max: 3 },
  { label: 'Class 4-5', min: 4, max: 5 },
  { label: 'Class 6-8', min: 6, max: 8 },
  { label: 'Class 9-10', min: 9, max: 10 },
  { label: 'Class 11-12', min: 11, max: 12 },
]
function classBandLabel(className) {
  const n = Number(className)
  return CLASS_BANDS.find((band) => n >= band.min && n <= band.max)?.label ?? 'Other'
}

const WINGS = [
  { label: 'Primary Wing', min: 1, max: 5 },
  { label: 'Middle Wing', min: 6, max: 8 },
  { label: 'Senior Wing', min: 9, max: 12 },
]
function wingLabel(className) {
  const n = Number(className)
  return WINGS.find((wing) => n >= wing.min && n <= wing.max)?.label ?? 'Other'
}

const HOUR_BUCKETS = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM']
const HOUR_BUCKET_STARTS = [9, 11, 13, 15, 17]
function hourBucketIndex(date) {
  let idx = 0
  const hour = date.getHours()
  for (let i = 0; i < HOUR_BUCKET_STARTS.length; i++) {
    if (hour >= HOUR_BUCKET_STARTS[i]) idx = i
  }
  return idx
}

function formatTimeLabel(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/** /payments and /dues don't join class/section — build a lookup from /students once per call. */
async function getStudentClassMap() {
  const { data } = await apiGet('/students')
  const map = {}
  ;(data || []).forEach((student) => {
    map[student.id] = { className: student.class_name, section: student.section }
  })
  return map
}

// ---------------------------------------------------------------------------
// Daily Collection (institution-wide)
// ---------------------------------------------------------------------------

export async function fetchDailyCollection() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [{ data: payments }, classMap, { data: history }] = await Promise.all([
    apiGet(`/payments?dateFrom=${todayStr}&dateTo=${todayStr}`),
    getStudentClassMap(),
    apiGet('/reports/daily-collection'),
  ])

  const rows = (payments || [])
    .map((row) => {
      const sortDate = new Date(row.paid_at || row.created_at)
      const classInfo = classMap[row.student_id]
      return {
        time: formatTimeLabel(row.paid_at || row.created_at),
        studentName: row.students?.full_name || '—',
        className: classInfo?.className ? `${classInfo.className}-${classInfo.section || ''}` : '—',
        receiptNumber: row.reference_no,
        method: mapMethod(row.method),
        // received_by/gateway have no join to a real staff name on this endpoint.
        collectedBy: row.gateway === 'razorpay' ? 'Online Gateway' : row.received_by ? 'Accountant' : 'System',
        amount: Number(row.amount) || 0,
        status: row.status === 'success' ? 'success' : row.status === 'failed' ? 'failed' : 'partial',
        _sortDate: sortDate,
      }
    })
    .sort((a, b) => a._sortDate - b._sortDate)

  const successful = rows.filter((row) => row.status !== 'failed')
  const total = successful.reduce((sum, row) => sum + row.amount, 0)

  const byHour = new Map()
  successful.forEach((row) => {
    const hour = row._sortDate.getHours()
    const label = row._sortDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    const bucket = byHour.get(hour) || { label, revenue: 0, transactions: 0 }
    bucket.revenue += row.amount
    bucket.transactions += 1
    byHour.set(hour, bucket)
  })
  const hourlyTrend = Array.from(byHour.entries())
    .sort(([a], [b]) => a - b)
    .map(([, bucket]) => bucket)

  const byCollector = new Map()
  successful.forEach((row) => {
    const bucket = byCollector.get(row.collectedBy) || { collectedBy: row.collectedBy, amount: 0, transactions: 0 }
    bucket.amount += row.amount
    bucket.transactions += 1
    byCollector.set(row.collectedBy, bucket)
  })
  const collectorBreakdown = Array.from(byCollector.values()).sort((a, b) => b.amount - a.amount)

  // No configured daily collection target exists in the backend — approximate one from the
  // trailing 30-day average (excluding today), the same technique used on the admin dashboard.
  const priorDays = (history || []).filter((day) => day.date !== todayStr)
  const historicalAverage = priorDays.length
    ? priorDays.reduce((sum, day) => sum + Number(day.amount || 0), 0) / priorDays.length
    : total
  const collectionTarget = Math.round((historicalAverage || total || 1) * 1.1)

  const topCollector = collectorBreakdown[0]
  const highestTransaction = successful.reduce((max, row) => (row.amount > (max?.amount || 0) ? row : max), null)
  const highestHour = hourlyTrend.reduce((max, bucket) => (bucket.revenue > (max?.revenue || 0) ? bucket : max), null)

  return {
    summary: {
      todaysCollection: total,
      totalTransactions: rows.length,
      averageCollection: successful.length ? Math.round(total / successful.length) : 0,
      pendingCollections: rows.filter((row) => row.status === 'partial').length,
      collectionTarget,
      achievementPercent: collectionTarget ? Math.round((total / collectionTarget) * 100) : 0,
    },
    hourlyTrend,
    transactions: rows.map(({ _sortDate, ...row }) => row),
    collectorBreakdown,
    insights: {
      highestCollectionHour: highestHour ? highestHour.label : '—',
      topCollector: topCollector ? topCollector.collectedBy : '—',
      highestTransaction: highestTransaction
        ? { studentName: highestTransaction.studentName, amount: highestTransaction.amount }
        : { studentName: '—', amount: 0 },
    },
  }
}

// ---------------------------------------------------------------------------
// Monthly Revenue (institution-wide)
// ---------------------------------------------------------------------------

export async function fetchMonthlyRevenue() {
  const since = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10)
  const [{ data: payments }, classMap, { data: dues }] = await Promise.all([
    apiGet(`/payments?status=success&dateFrom=${since}`),
    getStudentClassMap(),
    apiGet('/dues'),
  ])

  const dueDescriptionMap = {}
  ;(dues || []).forEach((due) => {
    dueDescriptionMap[due.id] = due.description || 'Other'
  })

  const byMonth = new Map()
  const byClassBand = new Map()
  const byFeeCategory = new Map()

  ;(payments || []).forEach((row) => {
    const amount = Number(row.amount) || 0
    const paidAt = row.paid_at || row.created_at
    const monthKey = paidAt.slice(0, 7)
    const monthBucket = byMonth.get(monthKey) || { revenue: 0, transactions: 0 }
    monthBucket.revenue += amount
    monthBucket.transactions += 1
    byMonth.set(monthKey, monthBucket)

    const classInfo = classMap[row.student_id]
    const band = classInfo?.className ? classBandLabel(classInfo.className) : 'Other'
    byClassBand.set(band, (byClassBand.get(band) || 0) + amount)

    // "Fee category" is approximated via the due this payment was made against — payments
    // without a linked due (e.g. direct fee-structure payments) fall back to "Other".
    const category = row.due_id ? dueDescriptionMap[row.due_id] || 'Other' : 'Other'
    const catBucket = byFeeCategory.get(category) || { amount: 0, count: 0 }
    catBucket.amount += amount
    catBucket.count += 1
    byFeeCategory.set(category, catBucket)
  })

  const monthKeys = Array.from(byMonth.keys()).sort()
  const monthlyTable = monthKeys.map((key, index) => {
    const bucket = byMonth.get(key)
    const prevBucket = index > 0 ? byMonth.get(monthKeys[index - 1]) : null
    const growthPercent = prevBucket?.revenue ? ((bucket.revenue - prevBucket.revenue) / prevBucket.revenue) * 100 : 0
    return {
      month: formatMonthLabel(key),
      revenue: bucket.revenue,
      transactions: bucket.transactions,
      averagePayment: bucket.transactions ? Math.round(bucket.revenue / bucket.transactions) : 0,
      growthPercent,
    }
  })

  const currentMonth = monthlyTable.at(-1) || { revenue: 0, growthPercent: 0 }
  const previousMonth = monthlyTable.at(-2) || { revenue: 0 }

  const priorMonths = monthlyTable.slice(0, -1)
  const targetBase = priorMonths.length
    ? priorMonths.reduce((sum, month) => sum + month.revenue, 0) / priorMonths.length
    : currentMonth.revenue
  const target = Math.round((targetBase || 1) * 1.1)
  const targetAchievement = target ? Math.round((currentMonth.revenue / target) * 100) : 0

  const totalFeeCategoryAmount = Array.from(byFeeCategory.values()).reduce((sum, bucket) => sum + bucket.amount, 0)
  const revenueByFeeCategory = Array.from(byFeeCategory.entries())
    .map(([method, bucket]) => ({
      method,
      amount: bucket.amount,
      percent: totalFeeCategoryAmount ? Math.round((bucket.amount / totalFeeCategoryAmount) * 100) : 0,
      count: bucket.count,
    }))
    .sort((a, b) => b.amount - a.amount)

  const lastThree = monthlyTable.slice(-3)
  const forecastBase = lastThree.length ? lastThree.reduce((sum, month) => sum + month.revenue, 0) / lastThree.length : 0
  const lastMonthDate = monthKeys.length ? new Date(`${monthKeys.at(-1)}-01T00:00:00`) : new Date()
  // Naive 3-month moving average — the backend has no forecasting/ML capability.
  const forecast = [1, 2, 3].map((offset) => {
    const date = new Date(lastMonthDate)
    date.setMonth(date.getMonth() + offset)
    return { label: date.toLocaleDateString('en-US', { month: 'short' }), revenue: Math.round(forecastBase) }
  })

  const previousYearKey = monthKeys.length ? shiftMonthKey(monthKeys.at(-1), -12) : null
  const previousYearRevenue = previousYearKey && byMonth.has(previousYearKey) ? byMonth.get(previousYearKey).revenue : 0

  return {
    summary: {
      monthlyRevenue: currentMonth.revenue,
      previousMonth: previousMonth.revenue,
      growthPercent: currentMonth.growthPercent,
      targetAchievement,
    },
    monthlyTrend: monthlyTable.map((row) => ({ label: row.month.slice(0, 3), revenue: row.revenue })),
    revenueByClass: Array.from(byClassBand.entries()).map(([className, amount]) => ({ className, amount })),
    revenueByFeeCategory,
    // No installment-sequence concept exists anywhere in the schema — payments aren't tagged
    // with an installment number, so there's nothing honest to source this from.
    revenueByInstallment: [],
    forecast,
    comparison: { currentMonth: currentMonth.revenue, previousMonth: previousMonth.revenue, previousYear: previousYearRevenue },
    monthlyTable,
  }
}

// ---------------------------------------------------------------------------
// Outstanding Dues (institution-wide, by class)
// ---------------------------------------------------------------------------

export async function fetchOutstandingDues() {
  const { data: dues } = await apiGet('/dues')
  const rows = dues || []

  const totalDue = rows.reduce((sum, due) => sum + Number(due.amount_due || 0), 0)
  const totalPaid = rows.reduce((sum, due) => sum + Number(due.amount_paid || 0), 0)
  const recoveryRate = totalDue ? Math.round((totalPaid / totalDue) * 100) : 0

  const unpaid = rows.filter((due) => due.status !== 'paid')
  const todayStr = new Date().toISOString().slice(0, 10)

  const byClass = new Map()
  unpaid.forEach((due) => {
    const className = due.students?.class_name || 'Unknown'
    const daysPending = Math.max(0, daysBetween(due.due_date, todayStr))
    const bucket = byClass.get(className) || { className, studentsPending: new Set(), outstandingAmount: 0, totalDays: 0, entries: 0 }
    bucket.studentsPending.add(due.student_id)
    bucket.outstandingAmount += Number(due.amount_due || 0) - Number(due.amount_paid || 0)
    bucket.totalDays += daysPending
    bucket.entries += 1
    byClass.set(className, bucket)
  })

  const table = Array.from(byClass.values())
    .map((bucket) => {
      const avgDaysPending = bucket.entries ? Math.round(bucket.totalDays / bucket.entries) : 0
      return {
        className: `Class ${bucket.className}`,
        studentsPending: bucket.studentsPending.size,
        outstandingAmount: bucket.outstandingAmount,
        avgDaysPending,
        priority: avgDaysPending > 30 ? 'critical' : avgDaysPending > 20 ? 'high' : avgDaysPending > 7 ? 'medium' : 'low',
      }
    })
    .sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }))

  const totalOutstanding = table.reduce((sum, row) => sum + row.outstandingAmount, 0)
  const pendingStudents = new Set(unpaid.map((due) => due.student_id)).size
  const overdueStudents = new Set(unpaid.filter((due) => due.due_date < todayStr).map((due) => due.student_id)).size

  const agingBuckets = [
    { bucket: '0-30 Days', amount: 0, studentCount: 0 },
    { bucket: '31-60 Days', amount: 0, studentCount: 0 },
    { bucket: '61-90 Days', amount: 0, studentCount: 0 },
    { bucket: '90+ Days', amount: 0, studentCount: 0 },
  ]
  const agingStudents = [new Set(), new Set(), new Set(), new Set()]
  unpaid.forEach((due) => {
    const daysPending = Math.max(0, daysBetween(due.due_date, todayStr))
    const index = daysPending <= 30 ? 0 : daysPending <= 60 ? 1 : daysPending <= 90 ? 2 : 3
    agingBuckets[index].amount += Number(due.amount_due || 0) - Number(due.amount_paid || 0)
    agingStudents[index].add(due.student_id)
  })
  agingBuckets.forEach((bucket, index) => {
    bucket.studentCount = agingStudents[index].size
  })

  return {
    summary: { outstandingAmount: totalOutstanding, pendingStudents, overdueStudents, recoveryRate },
    agingBuckets,
    // Outstanding balance is a point-in-time figure — the backend keeps no historical
    // snapshots of it, so only today's real total is shown (as a single point) rather than a
    // fabricated multi-month trend.
    outstandingTrend: [{ label: new Date().toLocaleDateString('en-US', { month: 'short' }), amount: totalOutstanding }],
    classWiseOutstanding: table.map((row) => ({ className: row.className, amount: row.outstandingAmount })),
    table,
  }
}

// ---------------------------------------------------------------------------
// Collection Analytics (institution-wide)
// ---------------------------------------------------------------------------

export async function fetchCollectionAnalytics() {
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const [
    { data: analytics },
    { data: dailyHistory },
    { data: monthlyHistory },
    { data: payments30d },
    { data: allSuccessPayments },
    classMap,
    { data: activeStructures },
    { data: dues },
    { data: invoices },
    { data: reminders },
  ] = await Promise.all([
    apiGet('/reports/collection-analytics'),
    apiGet('/reports/daily-collection'),
    apiGet('/reports/monthly-revenue'),
    apiGet(`/payments?dateFrom=${since30}`),
    apiGet('/payments?status=success'),
    getStudentClassMap(),
    apiGet('/fees/structures?status=active'),
    apiGet('/dues'),
    apiGet('/documents/invoices'),
    apiGet('/dues/reminders/history'),
  ])

  const successRate = Math.round((Number(analytics?.successRate) || 0) * 100)

  const duesRows = dues || []
  const totalDue = duesRows.reduce((sum, due) => sum + Number(due.amount_due || 0), 0)
  const totalPaidDues = duesRows.reduce((sum, due) => sum + Number(due.amount_paid || 0), 0)
  const recoveryRate = totalDue ? Math.round((totalPaidDues / totalDue) * 100) : 0
  const collectionRatio = totalDue ? Number((totalPaidDues / totalDue).toFixed(2)) : 0

  const dailyRows = (dailyHistory || []).map((day) => ({ date: day.date, amount: Number(day.amount) || 0 }))
  // "Expected" has no real target source anywhere in the backend — set equal to "collected"
  // so the chart shows real totals without implying a fabricated shortfall or surplus.
  const daily = dailyRows.slice(-6).map((row) => ({
    label: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
    collected: row.amount,
    expected: row.amount,
  }))

  const byWeek = new Map()
  dailyRows.forEach((row) => {
    const weekIndex = Math.min(3, Math.floor((Date.now() - new Date(row.date).getTime()) / (7 * 86_400_000)))
    const label = `Week ${4 - weekIndex}`
    byWeek.set(label, (byWeek.get(label) || 0) + row.amount)
  })
  const weekly = Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, amount]) => ({ label, collected: amount, expected: amount }))

  const monthly = (monthlyHistory || [])
    .slice(-4)
    .map((month) => ({ label: formatMonthLabel(month.month).slice(0, 3), collected: Number(month.amount) || 0, expected: Number(month.amount) || 0 }))

  // Real per-hour x per-weekday transaction counts from the last 30 days, snapped onto the
  // same 5 canonical hour buckets used elsewhere in this dashboard.
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const values = heatmapDays.map(() => HOUR_BUCKETS.map(() => 0))
  ;(payments30d || []).forEach((row) => {
    const date = new Date(row.paid_at || row.created_at)
    const dayIndex = (date.getDay() + 6) % 7 // Mon=0..Sun=6
    values[dayIndex][hourBucketIndex(date)] += 1
  })

  const byMethod = analytics?.byMethod || {}
  const totalByMethod = Object.values(byMethod).reduce((sum, amount) => sum + Number(amount), 0)
  const methodCounts = {}
  ;(payments30d || []).forEach((row) => {
    if (row.status === 'success') methodCounts[row.method] = (methodCounts[row.method] || 0) + 1
  })
  const paymentMethodSplit = Object.entries(byMethod).map(([method, amount]) => ({
    method: mapMethod(method),
    amount: Number(amount) || 0,
    percent: totalByMethod ? Math.round((Number(amount) / totalByMethod) * 100) : 0,
    // Method-level transaction counts are only tracked here for the last 30 days.
    count: methodCounts[method] || 0,
  }))

  // "Expected revenue" per class has no direct backend field — approximated as the sum of
  // each class's active fee-structure totals, the closest real proxy for what that class is
  // expected to collect.
  const expectedByClass = new Map()
  ;(activeStructures || []).forEach((structure) => {
    if (!structure.class_name) return
    expectedByClass.set(structure.class_name, (expectedByClass.get(structure.class_name) || 0) + Number(structure.total_amount || 0))
  })
  const collectedByClass = new Map()
  ;(allSuccessPayments || []).forEach((row) => {
    const classInfo = classMap[row.student_id]
    if (!classInfo?.className) return
    collectedByClass.set(classInfo.className, (collectedByClass.get(classInfo.className) || 0) + Number(row.amount || 0))
  })

  const classNames = new Set([...expectedByClass.keys(), ...collectedByClass.keys()])
  const classTable = Array.from(classNames)
    .filter(Boolean)
    .map((className) => {
      const expectedRevenue = expectedByClass.get(className) || 0
      const collected = collectedByClass.get(className) || 0
      return {
        className: `Class ${className}`,
        expectedRevenue,
        collected,
        pending: Math.max(0, expectedRevenue - collected),
        collectionPercent: expectedRevenue ? Math.round((collected / expectedRevenue) * 100) : 0,
      }
    })
    .sort((a, b) => a.className.localeCompare(b.className, undefined, { numeric: true }))

  const efficiencyByClass = classTable.map((row) => ({ className: row.className, collectionPercent: row.collectionPercent }))
  const topPerformingClasses = [...classTable]
    .sort((a, b) => b.collectionPercent - a.collectionPercent)
    .slice(0, 3)
    .map((row) => ({ className: row.className, collectionPercent: row.collectionPercent }))

  const wingTotals = new Map()
  classTable.forEach((row) => {
    const wing = wingLabel(row.className.replace('Class ', ''))
    const bucket = wingTotals.get(wing) || { department: wing, expected: 0, collected: 0 }
    bucket.expected += row.expectedRevenue
    bucket.collected += row.collected
    wingTotals.set(wing, bucket)
  })
  const departmentComparison = Array.from(wingTotals.values())

  // A real funnel proxy built from actual counts: invoices issued, reminders sent, dues
  // partially paid, and dues fully paid. Not a literal per-student "invoiced -> reminded ->
  // paid" journey, but every figure here is real and independently sourced.
  const funnel = [
    { stage: 'Invoiced', count: (invoices || []).length },
    { stage: 'Reminded', count: (reminders || []).length },
    { stage: 'Partially Paid', count: duesRows.filter((due) => due.status === 'partially_paid').length },
    { stage: 'Fully Collected', count: duesRows.filter((due) => due.status === 'paid').length },
  ]

  // No configured monthly target exists — approximate from the trailing months' average.
  const priorMonths = monthly.slice(0, -1)
  const targetBase = priorMonths.length
    ? priorMonths.reduce((sum, month) => sum + month.collected, 0) / priorMonths.length
    : monthly.at(-1)?.collected || 0
  const target = Math.round((targetBase || 1) * 1.1)
  const currentMonthAmount = monthly.at(-1)?.collected || 0
  const targetAchievement = target ? Math.round((currentMonthAmount / target) * 100) : 0

  return {
    summary: { collectionEfficiency: successRate, recoveryRate, targetAchievement, collectionRatio },
    trend: { daily, weekly, monthly },
    heatmap: { days: heatmapDays, hours: HOUR_BUCKETS, values },
    paymentMethodSplit,
    efficiencyByClass,
    departmentComparison,
    topPerformingClasses,
    funnel,
    classWiseCollection: classTable.map((row) => ({ className: row.className, collected: row.collected })),
    table: classTable,
  }
}

// ---------------------------------------------------------------------------
// Payment Analytics (institution-wide)
// ---------------------------------------------------------------------------

export async function fetchPaymentAnalytics() {
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const since7 = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10)
  const [{ data: analytics }, { data: allPayments }, { data: last7Payments }, { data: last30Payments }, { data: refunds }, { data: failed }] =
    await Promise.all([
      apiGet('/reports/payment-analytics'),
      apiGet('/payments'),
      apiGet(`/payments?dateFrom=${since7}`),
      apiGet(`/payments?dateFrom=${since30}`),
      apiGet('/payments/refunds'),
      apiGet('/payments/failed'),
    ])

  const rows = allPayments || []
  const byMethod = new Map()
  rows.forEach((row) => {
    const bucket = byMethod.get(row.method) || { method: mapMethod(row.method), transactions: 0, revenue: 0, successCount: 0, totalCount: 0 }
    bucket.totalCount += 1
    if (row.status === 'success') {
      bucket.transactions += 1
      bucket.revenue += Number(row.amount) || 0
      bucket.successCount += 1
    }
    byMethod.set(row.method, bucket)
  })
  const methodStats = Array.from(byMethod.values()).map((bucket) => ({
    method: bucket.method,
    transactions: bucket.transactions,
    revenue: bucket.revenue,
    averageAmount: bucket.transactions ? Math.round(bucket.revenue / bucket.transactions) : 0,
    successRate: bucket.totalCount ? Math.round((bucket.successCount / bucket.totalCount) * 100) : 0,
  }))

  const totalRevenue = methodStats.reduce((sum, row) => sum + row.revenue, 0)
  const methodDistribution = methodStats.map((row) => ({
    method: row.method,
    amount: row.revenue,
    percent: totalRevenue ? Math.round((row.revenue / totalRevenue) * 100) : 0,
    count: row.transactions,
  }))

  const sumAmount = (list) => list.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  const onlineRows = rows.filter((row) => row.gateway === 'razorpay' && row.status === 'success')
  const offlineRows = rows.filter((row) => row.gateway !== 'razorpay' && row.status === 'success')
  const onlineAmount = sumAmount(onlineRows)
  const offlineAmount = sumAmount(offlineRows)
  const onlineOfflineTotal = onlineAmount + offlineAmount
  const onlineVsOffline = [
    { method: 'Online', amount: onlineAmount, percent: onlineOfflineTotal ? Math.round((onlineAmount / onlineOfflineTotal) * 100) : 0, count: onlineRows.length },
    { method: 'Offline', amount: offlineAmount, percent: onlineOfflineTotal ? Math.round((offlineAmount / onlineOfflineTotal) * 100) : 0, count: offlineRows.length },
  ]

  const byWeekday = new Map()
  ;(last7Payments || []).forEach((row) => {
    const label = new Date(row.paid_at || row.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    const bucket = byWeekday.get(label) || { label, success: 0, failed: 0 }
    if (row.status === 'success') bucket.success += 1
    if (row.status === 'failed') bucket.failed += 1
    byWeekday.set(label, bucket)
  })
  const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const successFailureTrend = WEEKDAY_ORDER.map((label) => byWeekday.get(label) || { label, success: 0, failed: 0 })

  const peakByHour = new Map()
  ;(last30Payments || []).forEach((row) => {
    const bucket = HOUR_BUCKETS[hourBucketIndex(new Date(row.paid_at || row.created_at))]
    peakByHour.set(bucket, (peakByHour.get(bucket) || 0) + 1)
  })
  const peakHours = HOUR_BUCKETS.map((label) => ({ label, transactions: peakByHour.get(label) || 0 }))

  const byReason = new Map()
  ;(failed || []).forEach((row) => {
    const reason = row.failure_reason || 'Unknown error'
    byReason.set(reason, (byReason.get(reason) || 0) + 1)
  })
  const failureAnalysis = Array.from(byReason.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)

  return {
    summary: {
      totalPayments: Number(analytics?.total) || rows.length,
      successfulPayments: Number(analytics?.success) || 0,
      failedPayments: Number(analytics?.failed) || 0,
      refunds: (refunds || []).length,
    },
    methodDistribution,
    onlineVsOffline,
    successFailureTrend,
    peakHours,
    failureAnalysis,
    table: methodStats,
  }
}

// ---------------------------------------------------------------------------
// Export / Schedule
// ---------------------------------------------------------------------------

function mapExportJob(row, fallbackName) {
  return {
    id: row.id,
    reportName: row.module || fallbackName || 'Report',
    format: (row.format || 'pdf').toUpperCase(),
    // requested_by is a user ID with no join on this endpoint — no real staff name to show
    // for historical entries; the record just created below fills in the real current user.
    generatedBy: row.requested_by ? 'Staff' : '—',
    requestedAt: row.created_at,
    status: row.status,
    // export_jobs has no file-size column — not tracked anywhere in the backend.
    fileSizeKb: 0,
  }
}

export async function fetchExportHistory() {
  const { data } = await apiGet('/reports/export/history')
  return (data || []).map((row) => mapExportJob(row))
}

export async function requestExport(payload) {
  const { data } = await apiPost('/reports/export', {
    module: payload.reportName,
    format: (payload.format || 'PDF').toLowerCase(),
  })
  const currentUser = useAuthStore.getState().user
  return { ...mapExportJob(data, payload.reportName), generatedBy: currentUser?.fullName || 'Admin' }
}
