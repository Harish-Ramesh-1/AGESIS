import { lazy, Suspense } from 'react'
import Skeleton from '../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

const RevenueChartBase = lazy(() => import('../../../components/charts/RevenueChart'))
const PieChart = lazy(() => import('../../../components/charts/PieChart'))

const BAR_COLORS = ['bg-brand-600', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-sky-500', 'bg-red-500']

export default function OutstandingChart({ variant, title, description, data, nameKey, valueKey = 'amount' }) {
  const isEmpty = !data || data.length === 0
  const maxValue = isEmpty ? 0 : Math.max(...data.map((row) => row[valueKey]))

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title={title} description={description} />

      {isEmpty ? (
        <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No data available yet.</p>
      ) : variant === 'trend' ? (
        <Suspense fallback={<Skeleton className="h-56" />}>
          <RevenueChartBase data={data} xKey="label" series={[{ key: valueKey, label: 'Outstanding', color: '#dc2626' }]} valueFormatter={formatCurrency} height={220} />
        </Suspense>
      ) : variant === 'donut' ? (
        <Suspense fallback={<Skeleton className="h-56" />}>
          <PieChart data={data} dataKey={valueKey} nameKey={nameKey} valueFormatter={formatCurrency} height={220} />
        </Suspense>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((row, index) => (
            <div key={row[nameKey]}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">{row[nameKey]}</span>
                <span className="text-slate-500 dark:text-slate-400">{formatCurrency(row[valueKey])}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]} transition-[width] duration-700 ease-premium`}
                  style={{ width: `${maxValue > 0 ? (row[valueKey] / maxValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
