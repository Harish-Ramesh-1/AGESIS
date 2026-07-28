import { ADMIN_ROUTES } from '../../constants/routes'

export const ADMIN_NAV_SECTIONS = [
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: ADMIN_ROUTES.dashboard,
  },
  {
    type: 'group',
    id: 'user-management',
    label: 'User Management',
    icon: 'Users',
    children: [
      { id: 'all-users', label: 'All Users', icon: 'UsersRound', path: ADMIN_ROUTES.usersAll },
      { id: 'invite-user', label: 'Add / Invite User', icon: 'UserPlus', path: ADMIN_ROUTES.usersInvite },
      { id: 'pending-approvals', label: 'Pending Approvals', icon: 'UserCheck', path: ADMIN_ROUTES.usersPendingApprovals },
      { id: 'suspended-accounts', label: 'Suspended Accounts', icon: 'UserX', path: ADMIN_ROUTES.usersSuspended },
    ],
  },
  {
    type: 'group',
    id: 'school-management',
    label: 'School Management',
    icon: 'School',
    children: [
      { id: 'school-profile', label: 'School Profile', icon: 'Landmark', path: ADMIN_ROUTES.schoolProfile },
      { id: 'academic-years', label: 'Academic Years & Terms', icon: 'CalendarRange', path: ADMIN_ROUTES.schoolAcademicYears },
      { id: 'classes-sections', label: 'Classes & Sections', icon: 'LayoutGrid', path: ADMIN_ROUTES.schoolClassesSections },
      { id: 'academic-calendar', label: 'Academic Calendar', icon: 'CalendarDays', path: ADMIN_ROUTES.schoolCalendar },
    ],
  },
  {
    type: 'group',
    id: 'student-management',
    label: 'Student Management',
    icon: 'GraduationCap',
    children: [
      { id: 'student-directory', label: 'Student Directory', icon: 'UsersRound', path: ADMIN_ROUTES.studentDirectory },
      { id: 'admissions', label: 'Admissions', icon: 'ClipboardPlus', path: ADMIN_ROUTES.studentAdmissions },
      { id: 'promotion-transfer', label: 'Promotion & Transfer', icon: 'ArrowRightLeft', path: ADMIN_ROUTES.studentPromotion },
      { id: 'bulk-import', label: 'Bulk Import Students', icon: 'FileUp', path: ADMIN_ROUTES.studentBulkImport },
    ],
  },
  {
    type: 'group',
    id: 'fee-structure-management',
    label: 'Fee Structure Management',
    icon: 'NotebookTabs',
    children: [
      { id: 'fee-structure', label: 'Fee Structure', icon: 'NotebookTabs', path: ADMIN_ROUTES.feeStructure },
      { id: 'assign-fees', label: 'Assign Fees', icon: 'BadgeDollarSign', path: ADMIN_ROUTES.feeAssign },
      { id: 'scholarships', label: 'Scholarships & Discounts', icon: 'BadgePercent', path: ADMIN_ROUTES.feeScholarships },
      { id: 'fee-adjustments', label: 'Fee Adjustments', icon: 'FilePenLine', path: ADMIN_ROUTES.feeAdjustments },
      { id: 'fee-categories', label: 'Fee Categories', icon: 'Tags', path: ADMIN_ROUTES.feeCategories },
    ],
  },
  {
    type: 'group',
    id: 'payments-management',
    label: 'Payments Management',
    icon: 'CreditCard',
    children: [
      { id: 'payments-overview', label: 'Payments Overview', icon: 'WalletCards', path: ADMIN_ROUTES.paymentsOverview },
      { id: 'payment-verification', label: 'Payment Verification', icon: 'ShieldCheck', path: ADMIN_ROUTES.paymentsVerification },
      { id: 'gateway-transactions', label: 'Gateway Transactions', icon: 'ArrowLeftRight', path: ADMIN_ROUTES.paymentsGateway },
      { id: 'refund-approvals', label: 'Refund Approvals', icon: 'Undo2', path: ADMIN_ROUTES.paymentsRefunds },
      { id: 'failed-transactions', label: 'Failed Transactions', icon: 'CircleX', path: ADMIN_ROUTES.paymentsFailed },
      { id: 'payment-reconciliation', label: 'Payment Reconciliation', icon: 'ClipboardCheck', path: ADMIN_ROUTES.paymentsReconciliation },
    ],
  },
  {
    type: 'group',
    id: 'pending-dues',
    label: 'Pending Dues',
    icon: 'CircleDollarSign',
    children: [
      { id: 'due-list', label: 'Due List', icon: 'ListTodo', path: ADMIN_ROUTES.duesList },
      { id: 'overdue-fees', label: 'Overdue Fees', icon: 'AlertTriangle', path: ADMIN_ROUTES.duesOverdue },
      { id: 'reminder-management', label: 'Reminder Management', icon: 'BellRing', path: ADMIN_ROUTES.duesReminders },
      { id: 'late-fee-rules', label: 'Late Fee Rules', icon: 'Timer', path: ADMIN_ROUTES.duesLateFeeRules },
    ],
  },
  {
    type: 'group',
    id: 'invoices-receipts',
    label: 'Invoices & Receipts',
    icon: 'FileText',
    children: [
      { id: 'invoice-templates', label: 'Invoice Templates', icon: 'FileStack', path: ADMIN_ROUTES.invoiceTemplates },
      { id: 'bulk-invoice-generation', label: 'Bulk Invoice Generation', icon: 'FilePlus2', path: ADMIN_ROUTES.invoiceBulkGeneration },
      { id: 'receipt-archive', label: 'Receipt Archive', icon: 'Archive', path: ADMIN_ROUTES.invoiceReceiptArchive },
      { id: 'document-settings', label: 'Document Settings', icon: 'FileCog', path: ADMIN_ROUTES.invoiceDocumentSettings },
    ],
  },
  {
    type: 'group',
    id: 'financial-reports',
    label: 'Financial Reports',
    icon: 'ChartColumn',
    children: [
      { id: 'daily-collection', label: 'Daily Collection', icon: 'CalendarDays', path: ADMIN_ROUTES.reportsDailyCollection },
      { id: 'monthly-revenue', label: 'Monthly Revenue', icon: 'TrendingUp', path: ADMIN_ROUTES.reportsMonthlyRevenue },
      { id: 'outstanding-dues', label: 'Outstanding Dues', icon: 'Scale', path: ADMIN_ROUTES.reportsOutstandingDues },
      { id: 'collection-analytics', label: 'Collection Analytics', icon: 'BarChart3', path: ADMIN_ROUTES.reportsCollectionAnalytics },
      { id: 'payment-analytics', label: 'Payment Analytics', icon: 'LineChart', path: ADMIN_ROUTES.reportsPaymentAnalytics },
      { id: 'export-reports', label: 'Export Reports', icon: 'Download', path: ADMIN_ROUTES.reportsExport },
    ],
  },
  {
    type: 'group',
    id: 'notifications-announcements',
    label: 'Notifications & Announcements',
    icon: 'Bell',
    children: [
      { id: 'announcements', label: 'Announcements', icon: 'Megaphone', path: ADMIN_ROUTES.announcements },
      { id: 'notification-templates', label: 'Notification Templates', icon: 'FileText', path: ADMIN_ROUTES.notificationTemplates },
      { id: 'scheduled-notifications', label: 'Scheduled Notifications', icon: 'CalendarClock', path: ADMIN_ROUTES.notificationScheduled },
      { id: 'notification-logs', label: 'Notification Logs', icon: 'ScrollText', path: ADMIN_ROUTES.notificationLogs },
    ],
  },
  {
    type: 'link',
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: 'ClipboardList',
    path: ADMIN_ROUTES.auditLogs,
  },
  {
    type: 'group',
    id: 'roles-permissions',
    label: 'Roles & Permissions',
    icon: 'Lock',
    children: [
      { id: 'roles-list', label: 'Roles List', icon: 'Layers', path: ADMIN_ROUTES.rolesList },
      { id: 'permission-matrix', label: 'Permission Matrix', icon: 'Grid3x3', path: ADMIN_ROUTES.rolesPermissionMatrix },
      { id: 'role-assignment', label: 'Role Assignment', icon: 'UserCog', path: ADMIN_ROUTES.rolesAssignment },
    ],
  },
  {
    type: 'group',
    id: 'security-center',
    label: 'Security Center',
    icon: 'ShieldCheck',
    children: [
      { id: 'login-sessions', label: 'Login Activity & Sessions', icon: 'MonitorSmartphone', path: ADMIN_ROUTES.securitySessions },
      { id: 'security-alerts', label: 'Security Alerts', icon: 'ShieldAlert', path: ADMIN_ROUTES.securityAlerts },
      { id: 'security-policies', label: 'Security Policies', icon: 'ShieldEllipsis', path: ADMIN_ROUTES.securityPolicies },
      { id: 'access-control', label: 'Access Control', icon: 'KeyRound', path: ADMIN_ROUTES.securityAccessControl },
    ],
  },
  {
    type: 'group',
    id: 'integrations',
    label: 'Integrations',
    icon: 'Plug',
    children: [
      { id: 'payment-gateway-integration', label: 'Payment Gateway', icon: 'CreditCard', path: ADMIN_ROUTES.integrationsPaymentGateway },
      { id: 'sms-integration', label: 'SMS Gateway', icon: 'MessageSquareText', path: ADMIN_ROUTES.integrationsSms },
      { id: 'email-integration', label: 'Email Service', icon: 'Mail', path: ADMIN_ROUTES.integrationsEmail },
      { id: 'api-webhooks', label: 'API & Webhooks', icon: 'Webhook', path: ADMIN_ROUTES.integrationsApiWebhooks },
    ],
  },
  {
    type: 'group',
    id: 'system-settings',
    label: 'System Settings',
    icon: 'Settings',
    children: [
      { id: 'general-settings', label: 'General Settings', icon: 'Settings2', path: ADMIN_ROUTES.settingsGeneral },
      { id: 'branding-settings', label: 'Branding', icon: 'Palette', path: ADMIN_ROUTES.settingsBranding },
      { id: 'academic-configuration', label: 'Academic Configuration', icon: 'BookOpen', path: ADMIN_ROUTES.settingsAcademicConfig },
      { id: 'notification-configuration', label: 'Notification Configuration', icon: 'BellDot', path: ADMIN_ROUTES.settingsNotificationsConfig },
    ],
  },
  {
    type: 'link',
    id: 'ai-insights',
    label: 'AI Insights',
    icon: 'Sparkles',
    path: ADMIN_ROUTES.aiInsights,
  },
  {
    type: 'group',
    id: 'backup-recovery',
    label: 'Backup & Recovery',
    icon: 'DatabaseBackup',
    children: [
      { id: 'backup-schedule', label: 'Backup Schedule', icon: 'CalendarClock', path: ADMIN_ROUTES.backupSchedule },
      { id: 'backup-history', label: 'Backup History', icon: 'History', path: ADMIN_ROUTES.backupHistory },
      { id: 'restore-data', label: 'Restore', icon: 'RotateCcw', path: ADMIN_ROUTES.backupRestore },
      { id: 'data-export', label: 'Data Export', icon: 'Download', path: ADMIN_ROUTES.backupDataExport },
    ],
  },
  {
    type: 'link',
    id: 'support',
    label: 'Support & Help Center',
    icon: 'LifeBuoy',
    path: ADMIN_ROUTES.support,
  },
  {
    type: 'link',
    id: 'my-account',
    label: 'My Account',
    icon: 'UserCog',
    path: ADMIN_ROUTES.myAccount,
  },
]

export function getPageTitle(pathname) {
  for (const section of ADMIN_NAV_SECTIONS) {
    if (section.type === 'link' && pathname.startsWith(section.path)) return section.label
    if (section.type === 'group') {
      const child = section.children.find((item) => pathname.startsWith(item.path))
      if (child) return child.label
    }
  }
  return 'Dashboard'
}
