import { lazy, Suspense } from 'react'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'

const RevenueChartBase = lazy(() => import('../../../../components/charts/RevenueChart'))

export default function RevenueChart({ title, description, data, xKey, series, valueFormatter = formatCurrency, height = 240, action, emptyMessage }) {
  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title={title} description={description} action={action} />
      {!data || data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage ?? 'No data available yet.'}</p>
      ) : (
        <Suspense fallback={<Skeleton className="h-60" />}>
          <RevenueChartBase data={data} xKey={xKey} series={series} valueFormatter={valueFormatter} height={height} />
        </Suspense>
      )}
    </div>
  )
}
