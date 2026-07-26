import { lazy, Suspense, useEffect, useState } from 'react'
import clsx from 'clsx'
import { useAnalyticsStore } from '../store/analyticsStore'
import Skeleton from '../../../../components/common/Skeleton'
import { formatCurrency } from '../../../../utils/formatCurrency'
import SectionHeader from './SectionHeader'

const PieChart = lazy(() => import('../../../../components/charts/PieChart'))

const METRICS = [
  { key: 'percent', label: 'Percentage', formatter: (value) => `${value}%` },
  { key: 'amount', label: 'Amount', formatter: formatCurrency },
  { key: 'count', label: 'Transactions', formatter: (value) => `${value}` },
]

export default function PaymentMethodChart() {
  const status = useAnalyticsStore((state) => state.paymentMethodsStatus)
  const paymentMethods = useAnalyticsStore((state) => state.paymentMethods)
  const error = useAnalyticsStore((state) => state.paymentMethodsError)
  const fetchPaymentMethods = useAnalyticsStore((state) => state.fetchPaymentMethods)
  const [metricKey, setMetricKey] = useState('percent')

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const metric = METRICS.find((item) => item.key === metricKey)

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Collection by Payment Method" description="This month's split across channels" />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Payment method metric">
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

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load payment methods. {error}</p>
      )}
      {(status === 'loading' || status === 'idle') && <Skeleton className="h-60" />}
      {status === 'success' && paymentMethods.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No payment data yet.</p>
      )}
      {status === 'success' && paymentMethods.length > 0 && (
        <Suspense fallback={<Skeleton className="h-60" />}>
          <PieChart
            data={paymentMethods}
            dataKey={metric.key}
            nameKey="method"
            valueFormatter={metric.formatter}
            height={260}
          />
        </Suspense>
      )}
    </div>
  )
}
