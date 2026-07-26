import { useEffect } from 'react'
import { Award, Banknote, CalendarClock, Gauge, ListChecks, Target, TrendingUp, Wallet2 } from 'lucide-react'
import { useReportsStore } from '../store/reportsStore'
import ReportsPageHeader from '../components/ReportsPageHeader'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import RevenueChart from '../components/RevenueChart'
import AnalyticsTable from '../components/AnalyticsTable'
import Badge from '../../../components/common/Badge'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'
import { TRANSACTION_STATUS_LABEL, TRANSACTION_STATUS_VARIANT } from '../utils/reportsUtils'

export default function DailyCollection() {
  const status = useReportsStore((state) => state.status)
  const data = useReportsStore((state) => state.data)
  const error = useReportsStore((state) => state.error)
  const fetchDailyCollection = useReportsStore((state) => state.fetchDailyCollection)

  useEffect(() => {
    fetchDailyCollection()
  }, [fetchDailyCollection])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'daily-collection.csv',
      ['Time', 'Student', 'Receipt No.', 'Method', 'Collected By', 'Amount', 'Status'],
      data.transactions.map((row) => [row.time, row.studentName, row.receiptNumber, row.method, row.collectedBy, row.amount, TRANSACTION_STATUS_LABEL[row.status]]),
    )
  }

  const cards = [
    { icon: Wallet2, label: "Today's Collection", value: data && formatCurrency(data.summary.todaysCollection) },
    { icon: ListChecks, label: 'Total Transactions', value: data?.summary.totalTransactions },
    { icon: Banknote, label: 'Average Collection', value: data && formatCurrency(data.summary.averageCollection) },
    { icon: CalendarClock, label: 'Pending Collections', value: data?.summary.pendingCollections },
    { icon: Target, label: 'Collection Target', value: data && formatCurrency(data.summary.collectionTarget) },
    { icon: Gauge, label: 'Achievement %', value: data && `${data.summary.achievementPercent}%` },
  ]

  const columns = [
    { key: 'time', header: 'Time' },
    { key: 'studentName', header: 'Student' },
    { key: 'receiptNumber', header: 'Receipt No.' },
    { key: 'method', header: 'Method' },
    { key: 'collectedBy', header: 'Collected By' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={TRANSACTION_STATUS_VARIANT[row.status]}>{TRANSACTION_STATUS_LABEL[row.status]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ReportsPageHeader pageTitle="Daily Collection" onExport={handleExport} />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load daily collection. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <RevenueChart
        title="Revenue Trend"
        description="Hourly collection and transaction volume for today"
        data={data?.hourlyTrend}
        xKey="label"
        series={[{ key: 'revenue', label: 'Collection', color: '#3d52c4' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Highest Collection Hour</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{data?.insights.highestCollectionHour ?? '—'}</p>
        </div>
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Award className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Top Collector</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{data?.insights.topCollector ?? '—'}</p>
        </div>
        <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Wallet2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Highest Transaction</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {data ? `${formatCurrency(data.insights.highestTransaction.amount)} · ${data.insights.highestTransaction.studentName}` : '—'}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Collection Table" description="Every transaction collected today" />
        <AnalyticsTable columns={columns} rows={data?.transactions ?? []} keyField="receiptNumber" titleKey="studentName" subtitleKey="receiptNumber" trailingKey="amount" emptyMessage="No transactions collected today." />
      </div>
    </div>
  )
}
