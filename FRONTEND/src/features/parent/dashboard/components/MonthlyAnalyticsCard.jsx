import { lazy, Suspense } from 'react'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatCurrency } from '../../../../utils/formatCurrency'

const RevenueChart = lazy(() => import('../../../../components/charts/RevenueChart'))

const SERIES = [
  { key: 'paid', label: 'Paid', color: '#3d52c4' },
  { key: 'pending', label: 'Pending', color: '#f59e0b' },
]

export default function MonthlyAnalyticsCard() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Monthly Payment Analytics">
        <Skeleton className="h-64" />
      </DashboardCard>
    )
  }

  if (status === 'error' || !data) {
    return (
      <DashboardCard title="Monthly Payment Analytics">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load analytics.</p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Monthly Payment Analytics" description="Paid vs pending over the last 6 months">
      <Suspense fallback={<Skeleton className="h-64" />}>
        <RevenueChart data={data.monthlyAnalytics} xKey="month" series={SERIES} valueFormatter={formatCurrency} />
      </Suspense>
    </DashboardCard>
  )
}
