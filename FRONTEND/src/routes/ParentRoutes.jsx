import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

const DashboardPage = lazy(() => import('../features/parent/dashboard/DashboardPage'))
const FeeDetails = lazy(() => import('../features/fee-management').then((m) => ({ default: m.FeeDetails })))
const PayFees = lazy(() => import('../features/fee-management').then((m) => ({ default: m.PayFees })))
const PendingDues = lazy(() => import('../features/fee-management').then((m) => ({ default: m.PendingDues })))
const PaymentHistory = lazy(() => import('../features/payments').then((m) => ({ default: m.PaymentHistory })))
const InvoicesReceipts = lazy(() => import('../features/payments').then((m) => ({ default: m.InvoicesReceipts })))
const RewardsPage = lazy(() => import('../features/rewards').then((m) => ({ default: m.RewardsPage })))
const NotificationsPage = lazy(() => import('../features/notifications').then((m) => ({ default: m.NotificationsPage })))
const StudentProfilePage = lazy(() => import('../features/student-profile').then((m) => ({ default: m.StudentProfilePage })))
const SettingsPage = lazy(() => import('../features/settings').then((m) => ({ default: m.SettingsPage })))
const SupportPage = lazy(() => import('../features/parent/support/SupportPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
    </div>
  )
}

export default function ParentRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="fees/details" element={<FeeDetails />} />
          <Route path="fees/pay" element={<PayFees />} />
          <Route path="fees/dues" element={<PendingDues />} />
          <Route path="payments/history" element={<PaymentHistory />} />
          <Route path="payments/invoices" element={<InvoicesReceipts />} />
          <Route path="engagement/rewards" element={<RewardsPage />} />
          <Route path="engagement/notifications" element={<NotificationsPage />} />
          <Route path="profile/student" element={<StudentProfilePage />} />
          <Route path="profile/settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
