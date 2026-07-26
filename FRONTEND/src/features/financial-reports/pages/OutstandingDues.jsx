import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, BellRing, Eye, ShieldAlert, TrendingUp, Users } from 'lucide-react'
import { useOutstandingStore } from '../store/outstandingStore'
import ReportsPageHeader from '../components/ReportsPageHeader'
import SectionHeader from '../components/SectionHeader'
import KPIGrid from '../components/KPIGrid'
import OutstandingChart from '../components/OutstandingChart'
import AnalyticsTable from '../components/AnalyticsTable'
import Badge from '../../../components/common/Badge'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadCsv } from '../utils/exportUtils'
import { PRIORITY_LABEL, PRIORITY_VARIANT } from '../utils/reportsUtils'

export default function OutstandingDues() {
  const status = useOutstandingStore((state) => state.status)
  const data = useOutstandingStore((state) => state.data)
  const error = useOutstandingStore((state) => state.error)
  const fetchOutstandingDues = useOutstandingStore((state) => state.fetchOutstandingDues)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOutstandingDues()
  }, [fetchOutstandingDues])

  function handleExport() {
    if (!data) return
    downloadCsv(
      'outstanding-dues.csv',
      ['Student', 'Class', 'Due Amount', 'Days Pending', 'Late Fee', 'Priority'],
      data.table.map((row) => [row.studentName, row.className, row.dueAmount, row.daysPending, row.lateFee, PRIORITY_LABEL[row.priority]]),
    )
  }

  const cards = [
    { icon: ShieldAlert, label: 'Outstanding Amount', value: data && formatCurrency(data.summary.outstandingAmount) },
    { icon: Users, label: 'Pending Students', value: data?.summary.pendingStudents },
    { icon: AlertTriangle, label: 'Overdue Students', value: data?.summary.overdueStudents },
    { icon: TrendingUp, label: 'Recovery Rate', value: data && `${data.summary.recoveryRate}%` },
  ]

  const columns = [
    { key: 'studentName', header: 'Student' },
    { key: 'className', header: 'Class' },
    { key: 'dueAmount', header: 'Due Amount', render: (row) => formatCurrency(row.dueAmount) },
    { key: 'daysPending', header: 'Days Pending', render: (row) => (row.daysPending > 0 ? `${row.daysPending}d` : '—') },
    { key: 'lateFee', header: 'Late Fee', render: (row) => (row.lateFee > 0 ? formatCurrency(row.lateFee) : '—') },
    { key: 'priority', header: 'Priority', render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{PRIORITY_LABEL[row.priority]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(ACCOUNTANT_ROUTES.studentFeeProfile)}
            aria-label={`View ${row.studentName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate(ACCOUNTANT_ROUTES.reminderManagement)}
            aria-label={`Send reminder to ${row.studentName}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ReportsPageHeader pageTitle="Outstanding Dues" onExport={handleExport} />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load outstanding dues. {error}</p>}

      <KPIGrid cards={cards} status={status === 'success' ? 'success' : 'loading'} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OutstandingChart variant="trend" title="Outstanding Trend" description="Total outstanding over recent months" data={data?.outstandingTrend} />
        <OutstandingChart variant="bars" title="Class-wise Outstanding" data={data?.classWiseOutstanding} nameKey="className" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OutstandingChart variant="donut" title="Fee Category Distribution" data={data?.feeCategoryDistribution} nameKey="method" />
        <OutstandingChart variant="donut" title="Ageing Analysis" description="Outstanding by age bucket" data={data?.ageingAnalysis} nameKey="bucket" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Outstanding Students" />
        <AnalyticsTable columns={columns} rows={data?.table ?? []} keyField="studentId" titleKey="studentName" subtitleKey="className" trailingKey="dueAmount" emptyMessage="No outstanding dues." />
      </div>
    </div>
  )
}
