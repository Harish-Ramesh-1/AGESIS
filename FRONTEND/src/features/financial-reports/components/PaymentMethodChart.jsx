import { lazy, Suspense, useState } from 'react'
import clsx from 'clsx'
import Skeleton from '../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

const PieChart = lazy(() => import('../../../components/charts/PieChart'))

const METRICS = [
  { key: 'percent', label: 'Percentage', formatter: (value) => `${value}%` },
  { key: 'amount', label: 'Amount', formatter: formatCurrency },
  { key: 'count', label: 'Transactions', formatter: (value) => `${value}` },
]

export default function PaymentMethodChart({ title = 'Payment Method Distribution', description, data, nameKey = 'method' }) {
  const [metricKey, setMetricKey] = useState('percent')
  const metric = METRICS.find((item) => item.key === metricKey)

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title={title} description={description} />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Metric">
        {METRICS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetricKey(item.key)}
            aria-pressed={metricKey === item.key}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
              metricKey === item.key
                ? 'bg-brand-600 text-white shadow-clay-button'
                : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!data || data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No data available yet.</p>
      ) : (
        <Suspense fallback={<Skeleton className="h-60" />}>
          <PieChart data={data} dataKey={metric.key} nameKey={nameKey} valueFormatter={metric.formatter} height={260} />
        </Suspense>
      )}
    </div>
  )
}
