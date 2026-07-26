import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AccountantDashboardLayout from '../layouts/AccountantDashboardLayout'
import { ACCOUNTANT_ROUTES } from '../constants/routes'

const Dashboard = lazy(() => import('../features/accountant/dashboard').then((m) => ({ default: m.Dashboard })))
const StudentFeeManagement = lazy(() =>
  import('../features/student-fee-management').then((m) => ({ default: m.StudentFeeManagement })),
)
const ReceivePayment = lazy(() => import('../features/accountant/payments').then((m) => ({ default: m.ReceivePayment })))
const PaymentVerification = lazy(() =>
  import('../features/accountant/payments').then((m) => ({ default: m.PaymentVerification })),
)
const PaymentHistory = lazy(() => import('../features/accountant/payments').then((m) => ({ default: m.PaymentHistory })))
const RefundManagement = lazy(() =>
  import('../features/accountant/payments').then((m) => ({ default: m.RefundManagement })),
)
const FailedTransactions = lazy(() =>
  import('../features/accountant/payments').then((m) => ({ default: m.FailedTransactions })),
)
const PaymentReconciliation = lazy(() =>
  import('../features/accountant/payments').then((m) => ({ default: m.PaymentReconciliation })),
)
const DueList = lazy(() => import('../features/pending-dues').then((m) => ({ default: m.DueList })))
const OverdueFees = lazy(() => import('../features/pending-dues').then((m) => ({ default: m.OverdueFees })))
const ReminderManagement = lazy(() =>
  import('../features/pending-dues').then((m) => ({ default: m.ReminderManagement })),
)
const LateFeeManagement = lazy(() =>
  import('../features/pending-dues').then((m) => ({ default: m.LateFeeManagement })),
)
const GenerateInvoice = lazy(() =>
  import('../features/invoices-receipts').then((m) => ({ default: m.GenerateInvoice })),
)
const GenerateReceipt = lazy(() =>
  import('../features/invoices-receipts').then((m) => ({ default: m.GenerateReceipt })),
)
const BulkInvoiceGeneration = lazy(() =>
  import('../features/invoices-receipts').then((m) => ({ default: m.BulkInvoiceGeneration })),
)
const DocumentArchive = lazy(() =>
  import('../features/invoices-receipts').then((m) => ({ default: m.DocumentArchive })),
)
const DailyCollection = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.DailyCollection })),
)
const MonthlyRevenue = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.MonthlyRevenue })),
)
const OutstandingDues = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.OutstandingDues })),
)
const CollectionAnalytics = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.CollectionAnalytics })),
)
const PaymentAnalytics = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.PaymentAnalytics })),
)
const ExportReports = lazy(() =>
  import('../features/financial-reports').then((m) => ({ default: m.ExportReports })),
)
const FeeStructure = lazy(() => import('../features/fee-configuration').then((m) => ({ default: m.FeeStructure })))
const AssignFees = lazy(() => import('../features/fee-configuration').then((m) => ({ default: m.AssignFees })))
const Scholarships = lazy(() => import('../features/fee-configuration').then((m) => ({ default: m.Scholarships })))
const FeeAdjustments = lazy(() =>
  import('../features/fee-configuration').then((m) => ({ default: m.FeeAdjustments })),
)
const Notifications = lazy(() =>
  import('../features/accountant/notifications').then((m) => ({ default: m.Notifications })),
)
const StudentsOverview = lazy(() =>
  import('../features/accountant/students-overview').then((m) => ({ default: m.StudentsOverview })),
)
const AuditLogs = lazy(() =>
  import('../features/accountant/audit-logs').then((m) => ({ default: m.AuditLogs })),
)
const Support = lazy(() => import('../features/accountant/support').then((m) => ({ default: m.Support })))
const AccountantProfile = lazy(() =>
  import('../features/accountant/settings').then((m) => ({ default: m.AccountantProfile })),
)
const Security = lazy(() => import('../features/accountant/settings').then((m) => ({ default: m.Security })))
const Preferences = lazy(() =>
  import('../features/accountant/settings').then((m) => ({ default: m.Preferences })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
    </div>
  )
}

const routeSegment = (path) => path.replace('/accountant/', '')

export default function AccountantRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AccountantDashboardLayout />}>
          <Route path={routeSegment(ACCOUNTANT_ROUTES.dashboard)} element={<Dashboard />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.studentDirectory)} element={<StudentFeeManagement />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.studentFeeProfile)} element={<StudentFeeManagement />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.receivePayment)} element={<ReceivePayment />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.paymentVerification)} element={<PaymentVerification />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.paymentHistory)} element={<PaymentHistory />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.refundManagement)} element={<RefundManagement />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.failedTransactions)} element={<FailedTransactions />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.paymentReconciliation)} element={<PaymentReconciliation />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.dueList)} element={<DueList />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.overdueFees)} element={<OverdueFees />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.reminderManagement)} element={<ReminderManagement />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.lateFeeManagement)} element={<LateFeeManagement />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.generateInvoice)} element={<GenerateInvoice />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.generateReceipt)} element={<GenerateReceipt />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.bulkInvoiceGeneration)} element={<BulkInvoiceGeneration />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.documentArchive)} element={<DocumentArchive />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.dailyCollection)} element={<DailyCollection />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.monthlyRevenue)} element={<MonthlyRevenue />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.outstandingDues)} element={<OutstandingDues />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.collectionAnalytics)} element={<CollectionAnalytics />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.paymentAnalytics)} element={<PaymentAnalytics />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.exportReports)} element={<ExportReports />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.feeStructure)} element={<FeeStructure />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.assignFees)} element={<AssignFees />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.scholarships)} element={<Scholarships />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.feeAdjustments)} element={<FeeAdjustments />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.notifications)} element={<Notifications />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.students)} element={<StudentsOverview />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.auditLogs)} element={<AuditLogs />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.support)} element={<Support />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.accountantProfile)} element={<AccountantProfile />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.security)} element={<Security />} />
          <Route path={routeSegment(ACCOUNTANT_ROUTES.preferences)} element={<Preferences />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
