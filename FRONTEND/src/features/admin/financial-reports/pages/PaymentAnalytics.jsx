import { useEffect } from 'react'
import { CircleCheck, CircleX, CreditCard, Download, Undo2 } from 'lucide-react'
import { usePaymentAnalyticsStore } from '../store/paymentAnalyticsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ReportsNav from '../components/ReportsNav'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import RevenueChart from '../components/RevenueChart'
import PaymentMethodChart from '../components/PaymentMethodChart'
import AnalyticsTable from '../components/AnalyticsTable'
import Skeleton from '../../../../components/common/Skeleton'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'

export default function PaymentAnalytics() {
  const status = usePaymentAnalyticsStore((state) => state.status)
  const data = usePaymentAnalyticsStore((state) => state.data)
  const error = usePaymentAnalyticsStore((state) => state.error)
  const fetchPaymentAnalytics = usePaymentAnalyticsStore((state) => state.fetchPaymentAnalytics)

  useEffect(() => {
    fetchPaymentAnalytics()
  }, [fetchPaymentAnalytics])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'payment-analytics.csv',
      ['Method', 'Transactions', 'Revenue', 'Average Amount', 'Success Rate'],
      data.table.map((row) => [row.method, row.transactions, row.revenue, row.averageAmount, `${row.successRate}%`]),
    )
  }

  const cards = [
    { icon: CreditCard, label: 'Total Payments', value: data?.summary.totalPayments },
    { icon: CircleCheck, label: 'Successful Payments', value: data?.summary.successfulPayments },
    { icon: CircleX, label: 'Failed Payments', value: data?.summary.failedPayments },
    { icon: Undo2, label: 'Refunds', value: data?.summary.refunds },
  ]

  const columns = [
    { key: 'method', header: 'Method' },
    { key: 'transactions', header: 'Transactions' },
    { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
    { key: 'averageAmount', header: 'Avg. Amount', render: (row) => formatCurrency(row.averageAmount) },
    { key: 'successRate', header: 'Success Rate', render: (row) => `${row.successRate}%` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Payment Analytics"
        extraControls={
          <GlassButton icon={Download} onClick={handleExport} disabled={!data}>
            Export
          </GlassButton>
        }
      />
      <ReportsNav />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load payment analytics. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <RevenueChart
        title="Success vs. Failure Trend"
        description="Successful and failed transaction volume across the week"
        data={data?.successFailureTrend}
        xKey="label"
        series={[
          { key: 'success', label: 'Successful', color: '#10b981' },
          { key: 'failed', label: 'Failed', color: '#dc2626' },
        ]}
        valueFormatter={(value) => `${value}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PaymentMethodChart data={data?.methodDistribution} />
        <PaymentMethodChart title="Online vs. Offline Payments" data={data?.onlineVsOffline} />
      </div>

      <RevenueChart
        title="Peak Payment Hours"
        description="Transaction volume across the day, institution-wide"
        data={data?.peakHours}
        xKey="label"
        series={[{ key: 'transactions', label: 'Transactions', color: '#3d52c4' }]}
        valueFormatter={(value) => `${value}`}
      />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Failure Analysis" description="Most common reasons for failed payments" />
        {data ? (
          <ul className="flex flex-col gap-2">
            {data.failureAnalysis.map((item) => (
              <li key={item.reason} className="flex items-center justify-between rounded-xl border border-white/40 bg-white/40 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-slate-700 dark:text-slate-200">{item.reason}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Skeleton className="h-32" />
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Analytics Table" description="Performance by payment method" />
        <AnalyticsTable columns={columns} rows={data?.table ?? []} keyField="method" titleKey="method" trailingKey="revenue" emptyMessage="No payment data available." />
      </div>
    </div>
  )
}
