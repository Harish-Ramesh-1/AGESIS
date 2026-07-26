const DELAY_MS = 600
const ACCOUNTANT_NAME = 'Kavita Sharma'

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Cheque', 'Net Banking', 'Wallet']

// ---------------------------------------------------------------------------
// Daily Collection
// ---------------------------------------------------------------------------

const DAILY_TRANSACTIONS = [
  { time: '09:12 AM', studentName: 'Aarav Nair', receiptNumber: 'RCT-8800', method: 'UPI', collectedBy: ACCOUNTANT_NAME, amount: 45000, status: 'success' },
  { time: '09:28 AM', studentName: 'Meera Pillai', receiptNumber: 'RCT-8801', method: 'Credit Card', collectedBy: ACCOUNTANT_NAME, amount: 62000, status: 'success' },
  { time: '10:05 AM', studentName: 'Ishita Rao', receiptNumber: 'RCT-8802', method: 'Debit Card', collectedBy: ACCOUNTANT_NAME, amount: 29500, status: 'success' },
  { time: '10:40 AM', studentName: 'Sanya Kapoor', receiptNumber: 'RCT-8803', method: 'Cash', collectedBy: ACCOUNTANT_NAME, amount: 25500, status: 'partial' },
  { time: '11:15 AM', studentName: 'Vihaan Pillai', receiptNumber: 'RCT-8804', method: 'UPI', collectedBy: ACCOUNTANT_NAME, amount: 78000, status: 'success' },
  { time: '12:02 PM', studentName: 'Diya Kulkarni', receiptNumber: 'RCT-8805', method: 'Cheque', collectedBy: ACCOUNTANT_NAME, amount: 12000, status: 'partial' },
  { time: '01:20 PM', studentName: 'Kabir Menon', receiptNumber: 'RCT-8806', method: 'Net Banking', collectedBy: ACCOUNTANT_NAME, amount: 31000, status: 'success' },
  { time: '02:10 PM', studentName: 'Yash Kapoor', receiptNumber: 'RCT-8807', method: 'UPI', collectedBy: ACCOUNTANT_NAME, amount: 34000, status: 'success' },
  { time: '03:05 PM', studentName: 'Saanvi Joshi', receiptNumber: 'RCT-8808', method: 'Wallet', collectedBy: ACCOUNTANT_NAME, amount: 18500, status: 'failed' },
  { time: '03:45 PM', studentName: 'Arjun Reddy', receiptNumber: 'RCT-8809', method: 'UPI', collectedBy: ACCOUNTANT_NAME, amount: 55000, status: 'success' },
  { time: '04:30 PM', studentName: 'Kiara Shah', receiptNumber: 'RCT-8810', method: 'Credit Card', collectedBy: ACCOUNTANT_NAME, amount: 34000, status: 'success' },
]

function buildDailyCollection() {
  const successful = DAILY_TRANSACTIONS.filter((row) => row.status !== 'failed')
  const total = successful.reduce((sum, row) => sum + row.amount, 0)
  const hourlyTrend = [
    { label: '9 AM', revenue: 107000, transactions: 2 },
    { label: '10 AM', revenue: 55000, transactions: 2 },
    { label: '11 AM', revenue: 78000, transactions: 1 },
    { label: '12 PM', revenue: 12000, transactions: 1 },
    { label: '1 PM', revenue: 31000, transactions: 1 },
    { label: '2 PM', revenue: 34000, transactions: 1 },
    { label: '3 PM', revenue: 55000, transactions: 1 },
    { label: '4 PM', revenue: 34000, transactions: 1 },
  ]
  return {
    summary: {
      todaysCollection: total,
      totalTransactions: DAILY_TRANSACTIONS.length,
      averageCollection: Math.round(total / successful.length),
      pendingCollections: 4,
      collectionTarget: 450000,
      achievementPercent: Math.round((total / 450000) * 100),
    },
    hourlyTrend,
    transactions: DAILY_TRANSACTIONS,
    insights: {
      highestCollectionHour: '9 AM – 10 AM',
      topCollector: ACCOUNTANT_NAME,
      highestTransaction: { studentName: 'Vihaan Pillai', amount: 78000 },
    },
  }
}

// ---------------------------------------------------------------------------
// Monthly Revenue
// ---------------------------------------------------------------------------

const MONTHLY_TABLE = [
  { month: 'Apr 2026', revenue: 3850000, transactions: 512, averagePayment: 7520, growthPercent: 6.4 },
  { month: 'May 2026', revenue: 2100000, transactions: 298, averagePayment: 7047, growthPercent: -45.5 },
  { month: 'Jun 2026', revenue: 1650000, transactions: 231, averagePayment: 7143, growthPercent: -21.4 },
  { month: 'Jul 2026', revenue: 4285000, transactions: 626, averagePayment: 6845, growthPercent: 159.7 },
]

function buildMonthlyRevenue() {
  const currentMonth = MONTHLY_TABLE.at(-1)
  const previousMonth = MONTHLY_TABLE.at(-2)
  return {
    summary: {
      monthlyRevenue: currentMonth.revenue,
      previousMonth: previousMonth.revenue,
      growthPercent: currentMonth.growthPercent,
      targetAchievement: 92,
    },
    monthlyTrend: MONTHLY_TABLE.map((row) => ({ label: row.month.slice(0, 3), revenue: row.revenue })),
    revenueByClass: [
      { className: 'Class 6', amount: 780000 },
      { className: 'Class 7', amount: 512000 },
      { className: 'Class 8', amount: 940000 },
      { className: 'Class 9', amount: 865000 },
      { className: 'Class 10', amount: 610000 },
      { className: 'Class 11', amount: 578000 },
    ],
    revenueByFeeCategory: [
      { method: 'Tuition Fee', amount: 2971000, percent: 69, count: 412 },
      { method: 'Hostel Fee', amount: 612000, percent: 14, count: 68 },
      { method: 'Transport Fee', amount: 385000, percent: 9, count: 96 },
      { method: 'Examination Fee', amount: 145000, percent: 4, count: 38 },
      { method: 'Other', amount: 172000, percent: 4, count: 12 },
    ],
    revenueByInstallment: [
      { label: 'Installment 1', amount: 1850000 },
      { label: 'Installment 2', amount: 1420000 },
      { label: 'Installment 3', amount: 815000 },
      { label: 'Full Payment', amount: 200000 },
    ],
    forecast: [
      { label: 'Aug', revenue: 3450000 },
      { label: 'Sep', revenue: 3120000 },
      { label: 'Oct', revenue: 3680000 },
    ],
    comparison: { currentMonth: currentMonth.revenue, previousMonth: previousMonth.revenue, previousYear: 3695000 },
    monthlyTable: MONTHLY_TABLE,
  }
}

// ---------------------------------------------------------------------------
// Outstanding Dues
// ---------------------------------------------------------------------------

const OUTSTANDING_TABLE = [
  { studentId: 'std-2', studentName: 'Kabir Menon', className: '10-C', dueAmount: 62000, daysPending: 14, lateFee: 2075, priority: 'high' },
  { studentId: 'std-3', studentName: 'Diya Kulkarni', className: '6-A', dueAmount: 38500, daysPending: 9, lateFee: 900, priority: 'medium' },
  { studentId: 'std-7', studentName: 'Yash Kapoor', className: '9-A', dueAmount: 68000, daysPending: 34, lateFee: 3400, priority: 'critical' },
  { studentId: 'std-9', studentName: 'Reyansh Bhat', className: '11-A', dueAmount: 78000, daysPending: 5, lateFee: 0, priority: 'low' },
  { studentId: 'std-10', studentName: 'Saanvi Joshi', className: '6-B', dueAmount: 41500, daysPending: 35, lateFee: 2075, priority: 'critical' },
  { studentId: 'std-12', studentName: 'Arjun Reddy', className: '8-A', dueAmount: 55000, daysPending: 31, lateFee: 2750, priority: 'high' },
  { studentId: 'std-13', studentName: 'Kiara Shah', className: '10-B', dueAmount: 34000, daysPending: 0, lateFee: 0, priority: 'low' },
  { studentId: 'std-5', studentName: 'Sanya Kapoor', className: '9-A', dueAmount: 25500, daysPending: 2, lateFee: 0, priority: 'low' },
]

function buildOutstandingDues() {
  const total = OUTSTANDING_TABLE.reduce((sum, row) => sum + row.dueAmount, 0)
  const overdue = OUTSTANDING_TABLE.filter((row) => row.daysPending > 0)
  return {
    summary: {
      outstandingAmount: total,
      pendingStudents: OUTSTANDING_TABLE.length,
      overdueStudents: overdue.length,
      recoveryRate: 88,
    },
    outstandingTrend: [
      { label: 'Mar', amount: 4820000 },
      { label: 'Apr', amount: 3950000 },
      { label: 'May', amount: 3420000 },
      { label: 'Jun', amount: 3180000 },
      { label: 'Jul', amount: total },
    ],
    classWiseOutstanding: [
      { className: 'Class 6', amount: 80000 },
      { className: 'Class 8', amount: 102000 },
      { className: 'Class 9', amount: 93500 },
      { className: 'Class 10', amount: 65000 },
      { className: 'Class 11', amount: 78000 },
    ],
    feeCategoryDistribution: [
      { method: 'Tuition Fee', amount: 245500, percent: 60, count: 5 },
      { method: 'Hostel Fee', amount: 102000, percent: 25, count: 2 },
      { method: 'Transport Fee', amount: 55000, percent: 15, count: 1 },
    ],
    ageingAnalysis: [
      { bucket: '0-15 days', amount: 130000, count: 4 },
      { bucket: '16-30 days', amount: 100500, count: 2 },
      { bucket: '31-45 days', amount: 172000, count: 2 },
      { bucket: '45+ days', amount: 0, count: 0 },
    ],
    table: OUTSTANDING_TABLE,
  }
}

// ---------------------------------------------------------------------------
// Collection Analytics
// ---------------------------------------------------------------------------

const COLLECTION_TREND = {
  daily: [
    { label: 'Mon', collected: 312000, expected: 350000 },
    { label: 'Tue', collected: 289000, expected: 320000 },
    { label: 'Wed', collected: 405000, expected: 400000 },
    { label: 'Thu', collected: 378000, expected: 410000 },
    { label: 'Fri', collected: 452000, expected: 460000 },
    { label: 'Sat', collected: 184500, expected: 200000 },
  ],
  weekly: [
    { label: 'Week 1', collected: 1120000, expected: 1250000 },
    { label: 'Week 2', collected: 985000, expected: 1100000 },
    { label: 'Week 3', collected: 1340000, expected: 1400000 },
    { label: 'Week 4', collected: 840000, expected: 950000 },
  ],
  monthly: [
    { label: 'Apr', collected: 3850000, expected: 4100000 },
    { label: 'May', collected: 2100000, expected: 2600000 },
    { label: 'Jun', collected: 1650000, expected: 2000000 },
    { label: 'Jul', collected: 4285000, expected: 4500000 },
  ],
}

function buildHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM']
  const seed = [
    [8, 6, 4, 3, 2],
    [7, 9, 5, 4, 2],
    [6, 8, 7, 5, 3],
    [7, 7, 6, 6, 3],
    [9, 10, 8, 7, 4],
    [3, 4, 2, 1, 1],
    [1, 1, 1, 0, 0],
  ]
  return { days, hours, values: seed }
}

function buildCollectionAnalytics() {
  const currentMonth = COLLECTION_TREND.monthly.at(-1)
  return {
    summary: {
      collectionEfficiency: Math.round((currentMonth.collected / currentMonth.expected) * 100),
      recoveryRate: 88,
      targetAchievement: 92,
      collectionRatio: 0.95,
    },
    trend: COLLECTION_TREND,
    heatmap: buildHeatmap(),
    classWiseCollection: [
      { className: 'Class 6', expected: 850000, collected: 780000 },
      { className: 'Class 7', expected: 560000, collected: 512000 },
      { className: 'Class 8', expected: 1020000, collected: 940000 },
      { className: 'Class 9', expected: 940000, collected: 865000 },
      { className: 'Class 10', expected: 700000, collected: 610000 },
      { className: 'Class 11', expected: 640000, collected: 578000 },
    ],
    departmentComparison: [
      { department: 'Primary Wing', expected: 1650000, collected: 1520000 },
      { department: 'Middle Wing', expected: 2380000, collected: 2145000 },
      { department: 'Senior Wing', expected: 1340000, collected: 1188000 },
    ],
    topPerformingClasses: [
      { className: 'Class 8', collectionPercent: 92 },
      { className: 'Class 6', collectionPercent: 91 },
      { className: 'Class 9', collectionPercent: 92 },
    ],
    funnel: [
      { stage: 'Invoiced', count: 626 },
      { stage: 'Reminded', count: 210 },
      { stage: 'Partially Paid', count: 84 },
      { stage: 'Fully Collected', count: 542 },
    ],
    table: [
      { className: 'Class 6', expectedRevenue: 850000, collected: 780000, pending: 70000 },
      { className: 'Class 7', expectedRevenue: 560000, collected: 512000, pending: 48000 },
      { className: 'Class 8', expectedRevenue: 1020000, collected: 940000, pending: 80000 },
      { className: 'Class 9', expectedRevenue: 940000, collected: 865000, pending: 75000 },
      { className: 'Class 10', expectedRevenue: 700000, collected: 610000, pending: 90000 },
      { className: 'Class 11', expectedRevenue: 640000, collected: 578000, pending: 62000 },
    ].map((row) => ({ ...row, collectionPercent: Math.round((row.collected / row.expectedRevenue) * 100) })),
  }
}

// ---------------------------------------------------------------------------
// Payment Analytics
// ---------------------------------------------------------------------------

const METHOD_STATS = [
  { method: 'UPI', transactions: 288, revenue: 1971000, averageAmount: 6844, successRate: 96 },
  { method: 'Credit Card', transactions: 113, revenue: 771000, averageAmount: 6823, successRate: 94 },
  { method: 'Debit Card', transactions: 88, revenue: 600000, averageAmount: 6818, successRate: 95 },
  { method: 'Net Banking', transactions: 75, revenue: 514000, averageAmount: 6853, successRate: 90 },
  { method: 'Cash', transactions: 44, revenue: 300000, averageAmount: 6818, successRate: 100 },
  { method: 'Wallet', transactions: 18, revenue: 130000, averageAmount: 7222, successRate: 89 },
]

function buildPaymentAnalytics() {
  const totalTransactions = METHOD_STATS.reduce((sum, row) => sum + row.transactions, 0)
  const failed = 24
  const refunds = 11
  return {
    summary: {
      totalPayments: totalTransactions + failed,
      successfulPayments: totalTransactions,
      failedPayments: failed,
      refunds,
    },
    methodDistribution: METHOD_STATS.map((row) => ({ method: row.method, amount: row.revenue, percent: Math.round((row.revenue / METHOD_STATS.reduce((s, r) => s + r.revenue, 0)) * 100), count: row.transactions })),
    onlineVsOffline: [
      { method: 'Online', amount: 3356000, percent: 84, count: 494 },
      { method: 'Offline', amount: 630000, percent: 16, count: 132 },
    ],
    peakHours: [
      { label: '9 AM', transactions: 62 },
      { label: '11 AM', transactions: 88 },
      { label: '1 PM', transactions: 54 },
      { label: '3 PM', transactions: 71 },
      { label: '5 PM', transactions: 39 },
    ],
    failureAnalysis: [
      { reason: 'Bank server timeout', count: 9 },
      { reason: 'Insufficient balance', count: 6 },
      { reason: 'Card declined', count: 5 },
      { reason: 'User cancelled', count: 4 },
    ],
    table: METHOD_STATS,
  }
}

// ---------------------------------------------------------------------------
// Export / Schedule
// ---------------------------------------------------------------------------

let exportCounter = 5100
const EXPORT_HISTORY = [
  { id: 'EXP-5098', reportName: 'Monthly Revenue', format: 'PDF', requestedAt: '2026-07-23T10:00:00Z', status: 'completed', fileSizeKb: 212 },
  { id: 'EXP-5097', reportName: 'Outstanding Dues', format: 'CSV', requestedAt: '2026-07-22T15:30:00Z', status: 'completed', fileSizeKb: 48 },
  { id: 'EXP-5096', reportName: 'Payment Analytics', format: 'Excel', requestedAt: '2026-07-20T09:15:00Z', status: 'completed', fileSizeKb: 64 },
  { id: 'EXP-5095', reportName: 'Daily Collection', format: 'PDF', requestedAt: '2026-07-19T18:00:00Z', status: 'failed', fileSizeKb: 0 },
]

const SCHEDULED_REPORTS = [
  { id: 'SCH-1', reportName: 'Daily Collection', frequency: 'Daily', email: 'accounts@agesisschool.edu', active: true },
  { id: 'SCH-2', reportName: 'Monthly Revenue', frequency: 'Monthly', email: 'principal@agesisschool.edu', active: true },
]

export async function fetchDailyCollection() {
  await delay()
  return buildDailyCollection()
}

export async function fetchMonthlyRevenue() {
  await delay()
  return buildMonthlyRevenue()
}

export async function fetchOutstandingDues() {
  await delay()
  return buildOutstandingDues()
}

export async function fetchCollectionAnalytics() {
  await delay(750)
  return buildCollectionAnalytics()
}

export async function fetchPaymentAnalytics() {
  await delay()
  return buildPaymentAnalytics()
}

export async function requestExport(payload) {
  await delay(1000)
  exportCounter += 1
  const record = {
    id: `EXP-${exportCounter}`,
    reportName: payload.reportName,
    format: payload.format,
    requestedAt: new Date().toISOString(),
    status: 'completed',
    fileSizeKb: 40 + Math.round(Math.random() * 180),
  }
  EXPORT_HISTORY.unshift(record)
  return record
}

export async function fetchExportHistory() {
  await delay(300)
  return EXPORT_HISTORY
}

export async function scheduleReport(payload) {
  await delay(600)
  const record = { id: `SCH-${SCHEDULED_REPORTS.length + 1}`, ...payload, active: true }
  SCHEDULED_REPORTS.unshift(record)
  return record
}

export async function fetchScheduledReports() {
  await delay(300)
  return SCHEDULED_REPORTS
}

export async function toggleSchedule(id) {
  await delay(300)
  const record = SCHEDULED_REPORTS.find((item) => item.id === id)
  if (record) record.active = !record.active
  return record
}

export { ACCOUNTANT_NAME }
