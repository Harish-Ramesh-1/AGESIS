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

export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',

  usersAll: '/admin/users/all',
  usersInvite: '/admin/users/invite',
  usersPendingApprovals: '/admin/users/pending-approvals',
  usersSuspended: '/admin/users/suspended',

  schoolProfile: '/admin/school/profile',
  schoolAcademicYears: '/admin/school/academic-years',
  schoolClassesSections: '/admin/school/classes-sections',
  schoolCalendar: '/admin/school/calendar',

  studentDirectory: '/admin/students/directory',
  studentAdmissions: '/admin/students/admissions',
  studentPromotion: '/admin/students/promotion',
  studentBulkImport: '/admin/students/bulk-import',

  feeStructure: '/admin/fees/structure',
  feeAssign: '/admin/fees/assign',
  feeScholarships: '/admin/fees/scholarships',
  feeAdjustments: '/admin/fees/adjustments',
  feeCategories: '/admin/fees/categories',

  paymentsOverview: '/admin/payments/overview',
  paymentsVerification: '/admin/payments/verification',
  paymentsGateway: '/admin/payments/gateway-transactions',
  paymentsRefunds: '/admin/payments/refunds',
  paymentsFailed: '/admin/payments/failed',
  paymentsReconciliation: '/admin/payments/reconciliation',

  duesList: '/admin/dues/list',
  duesOverdue: '/admin/dues/overdue',
  duesReminders: '/admin/dues/reminders',
  duesLateFeeRules: '/admin/dues/late-fee-rules',

  invoiceTemplates: '/admin/invoices/templates',
  invoiceBulkGeneration: '/admin/invoices/bulk-generation',
  invoiceReceiptArchive: '/admin/invoices/receipt-archive',
  invoiceDocumentSettings: '/admin/invoices/document-settings',

  reportsDailyCollection: '/admin/reports/daily-collection',
  reportsMonthlyRevenue: '/admin/reports/monthly-revenue',
  reportsOutstandingDues: '/admin/reports/outstanding-dues',
  reportsCollectionAnalytics: '/admin/reports/collection-analytics',
  reportsPaymentAnalytics: '/admin/reports/payment-analytics',
  reportsExport: '/admin/reports/export',

  announcements: '/admin/notifications/announcements',
  notificationTemplates: '/admin/notifications/templates',
  notificationScheduled: '/admin/notifications/scheduled',
  notificationLogs: '/admin/notifications/logs',

  auditLogs: '/admin/audit-logs',

  rolesList: '/admin/roles/list',
  rolesPermissionMatrix: '/admin/roles/permission-matrix',
  rolesAssignment: '/admin/roles/assignment',

  securitySessions: '/admin/security/sessions',
  securityAlerts: '/admin/security/alerts',
  securityPolicies: '/admin/security/policies',
  securityAccessControl: '/admin/security/access-control',

  integrationsPaymentGateway: '/admin/integrations/payment-gateway',
  integrationsSms: '/admin/integrations/sms',
  integrationsEmail: '/admin/integrations/email',
  integrationsApiWebhooks: '/admin/integrations/api-webhooks',

  settingsGeneral: '/admin/settings/general',
  settingsBranding: '/admin/settings/branding',
  settingsAcademicConfig: '/admin/settings/academic-config',
  settingsNotificationsConfig: '/admin/settings/notifications-config',

  aiInsights: '/admin/ai-insights',

  backupSchedule: '/admin/backup/schedule',
  backupHistory: '/admin/backup/history',
  backupRestore: '/admin/backup/restore',
  backupDataExport: '/admin/backup/data-export',

  support: '/admin/support',
}
