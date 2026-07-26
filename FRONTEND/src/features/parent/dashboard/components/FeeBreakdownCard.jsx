import { lazy, Suspense } from 'react'
import { usePaymentsStore } from '../../../../store/paymentsStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatCurrency } from '../../../../utils/formatCurrency'

const PieChart = lazy(() => import('../../../../components/charts/PieChart'))

export default function FeeBreakdownCard() {
  const status = usePaymentsStore((state) => state.status)
  const data = usePaymentsStore((state) => state.data)

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Fee Breakdown">
        <Skeleton className="h-60" />
      </DashboardCard>
    )
  }

  if (status === 'error' || !data) {
    return (
      <DashboardCard title="Fee Breakdown">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load fee breakdown.</p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Fee Breakdown" description="How your annual fee is distributed">
      <Suspense fallback={<Skeleton className="h-60" />}>
        <PieChart data={data.feeBreakdown} dataKey="amount" nameKey="category" valueFormatter={formatCurrency} />
      </Suspense>
    </DashboardCard>
  )
}
