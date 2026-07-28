import { useEffect } from 'react'
import { CalendarDays, Download, Landmark, Target, TrendingUp } from 'lucide-react'
import { useRevenueStore } from '../store/revenueStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ReportsNav from '../components/ReportsNav'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import RevenueChart from '../components/RevenueChart'
import PaymentMethodChart from '../components/PaymentMethodChart'
import BarDonutChart from '../components/BarDonutChart'
import AnalyticsTable from '../components/AnalyticsTable'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'
import { formatGrowth } from '../utils/reportsUtils'

export default function MonthlyRevenue() {
  const status = useRevenueStore((state) => state.status)
  const data = useRevenueStore((state) => state.data)
  const error = useRevenueStore((state) => state.error)
  const fetchMonthlyRevenue = useRevenueStore((state) => state.fetchMonthlyRevenue)

  useEffect(() => {
    fetchMonthlyRevenue()
  }, [fetchMonthlyRevenue])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'monthly-revenue.csv',
      ['Month', 'Revenue', 'Transactions', 'Average Payment', 'Growth %'],
      data.monthlyTable.map((row) => [row.month, row.revenue, row.transactions, row.averagePayment, row.growthPercent]),
    )
  }

  const cards = [
    { icon: Landmark, label: 'Monthly Revenue', value: data && formatCurrency(data.summary.monthlyRevenue) },
    { icon: CalendarDays, label: 'Previous Month', value: data && formatCurrency(data.summary.previousMonth) },
    {
      icon: TrendingUp,
      label: 'Growth %',
      value: data && formatGrowth(data.summary.growthPercent),
      trend: data && { direction: data.summary.growthPercent >= 0 ? 'up' : 'down', value: formatGrowth(data.summary.growthPercent) },
    },
    { icon: Target, label: 'Target Achievement', value: data && `${data.summary.targetAchievement}%` },
  ]

  const columns = [
    { key: 'month', header: 'Month' },
    { key: 'revenue', header: 'Revenue', render: (row) => formatCurrency(row.revenue) },
    { key: 'transactions', header: 'Transactions' },
    { key: 'averagePayment', header: 'Avg. Payment', render: (row) => formatCurrency(row.averagePayment) },
    { key: 'growthPercent', header: 'Growth', render: (row) => formatGrowth(row.growthPercent) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Monthly Revenue"
        extraControls={
          <GlassButton icon={Download} onClick={handleExport} disabled={!data}>
            Export
          </GlassButton>
        }
      />
      <ReportsNav />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load monthly revenue. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <RevenueChart
        title="Monthly Revenue Trend"
        description="Institution-wide collections across recent months, with a 3-month forecast"
        data={data ? [...data.monthlyTrend, ...data.forecast] : []}
        xKey="label"
        series={[{ key: 'revenue', label: 'Revenue', color: '#3d52c4' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BarDonutChart variant="bars" title="Revenue by Class Band" data={data?.revenueByClass} nameKey="className" />
        <PaymentMethodChart title="Revenue by Fee Category" data={data?.revenueByFeeCategory} nameKey="method" />
        <BarDonutChart variant="bars" title="Revenue by Installment" data={data?.revenueByInstallment} nameKey="label" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-xs text-slate-400 dark:text-slate-500">Current Month</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{data ? formatCurrency(data.comparison.currentMonth) : '—'}</p>
        </div>
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-xs text-slate-400 dark:text-slate-500">Previous Month</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{data ? formatCurrency(data.comparison.previousMonth) : '—'}</p>
        </div>
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-xs text-slate-400 dark:text-slate-500">Previous Year (Same Month)</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{data ? formatCurrency(data.comparison.previousYear) : '—'}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Monthly Report" />
        <AnalyticsTable columns={columns} rows={data?.monthlyTable ?? []} keyField="month" titleKey="month" trailingKey="revenue" emptyMessage="No monthly data available." />
      </div>
    </div>
  )
}
