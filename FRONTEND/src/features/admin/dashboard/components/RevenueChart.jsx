import { lazy, Suspense, useEffect } from 'react'
import clsx from 'clsx'
import { useAnalyticsStore } from '../store/analyticsStore'
import Skeleton from '../../../../components/common/Skeleton'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatGrowth } from '../utils/dashboardUtils'
import SectionHeader from './SectionHeader'

const RevenueChartBase = lazy(() => import('../../../../components/charts/RevenueChart'))

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'Academic Year' },
]

const SERIES = [{ key: 'revenue', label: 'Revenue', color: '#3d52c4' }]

function tooltipRender({ payload, label }) {
  const row = payload?.[0]?.payload
  if (!row) return null

  return (
    <div className="min-w-[170px]">
      <p className="mb-1.5 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
        <span>Revenue</span>
        <span className="font-medium">{formatCurrency(row.revenue)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
        <span>Transactions</span>
        <span className="font-medium">{row.transactions}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
        <span>Growth</span>
        <span
          className={clsx(
            'font-medium',
            row.growthPercent >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-400',
          )}
        >
          {formatGrowth(row.growthPercent)}
        </span>
      </div>
    </div>
  )
}

export default function RevenueChart() {
  const range = useAnalyticsStore((state) => state.revenueRange)
  const status = useAnalyticsStore((state) => state.revenueStatus)
  const points = useAnalyticsStore((state) => state.revenuePoints)
  const error = useAnalyticsStore((state) => state.revenueError)
  const fetchRevenue = useAnalyticsStore((state) => state.fetchRevenue)

  useEffect(() => {
    fetchRevenue('month')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Institution-wide Revenue" description="Collections across the selected period" />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Revenue range filter">
        {RANGES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => fetchRevenue(item.key)}
            aria-pressed={range === item.key}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
              range === item.key
                ? 'bg-brand-600 text-white shadow-clay-button'
                : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load revenue trend. {error}</p>
      )}
      {(status === 'loading' || status === 'idle') && <Skeleton className="h-64" />}
      {status === 'success' && (
        <Suspense fallback={<Skeleton className="h-64" />}>
          <RevenueChartBase
            data={points}
            xKey="label"
            series={SERIES}
            valueFormatter={formatCurrency}
            tooltipRender={tooltipRender}
          />
        </Suspense>
      )}
    </div>
  )
}
