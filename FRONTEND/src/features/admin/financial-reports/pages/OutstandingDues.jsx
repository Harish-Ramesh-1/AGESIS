import { useEffect } from 'react'
import { AlertTriangle, Download, ShieldAlert, TrendingUp, Users } from 'lucide-react'
import { useOutstandingStore } from '../store/outstandingStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ReportsNav from '../components/ReportsNav'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import BarDonutChart from '../components/BarDonutChart'
import AnalyticsTable from '../components/AnalyticsTable'
import Badge from '../../../../components/common/Badge'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'
import { PRIORITY_LABEL, PRIORITY_VARIANT } from '../utils/reportsUtils'

export default function OutstandingDues() {
  const status = useOutstandingStore((state) => state.status)
  const data = useOutstandingStore((state) => state.data)
  const error = useOutstandingStore((state) => state.error)
  const fetchOutstandingDues = useOutstandingStore((state) => state.fetchOutstandingDues)

  useEffect(() => {
    fetchOutstandingDues()
  }, [fetchOutstandingDues])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'outstanding-dues.csv',
      ['Class', 'Students Pending', 'Outstanding Amount', 'Avg. Days Pending', 'Priority'],
      data.table.map((row) => [row.className, row.studentsPending, row.outstandingAmount, row.avgDaysPending, PRIORITY_LABEL[row.priority]]),
    )
  }

  const cards = [
    { icon: ShieldAlert, label: 'Outstanding Amount', value: data && formatCurrency(data.summary.outstandingAmount) },
    { icon: Users, label: 'Pending Students', value: data?.summary.pendingStudents },
    { icon: AlertTriangle, label: 'Overdue Students', value: data?.summary.overdueStudents },
    { icon: TrendingUp, label: 'Recovery Rate', value: data && `${data.summary.recoveryRate}%` },
  ]

  const columns = [
    { key: 'className', header: 'Class' },
    { key: 'studentsPending', header: 'Students Pending' },
    { key: 'outstandingAmount', header: 'Outstanding Amount', render: (row) => formatCurrency(row.outstandingAmount) },
    { key: 'avgDaysPending', header: 'Avg. Days Pending', render: (row) => (row.avgDaysPending > 0 ? `${row.avgDaysPending}d` : '—') },
    { key: 'priority', header: 'Priority', render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{PRIORITY_LABEL[row.priority]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Outstanding Dues"
        extraControls={
          <GlassButton icon={Download} onClick={handleExport} disabled={!data}>
            Export
          </GlassButton>
        }
      />
      <ReportsNav />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load outstanding dues. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <div>
        <SectionHeader title="Ageing Report" description="Outstanding amount and student count by days pending" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(data?.agingBuckets ?? Array.from({ length: 4 })).map((bucket, index) => (
            <div key={bucket?.bucket ?? index} className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{bucket?.bucket ?? '—'}</p>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{bucket ? formatCurrency(bucket.amount) : '—'}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{bucket ? `${bucket.studentCount} students` : ''}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarDonutChart variant="trend" title="Outstanding Trend" description="Total institution-wide outstanding over recent months" data={data?.outstandingTrend} />
        <BarDonutChart variant="bars" title="Class-wise Outstanding" data={data?.classWiseOutstanding} nameKey="className" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Outstanding by Class" description="Institution-wide dues broken down by class" />
        <AnalyticsTable columns={columns} rows={data?.table ?? []} keyField="className" titleKey="className" trailingKey="outstandingAmount" emptyMessage="No outstanding dues." />
      </div>
    </div>
  )
}
