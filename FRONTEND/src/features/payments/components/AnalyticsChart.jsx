import { lazy, Suspense } from 'react'
import Skeleton from '../../../components/common/Skeleton'

const RevenueChart = lazy(() => import('../../../components/charts/RevenueChart'))
const PieChart = lazy(() => import('../../../components/charts/PieChart'))

export default function AnalyticsChart({ type, ...chartProps }) {
  const ChartComponent = type === 'distribution' ? PieChart : RevenueChart

  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <ChartComponent {...chartProps} />
    </Suspense>
  )
}
