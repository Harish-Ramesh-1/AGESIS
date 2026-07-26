import { ACCOUNTANT_ROUTES } from '../../constants/routes'

export const ACCOUNTANT_NAV_SECTIONS = [
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: ACCOUNTANT_ROUTES.dashboard,
  },
  {
    type: 'group',
    id: 'student-fee-management',
    label: 'Student Fee Management',
    icon: 'Users',
    children: [
      { id: 'student-directory', label: 'Student Directory', icon: 'UsersRound', path: ACCOUNTANT_ROUTES.studentDirectory },
      { id: 'student-fee-profile', label: 'Student Fee Profile', icon: 'Wallet', path: ACCOUNTANT_ROUTES.studentFeeProfile },
      { id: 'fee-structure', label: 'Fee Structure', icon: 'NotebookTabs', path: ACCOUNTANT_ROUTES.feeStructure },
      { id: 'assign-fees', label: 'Assign Fees', icon: 'BadgeDollarSign', path: ACCOUNTANT_ROUTES.assignFees },
      { id: 'scholarships', label: 'Scholarships & Discounts', icon: 'BadgePercent', path: ACCOUNTANT_ROUTES.scholarships },
      { id: 'fee-adjustments', label: 'Fee Adjustments', icon: 'FilePenLine', path: ACCOUNTANT_ROUTES.feeAdjustments },
    ],
  },
  {
    type: 'group',
    id: 'payments',
    label: 'Payments',
    icon: 'CreditCard',
    children: [
      { id: 'receive-payment', label: 'Receive Payment', icon: 'WalletCards', path: ACCOUNTANT_ROUTES.receivePayment },
      { id: 'payment-verification', label: 'Payment Verification', icon: 'ShieldCheck', path: ACCOUNTANT_ROUTES.paymentVerification },
      { id: 'payment-history', label: 'Payment History', icon: 'Receipt', path: ACCOUNTANT_ROUTES.paymentHistory },
      { id: 'refund-management', label: 'Refund Management', icon: 'Undo2', path: ACCOUNTANT_ROUTES.refundManagement },
      { id: 'failed-transactions', label: 'Failed Transactions', icon: 'CircleX', path: ACCOUNTANT_ROUTES.failedTransactions },
      { id: 'payment-reconciliation', label: 'Payment Reconciliation', icon: 'ClipboardCheck', path: ACCOUNTANT_ROUTES.paymentReconciliation },
    ],
  },
  {
    type: 'group',
    id: 'pending-dues',
    label: 'Pending Dues',
    icon: 'CircleDollarSign',
    children: [
      { id: 'due-list', label: 'Due List', icon: 'ListTodo', path: ACCOUNTANT_ROUTES.dueList },
      { id: 'overdue-fees', label: 'Overdue Fees', icon: 'AlertTriangle', path: ACCOUNTANT_ROUTES.overdueFees },
      { id: 'reminder-management', label: 'Reminder Management', icon: 'BellRing', path: ACCOUNTANT_ROUTES.reminderManagement },
      { id: 'late-fee-management', label: 'Late Fee Management', icon: 'Timer', path: ACCOUNTANT_ROUTES.lateFeeManagement },
    ],
  },
  {
    type: 'group',
    id: 'invoices-receipts',
    label: 'Invoices & Receipts',
    icon: 'FileText',
    children: [
      { id: 'generate-invoice', label: 'Generate Invoice', icon: 'FilePlus2', path: ACCOUNTANT_ROUTES.generateInvoice },
      { id: 'generate-receipt', label: 'Generate Receipt', icon: 'ReceiptText', path: ACCOUNTANT_ROUTES.generateReceipt },
      { id: 'bulk-invoice-generation', label: 'Bulk Invoice Generation', icon: 'FileStack', path: ACCOUNTANT_ROUTES.bulkInvoiceGeneration },
      { id: 'document-archive', label: 'Document Archive', icon: 'Archive', path: ACCOUNTANT_ROUTES.documentArchive },
    ],
  },
  {
    type: 'group',
    id: 'financial-reports',
    label: 'Financial Reports',
    icon: 'ChartColumn',
    children: [
      { id: 'daily-collection', label: 'Daily Collection', icon: 'CalendarDays', path: ACCOUNTANT_ROUTES.dailyCollection },
      { id: 'monthly-revenue', label: 'Monthly Revenue', icon: 'TrendingUp', path: ACCOUNTANT_ROUTES.monthlyRevenue },
      { id: 'outstanding-dues', label: 'Outstanding Dues', icon: 'Scale', path: ACCOUNTANT_ROUTES.outstandingDues },
      { id: 'collection-analytics', label: 'Collection Analytics', icon: 'BarChart3', path: ACCOUNTANT_ROUTES.collectionAnalytics },
      { id: 'payment-analytics', label: 'Payment Analytics', icon: 'LineChart', path: ACCOUNTANT_ROUTES.paymentAnalytics },
      { id: 'export-reports', label: 'Export Reports', icon: 'Download', path: ACCOUNTANT_ROUTES.exportReports },
    ],
  },
  {
    type: 'link',
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    path: ACCOUNTANT_ROUTES.notifications,
  },
  {
    type: 'link',
    id: 'students',
    label: 'Students',
    icon: 'GraduationCap',
    path: ACCOUNTANT_ROUTES.students,
  },
  {
    type: 'link',
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: 'ClipboardList',
    path: ACCOUNTANT_ROUTES.auditLogs,
  },
  {
    type: 'link',
    id: 'support',
    label: 'Support',
    icon: 'LifeBuoy',
    path: ACCOUNTANT_ROUTES.support,
  },
  {
    type: 'group',
    id: 'profile-settings',
    label: 'Profile & Settings',
    icon: 'Settings',
    children: [
      { id: 'accountant-profile', label: 'Accountant Profile', icon: 'IdCard', path: ACCOUNTANT_ROUTES.accountantProfile },
      { id: 'security', label: 'Security', icon: 'Lock', path: ACCOUNTANT_ROUTES.security },
      { id: 'preferences', label: 'Preferences', icon: 'SlidersHorizontal', path: ACCOUNTANT_ROUTES.preferences },
    ],
  },
]

export function getPageTitle(pathname) {
  for (const section of ACCOUNTANT_NAV_SECTIONS) {
    if (section.type === 'link' && pathname.startsWith(section.path)) return section.label
    if (section.type === 'group') {
      const child = section.children.find((item) => pathname.startsWith(item.path))
      if (child) return child.label
    }
  }
  return 'Dashboard'
}
