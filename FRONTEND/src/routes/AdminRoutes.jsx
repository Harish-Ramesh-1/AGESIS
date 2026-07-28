import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminDashboardLayout from '../layouts/AdminDashboardLayout'
import { ADMIN_ROUTES } from '../constants/routes'

const Dashboard = lazy(() => import('../features/admin/dashboard').then((m) => ({ default: m.Dashboard })))

const AllUsers = lazy(() => import('../features/admin/user-management').then((m) => ({ default: m.AllUsers })))
const InviteUser = lazy(() => import('../features/admin/user-management').then((m) => ({ default: m.InviteUser })))
const PendingUserApprovals = lazy(() =>
  import('../features/admin/user-management').then((m) => ({ default: m.PendingApprovals })),
)
const SuspendedAccounts = lazy(() =>
  import('../features/admin/user-management').then((m) => ({ default: m.SuspendedAccounts })),
)

const SchoolProfile = lazy(() => import('../features/admin/school-management').then((m) => ({ default: m.SchoolProfile })))
const AcademicYears = lazy(() => import('../features/admin/school-management').then((m) => ({ default: m.AcademicYears })))
const ClassesSections = lazy(() =>
  import('../features/admin/school-management').then((m) => ({ default: m.ClassesSections })),
)
const AcademicCalendar = lazy(() =>
  import('../features/admin/school-management').then((m) => ({ default: m.AcademicCalendar })),
)

const StudentDirectory = lazy(() =>
  import('../features/admin/student-management').then((m) => ({ default: m.StudentDirectory })),
)
const Admissions = lazy(() => import('../features/admin/student-management').then((m) => ({ default: m.Admissions })))
const PromotionTransfer = lazy(() =>
  import('../features/admin/student-management').then((m) => ({ default: m.PromotionTransfer })),
)
const BulkImportStudents = lazy(() =>
  import('../features/admin/student-management').then((m) => ({ default: m.BulkImportStudents })),
)

const FeeStructure = lazy(() => import('../features/admin/fee-structure').then((m) => ({ default: m.FeeStructure })))
const AssignFees = lazy(() => import('../features/admin/fee-structure').then((m) => ({ default: m.AssignFees })))
const Scholarships = lazy(() => import('../features/admin/fee-structure').then((m) => ({ default: m.Scholarships })))
const FeeAdjustments = lazy(() =>
  import('../features/admin/fee-structure').then((m) => ({ default: m.FeeAdjustments })),
)
const FeeCategories = lazy(() => import('../features/admin/fee-structure').then((m) => ({ default: m.FeeCategories })))

const PaymentsOverview = lazy(() => import('../features/admin/payments').then((m) => ({ default: m.PaymentsOverview })))
const PaymentVerification = lazy(() =>
  import('../features/admin/payments').then((m) => ({ default: m.PaymentVerification })),
)
const GatewayTransactions = lazy(() =>
  import('../features/admin/payments').then((m) => ({ default: m.GatewayTransactions })),
)
const RefundApprovals = lazy(() => import('../features/admin/payments').then((m) => ({ default: m.RefundApprovals })))
const FailedTransactions = lazy(() =>
  import('../features/admin/payments').then((m) => ({ default: m.FailedTransactions })),
)
const PaymentReconciliation = lazy(() =>
  import('../features/admin/payments').then((m) => ({ default: m.PaymentReconciliation })),
)

const DueList = lazy(() => import('../features/admin/pending-dues').then((m) => ({ default: m.DueList })))
const OverdueFees = lazy(() => import('../features/admin/pending-dues').then((m) => ({ default: m.OverdueFees })))
const ReminderManagement = lazy(() =>
  import('../features/admin/pending-dues').then((m) => ({ default: m.ReminderManagement })),
)
const LateFeeRules = lazy(() => import('../features/admin/pending-dues').then((m) => ({ default: m.LateFeeRules })))

const InvoiceTemplates = lazy(() =>
  import('../features/admin/invoices-receipts').then((m) => ({ default: m.InvoiceTemplates })),
)
const BulkInvoiceGeneration = lazy(() =>
  import('../features/admin/invoices-receipts').then((m) => ({ default: m.BulkInvoiceGeneration })),
)
const ReceiptArchive = lazy(() =>
  import('../features/admin/invoices-receipts').then((m) => ({ default: m.ReceiptArchive })),
)
const DocumentSettings = lazy(() =>
  import('../features/admin/invoices-receipts').then((m) => ({ default: m.DocumentSettings })),
)

const DailyCollection = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.DailyCollection })),
)
const MonthlyRevenue = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.MonthlyRevenue })),
)
const OutstandingDues = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.OutstandingDues })),
)
const CollectionAnalytics = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.CollectionAnalytics })),
)
const PaymentAnalytics = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.PaymentAnalytics })),
)
const ExportReports = lazy(() =>
  import('../features/admin/financial-reports').then((m) => ({ default: m.ExportReports })),
)

const Announcements = lazy(() => import('../features/admin/notifications').then((m) => ({ default: m.Announcements })))
const NotificationTemplates = lazy(() =>
  import('../features/admin/notifications').then((m) => ({ default: m.NotificationTemplates })),
)
const ScheduledNotifications = lazy(() =>
  import('../features/admin/notifications').then((m) => ({ default: m.ScheduledNotifications })),
)
const NotificationLogs = lazy(() =>
  import('../features/admin/notifications').then((m) => ({ default: m.NotificationLogs })),
)

const AuditLogs = lazy(() => import('../features/admin/audit-logs').then((m) => ({ default: m.AuditLogs })))

const RolesList = lazy(() => import('../features/admin/roles-permissions').then((m) => ({ default: m.RolesList })))
const PermissionMatrix = lazy(() =>
  import('../features/admin/roles-permissions').then((m) => ({ default: m.PermissionMatrix })),
)
const RoleAssignment = lazy(() =>
  import('../features/admin/roles-permissions').then((m) => ({ default: m.RoleAssignment })),
)

const LoginSessions = lazy(() =>
  import('../features/admin/security-center').then((m) => ({ default: m.LoginSessions })),
)
const SecurityAlerts = lazy(() =>
  import('../features/admin/security-center').then((m) => ({ default: m.SecurityAlerts })),
)
const SecurityPolicies = lazy(() =>
  import('../features/admin/security-center').then((m) => ({ default: m.SecurityPolicies })),
)
const AccessControl = lazy(() =>
  import('../features/admin/security-center').then((m) => ({ default: m.AccessControl })),
)

const PaymentGatewayIntegration = lazy(() =>
  import('../features/admin/integrations').then((m) => ({ default: m.PaymentGatewayIntegration })),
)
const SmsIntegration = lazy(() => import('../features/admin/integrations').then((m) => ({ default: m.SmsIntegration })))
const EmailIntegration = lazy(() =>
  import('../features/admin/integrations').then((m) => ({ default: m.EmailIntegration })),
)
const ApiWebhooks = lazy(() => import('../features/admin/integrations').then((m) => ({ default: m.ApiWebhooks })))

const GeneralSettings = lazy(() =>
  import('../features/admin/system-settings').then((m) => ({ default: m.GeneralSettings })),
)
const BrandingSettings = lazy(() =>
  import('../features/admin/system-settings').then((m) => ({ default: m.BrandingSettings })),
)
const AcademicConfiguration = lazy(() =>
  import('../features/admin/system-settings').then((m) => ({ default: m.AcademicConfiguration })),
)
const NotificationConfiguration = lazy(() =>
  import('../features/admin/system-settings').then((m) => ({ default: m.NotificationConfiguration })),
)

const AiInsights = lazy(() => import('../features/admin/ai-insights').then((m) => ({ default: m.AiInsights })))

const BackupSchedule = lazy(() =>
  import('../features/admin/backup-recovery').then((m) => ({ default: m.BackupSchedule })),
)
const BackupHistory = lazy(() =>
  import('../features/admin/backup-recovery').then((m) => ({ default: m.BackupHistory })),
)
const RestoreData = lazy(() => import('../features/admin/backup-recovery').then((m) => ({ default: m.RestoreData })))
const DataExport = lazy(() => import('../features/admin/backup-recovery').then((m) => ({ default: m.DataExport })))

const Support = lazy(() => import('../features/admin/support').then((m) => ({ default: m.Support })))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
    </div>
  )
}

const routeSegment = (path) => path.replace('/admin/', '')

export default function AdminRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AdminDashboardLayout />}>
          <Route path={routeSegment(ADMIN_ROUTES.dashboard)} element={<Dashboard />} />

          <Route path={routeSegment(ADMIN_ROUTES.usersAll)} element={<AllUsers />} />
          <Route path={routeSegment(ADMIN_ROUTES.usersInvite)} element={<InviteUser />} />
          <Route path={routeSegment(ADMIN_ROUTES.usersPendingApprovals)} element={<PendingUserApprovals />} />
          <Route path={routeSegment(ADMIN_ROUTES.usersSuspended)} element={<SuspendedAccounts />} />

          <Route path={routeSegment(ADMIN_ROUTES.schoolProfile)} element={<SchoolProfile />} />
          <Route path={routeSegment(ADMIN_ROUTES.schoolAcademicYears)} element={<AcademicYears />} />
          <Route path={routeSegment(ADMIN_ROUTES.schoolClassesSections)} element={<ClassesSections />} />
          <Route path={routeSegment(ADMIN_ROUTES.schoolCalendar)} element={<AcademicCalendar />} />

          <Route path={routeSegment(ADMIN_ROUTES.studentDirectory)} element={<StudentDirectory />} />
          <Route path={routeSegment(ADMIN_ROUTES.studentAdmissions)} element={<Admissions />} />
          <Route path={routeSegment(ADMIN_ROUTES.studentPromotion)} element={<PromotionTransfer />} />
          <Route path={routeSegment(ADMIN_ROUTES.studentBulkImport)} element={<BulkImportStudents />} />

          <Route path={routeSegment(ADMIN_ROUTES.feeStructure)} element={<FeeStructure />} />
          <Route path={routeSegment(ADMIN_ROUTES.feeAssign)} element={<AssignFees />} />
          <Route path={routeSegment(ADMIN_ROUTES.feeScholarships)} element={<Scholarships />} />
          <Route path={routeSegment(ADMIN_ROUTES.feeAdjustments)} element={<FeeAdjustments />} />
          <Route path={routeSegment(ADMIN_ROUTES.feeCategories)} element={<FeeCategories />} />

          <Route path={routeSegment(ADMIN_ROUTES.paymentsOverview)} element={<PaymentsOverview />} />
          <Route path={routeSegment(ADMIN_ROUTES.paymentsVerification)} element={<PaymentVerification />} />
          <Route path={routeSegment(ADMIN_ROUTES.paymentsGateway)} element={<GatewayTransactions />} />
          <Route path={routeSegment(ADMIN_ROUTES.paymentsRefunds)} element={<RefundApprovals />} />
          <Route path={routeSegment(ADMIN_ROUTES.paymentsFailed)} element={<FailedTransactions />} />
          <Route path={routeSegment(ADMIN_ROUTES.paymentsReconciliation)} element={<PaymentReconciliation />} />

          <Route path={routeSegment(ADMIN_ROUTES.duesList)} element={<DueList />} />
          <Route path={routeSegment(ADMIN_ROUTES.duesOverdue)} element={<OverdueFees />} />
          <Route path={routeSegment(ADMIN_ROUTES.duesReminders)} element={<ReminderManagement />} />
          <Route path={routeSegment(ADMIN_ROUTES.duesLateFeeRules)} element={<LateFeeRules />} />

          <Route path={routeSegment(ADMIN_ROUTES.invoiceTemplates)} element={<InvoiceTemplates />} />
          <Route path={routeSegment(ADMIN_ROUTES.invoiceBulkGeneration)} element={<BulkInvoiceGeneration />} />
          <Route path={routeSegment(ADMIN_ROUTES.invoiceReceiptArchive)} element={<ReceiptArchive />} />
          <Route path={routeSegment(ADMIN_ROUTES.invoiceDocumentSettings)} element={<DocumentSettings />} />

          <Route path={routeSegment(ADMIN_ROUTES.reportsDailyCollection)} element={<DailyCollection />} />
          <Route path={routeSegment(ADMIN_ROUTES.reportsMonthlyRevenue)} element={<MonthlyRevenue />} />
          <Route path={routeSegment(ADMIN_ROUTES.reportsOutstandingDues)} element={<OutstandingDues />} />
          <Route path={routeSegment(ADMIN_ROUTES.reportsCollectionAnalytics)} element={<CollectionAnalytics />} />
          <Route path={routeSegment(ADMIN_ROUTES.reportsPaymentAnalytics)} element={<PaymentAnalytics />} />
          <Route path={routeSegment(ADMIN_ROUTES.reportsExport)} element={<ExportReports />} />

          <Route path={routeSegment(ADMIN_ROUTES.announcements)} element={<Announcements />} />
          <Route path={routeSegment(ADMIN_ROUTES.notificationTemplates)} element={<NotificationTemplates />} />
          <Route path={routeSegment(ADMIN_ROUTES.notificationScheduled)} element={<ScheduledNotifications />} />
          <Route path={routeSegment(ADMIN_ROUTES.notificationLogs)} element={<NotificationLogs />} />

          <Route path={routeSegment(ADMIN_ROUTES.auditLogs)} element={<AuditLogs />} />

          <Route path={routeSegment(ADMIN_ROUTES.rolesList)} element={<RolesList />} />
          <Route path={routeSegment(ADMIN_ROUTES.rolesPermissionMatrix)} element={<PermissionMatrix />} />
          <Route path={routeSegment(ADMIN_ROUTES.rolesAssignment)} element={<RoleAssignment />} />

          <Route path={routeSegment(ADMIN_ROUTES.securitySessions)} element={<LoginSessions />} />
          <Route path={routeSegment(ADMIN_ROUTES.securityAlerts)} element={<SecurityAlerts />} />
          <Route path={routeSegment(ADMIN_ROUTES.securityPolicies)} element={<SecurityPolicies />} />
          <Route path={routeSegment(ADMIN_ROUTES.securityAccessControl)} element={<AccessControl />} />

          <Route path={routeSegment(ADMIN_ROUTES.integrationsPaymentGateway)} element={<PaymentGatewayIntegration />} />
          <Route path={routeSegment(ADMIN_ROUTES.integrationsSms)} element={<SmsIntegration />} />
          <Route path={routeSegment(ADMIN_ROUTES.integrationsEmail)} element={<EmailIntegration />} />
          <Route path={routeSegment(ADMIN_ROUTES.integrationsApiWebhooks)} element={<ApiWebhooks />} />

          <Route path={routeSegment(ADMIN_ROUTES.settingsGeneral)} element={<GeneralSettings />} />
          <Route path={routeSegment(ADMIN_ROUTES.settingsBranding)} element={<BrandingSettings />} />
          <Route path={routeSegment(ADMIN_ROUTES.settingsAcademicConfig)} element={<AcademicConfiguration />} />
          <Route path={routeSegment(ADMIN_ROUTES.settingsNotificationsConfig)} element={<NotificationConfiguration />} />

          <Route path={routeSegment(ADMIN_ROUTES.aiInsights)} element={<AiInsights />} />

          <Route path={routeSegment(ADMIN_ROUTES.backupSchedule)} element={<BackupSchedule />} />
          <Route path={routeSegment(ADMIN_ROUTES.backupHistory)} element={<BackupHistory />} />
          <Route path={routeSegment(ADMIN_ROUTES.backupRestore)} element={<RestoreData />} />
          <Route path={routeSegment(ADMIN_ROUTES.backupDataExport)} element={<DataExport />} />

          <Route path={routeSegment(ADMIN_ROUTES.support)} element={<Support />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
