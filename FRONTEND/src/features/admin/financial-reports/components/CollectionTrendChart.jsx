import { lazy, Suspense, useState } from 'react'
import clsx from 'clsx'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'

const RevenueChartBase = lazy(() => import('../../../../components/charts/RevenueChart'))

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

const SERIES = [
  { key: 'collected', label: 'Collected', color: '#3d52c4' },
  { key: 'expected', label: 'Expected', color: '#94a3b8' },
]

export default function CollectionTrendChart({ trend }) {
  const [period, setPeriod] = useState('weekly')
  const data = trend?.[period] ?? []

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Collection Trend" description="Collected vs. expected across daily, weekly and monthly views" />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Collection trend period">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPeriod(item.key)}
            aria-pressed={period === item.key}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
              period === item.key
                ? 'bg-brand-600 text-white shadow-clay-button'
                : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No data available yet.</p>
      ) : (
        <Suspense fallback={<Skeleton className="h-60" />}>
          <RevenueChartBase data={data} xKey="label" series={SERIES} valueFormatter={formatCurrency} height={240} />
        </Suspense>
      )}
    </div>
  )
}
