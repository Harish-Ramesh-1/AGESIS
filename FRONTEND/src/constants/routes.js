export const PARENT_ROUTES = {
  dashboard: '/parent/dashboard',
  feeDetails: '/parent/fees/details',
  payFees: '/parent/fees/pay',
  pendingDues: '/parent/fees/dues',
  paymentHistory: '/parent/payments/history',
  invoices: '/parent/payments/invoices',
  rewards: '/parent/engagement/rewards',
  notifications: '/parent/engagement/notifications',
  studentProfile: '/parent/profile/student',
  settings: '/parent/profile/settings',
  support: '/parent/support',
}

export const ACCOUNTANT_ROUTES = {
  dashboard: '/accountant/dashboard',

  studentDirectory: '/accountant/students/directory',
  studentFeeProfile: '/accountant/students/fee-profile',
  feeStructure: '/accountant/fees/structure',
  assignFees: '/accountant/fees/assign',
  scholarships: '/accountant/fees/scholarships',
  feeAdjustments: '/accountant/fees/adjustments',

  receivePayment: '/accountant/payments/receive',
  paymentVerification: '/accountant/payments/verification',
  paymentHistory: '/accountant/payments/history',
  refundManagement: '/accountant/payments/refunds',
  failedTransactions: '/accountant/payments/failed',
  paymentReconciliation: '/accountant/payments/reconciliation',

  dueList: '/accountant/dues/list',
  overdueFees: '/accountant/dues/overdue',
  reminderManagement: '/accountant/dues/reminders',
  lateFeeManagement: '/accountant/dues/late-fees',

  generateInvoice: '/accountant/documents/generate-invoice',
  generateReceipt: '/accountant/documents/generate-receipt',
  bulkInvoiceGeneration: '/accountant/documents/bulk-invoices',
  documentArchive: '/accountant/documents/archive',

  dailyCollection: '/accountant/reports/daily-collection',
  monthlyRevenue: '/accountant/reports/monthly-revenue',
  outstandingDues: '/accountant/reports/outstanding-dues',
  collectionAnalytics: '/accountant/reports/collection-analytics',
  paymentAnalytics: '/accountant/reports/payment-analytics',
  exportReports: '/accountant/reports/export',

  notifications: '/accountant/notifications',
  students: '/accountant/students/overview',
  auditLogs: '/accountant/audit-logs',
  support: '/accountant/support',

  accountantProfile: '/accountant/settings/profile',
  security: '/accountant/settings/security',
  preferences: '/accountant/settings/preferences',
}
