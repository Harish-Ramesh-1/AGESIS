const DELAY_MS = 650

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MOCK_SUMMARY = {
  hero: {
    accountantName: 'Kavita Sharma',
    department: 'Accounts & Finance',
    academicYear: '2025-2026',
    todaysCollection: 184500,
    todaysCollectionCount: 27,
    shiftStatus: 'Morning Shift · Active',
    shiftStartedAt: '09:00 AM',
  },
  kpis: {
    todaysCollections: { amount: 184500, count: 27 },
    monthlyCollections: { amount: 4285000, growthPercent: 12.4 },
    pendingDues: { amount: 962000, count: 143 },
    overdueAccounts: { amount: 318500, count: 46 },
    successfulPayments: { count: 25, successRate: 92.6 },
    failedTransactions: { count: 2, retryRequired: 2 },
    refundRequests: { pending: 4, approved: 11 },
  },
}

const MOCK_PERFORMANCE = {
  target: 250000,
  collected: 184500,
  remaining: 65500,
  percent: 74,
}

const MOCK_UPCOMING_TASKS = [
  {
    id: 't1',
    title: 'Pending Refund Approval',
    description: '4 refund requests awaiting sign-off',
    due: 'Today, 5:00 PM',
    icon: 'Undo2',
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Invoice Generation',
    description: '32 invoices scheduled for this billing cycle',
    due: 'Tomorrow',
    icon: 'FileText',
    priority: 'medium',
  },
  {
    id: 't3',
    title: 'Fee Reminder Schedule',
    description: 'Send reminders to 46 overdue accounts',
    due: '25 Jul 2026',
    icon: 'BellRing',
    priority: 'medium',
  },
  {
    id: 't4',
    title: 'Payment Verification',
    description: '6 UPI payments pending bank confirmation',
    due: 'Today, 6:30 PM',
    icon: 'ShieldCheck',
    priority: 'high',
  },
  {
    id: 't5',
    title: 'Late Fee Review',
    description: 'Review late fee waivers for 3 applications',
    due: '28 Jul 2026',
    icon: 'Scale',
    priority: 'low',
  },
]

const MOCK_SYSTEM_STATUS = [
  { id: 'gateway', label: 'Payment Gateway', status: 'online', detail: 'Razorpay · 99.98% uptime' },
  { id: 'database', label: 'Database', status: 'healthy', detail: 'Response time 42ms' },
  { id: 'notifications', label: 'Notification Service', status: 'running', detail: 'Queue: 3 pending' },
  { id: 'email', label: 'Email Service', status: 'connected', detail: 'Last sync 2 min ago' },
]

const MOCK_REVENUE = {
  today: [
    { label: '9 AM', revenue: 22000, transactions: 3, growthPercent: 4.2 },
    { label: '11 AM', revenue: 45000, transactions: 6, growthPercent: 8.1 },
    { label: '1 PM', revenue: 38000, transactions: 5, growthPercent: -2.4 },
    { label: '3 PM', revenue: 52000, transactions: 8, growthPercent: 11.6 },
    { label: '5 PM', revenue: 27500, transactions: 5, growthPercent: 3.0 },
  ],
  week: [
    { label: 'Mon', revenue: 312000, transactions: 42, growthPercent: 5.1 },
    { label: 'Tue', revenue: 289000, transactions: 38, growthPercent: -7.4 },
    { label: 'Wed', revenue: 405000, transactions: 55, growthPercent: 14.0 },
    { label: 'Thu', revenue: 378000, transactions: 49, growthPercent: -6.7 },
    { label: 'Fri', revenue: 452000, transactions: 61, growthPercent: 19.6 },
    { label: 'Sat', revenue: 184500, transactions: 27, growthPercent: -59.2 },
    { label: 'Sun', revenue: 96000, transactions: 14, growthPercent: -48.0 },
  ],
  month: [
    { label: 'Week 1', revenue: 1120000, transactions: 162, growthPercent: 8.2 },
    { label: 'Week 2', revenue: 985000, transactions: 145, growthPercent: -12.1 },
    { label: 'Week 3', revenue: 1340000, transactions: 198, growthPercent: 36.0 },
    { label: 'Week 4', revenue: 840000, transactions: 121, growthPercent: -37.3 },
  ],
  year: [
    { label: 'Apr', revenue: 3850000, transactions: 512, growthPercent: 6.4 },
    { label: 'May', revenue: 2100000, transactions: 298, growthPercent: -45.5 },
    { label: 'Jun', revenue: 1650000, transactions: 231, growthPercent: -21.4 },
    { label: 'Jul', revenue: 4285000, transactions: 626, growthPercent: 159.7 },
    { label: 'Aug', revenue: 3200000, transactions: 445, growthPercent: -25.3 },
    { label: 'Sep', revenue: 2950000, transactions: 402, growthPercent: -7.8 },
    { label: 'Oct', revenue: 3400000, transactions: 468, growthPercent: 15.3 },
    { label: 'Nov', revenue: 3100000, transactions: 421, growthPercent: -8.8 },
    { label: 'Dec', revenue: 2800000, transactions: 379, growthPercent: -9.7 },
    { label: 'Jan', revenue: 4650000, transactions: 612, growthPercent: 66.1 },
    { label: 'Feb', revenue: 3050000, transactions: 402, growthPercent: -34.4 },
    { label: 'Mar', revenue: 2400000, transactions: 318, growthPercent: -21.3 },
  ],
}

const MOCK_PAYMENT_METHODS = [
  { method: 'UPI', percent: 46, amount: 1971000, count: 288 },
  { method: 'Credit Card', percent: 18, amount: 771000, count: 113 },
  { method: 'Debit Card', percent: 14, amount: 600000, count: 88 },
  { method: 'Net Banking', percent: 12, amount: 514000, count: 75 },
  { method: 'Cash', percent: 7, amount: 300000, count: 44 },
  { method: 'Wallet', percent: 3, amount: 130000, count: 18 },
]

const MOCK_PENDING_DUES = [
  { id: 'pd1', student: 'Aarav Nair', className: '8-B', amount: 45000, dueDate: '2026-07-28', daysOverdue: 0, status: 'due-soon' },
  { id: 'pd2', student: 'Diya Kulkarni', className: '6-A', amount: 38500, dueDate: '2026-07-15', daysOverdue: 9, status: 'overdue' },
  { id: 'pd3', student: 'Kabir Menon', className: '10-C', amount: 62000, dueDate: '2026-07-30', daysOverdue: 0, status: 'due-soon' },
  { id: 'pd4', student: 'Ishita Rao', className: '7-A', amount: 29500, dueDate: '2026-07-10', daysOverdue: 14, status: 'overdue' },
  { id: 'pd5', student: 'Vihaan Pillai', className: '9-B', amount: 51000, dueDate: '2026-08-02', daysOverdue: 0, status: 'pending' },
  { id: 'pd6', student: 'Ananya Iyer', className: '5-C', amount: 33000, dueDate: '2026-07-20', daysOverdue: 4, status: 'overdue' },
  { id: 'pd7', student: 'Reyansh Bhat', className: '11-A', amount: 78000, dueDate: '2026-08-05', daysOverdue: 0, status: 'pending' },
  { id: 'pd8', student: 'Myra Desai', className: '4-B', amount: 26500, dueDate: '2026-07-22', daysOverdue: 2, status: 'overdue' },
]

const MOCK_OVERDUE_ACCOUNTS = [
  { id: 'oa1', student: 'Yash Kapoor', className: '9-A', amount: 68000, lateFee: 3400, daysOverdue: 42, priority: 'critical', parentPhone: '+91 98450 12233' },
  { id: 'oa2', student: 'Saanvi Joshi', className: '6-B', amount: 41500, lateFee: 2075, daysOverdue: 35, priority: 'high', parentPhone: '+91 90080 44521' },
  { id: 'oa3', student: 'Arjun Reddy', className: '8-A', amount: 55000, lateFee: 2750, daysOverdue: 31, priority: 'high', parentPhone: '+91 97400 11298' },
  { id: 'oa4', student: 'Kiara Shah', className: '10-B', amount: 34000, lateFee: 1700, daysOverdue: 48, priority: 'critical', parentPhone: '+91 99000 55667' },
]

const MOCK_RECENT_TRANSACTIONS = [
  { id: 'TXN-58231', student: 'Aarav Nair', method: 'UPI', amount: 45000, status: 'success', date: '2026-07-24T09:12:00Z' },
  { id: 'TXN-58230', student: 'Meera Pillai', method: 'Credit Card', amount: 62000, status: 'success', date: '2026-07-24T09:05:00Z' },
  { id: 'TXN-58229', student: 'Rohan Verma', method: 'Net Banking', amount: 28500, status: 'failed', date: '2026-07-24T08:52:00Z' },
  { id: 'TXN-58228', student: 'Ishita Rao', method: 'Debit Card', amount: 29500, status: 'success', date: '2026-07-24T08:40:00Z' },
  { id: 'TXN-58227', student: 'Vihaan Pillai', method: 'UPI', amount: 51000, status: 'success', date: '2026-07-24T08:22:00Z' },
  { id: 'TXN-58226', student: 'Ananya Iyer', method: 'Cash', amount: 33000, status: 'success', date: '2026-07-24T08:10:00Z' },
  { id: 'TXN-58225', student: 'Reyansh Bhat', method: 'UPI', amount: 78000, status: 'pending', date: '2026-07-24T07:58:00Z' },
  { id: 'TXN-58224', student: 'Myra Desai', method: 'Wallet', amount: 26500, status: 'success', date: '2026-07-24T07:45:00Z' },
  { id: 'TXN-58223', student: 'Kabir Menon', method: 'UPI', amount: 62000, status: 'failed', date: '2026-07-23T18:30:00Z' },
  { id: 'TXN-58222', student: 'Diya Kulkarni', method: 'Credit Card', amount: 38500, status: 'success', date: '2026-07-23T17:12:00Z' },
]

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'payment', title: 'Payment Received', description: '₹45,000 received from Aarav Nair via UPI.', priority: 'low', timestamp: '2026-07-24T09:12:00Z', actionLabel: 'View Transaction', unread: true },
  { id: 'n2', type: 'refund', title: 'New Refund Request', description: 'Diya Kulkarni requested a refund of ₹5,000.', priority: 'medium', timestamp: '2026-07-24T08:55:00Z', actionLabel: 'Review Request', unread: true },
  { id: 'n3', type: 'failed', title: 'Payment Failed', description: 'Net Banking payment of ₹28,500 from Rohan Verma failed.', priority: 'high', timestamp: '2026-07-24T08:52:00Z', actionLabel: 'Retry Payment', unread: true },
  { id: 'n4', type: 'invoice', title: 'Invoice Generated', description: 'Invoice INV-30456 generated for Vihaan Pillai.', priority: 'low', timestamp: '2026-07-24T08:22:00Z', actionLabel: 'View Invoice', unread: false },
  { id: 'n5', type: 'reminder', title: 'Reminder Delivered', description: 'Fee reminder sent to 12 overdue accounts.', priority: 'low', timestamp: '2026-07-24T07:30:00Z', actionLabel: 'View List', unread: false },
  { id: 'n6', type: 'system', title: 'System Alert', description: 'Scheduled maintenance window tonight 11 PM–12 AM.', priority: 'medium', timestamp: '2026-07-23T16:00:00Z', actionLabel: 'Dismiss', unread: false },
]

const MOCK_STUDENT_STATS = { registered: 1240, active: 1198 }

export async function fetchSummary() {
  await delay()
  return MOCK_SUMMARY
}

export async function fetchPerformance() {
  await delay()
  return { ...MOCK_PERFORMANCE, upcomingTasks: MOCK_UPCOMING_TASKS, systemStatus: MOCK_SYSTEM_STATUS }
}

export async function fetchRevenue(range) {
  await delay()
  return { range, points: MOCK_REVENUE[range] ?? MOCK_REVENUE.month }
}

export async function fetchPaymentMethods() {
  await delay()
  return MOCK_PAYMENT_METHODS
}

export async function fetchPendingDues() {
  await delay()
  return MOCK_PENDING_DUES
}

export async function fetchOverdueAccounts() {
  await delay()
  return MOCK_OVERDUE_ACCOUNTS
}

export async function fetchRecentTransactions() {
  await delay()
  return MOCK_RECENT_TRANSACTIONS
}

export async function fetchNotifications() {
  await delay()
  return MOCK_NOTIFICATIONS
}

export async function fetchStudentStats() {
  await delay()
  return MOCK_STUDENT_STATS
}
