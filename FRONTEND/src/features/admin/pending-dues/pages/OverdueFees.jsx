import { useEffect, useMemo } from 'react'
import { AlertTriangle, Gauge, MailWarning, PhoneCall, ShieldAlert, Users } from 'lucide-react'
import { useOverdueStore } from '../store/overdueStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { PRIORITY_LABEL, PRIORITY_VARIANT } from '../utils/pendingDuesUtils'

export default function OverdueFees() {
  const status = useOverdueStore((state) => state.status)
  const error = useOverdueStore((state) => state.error)
  const overdueList = useOverdueStore((state) => state.overdueList)
  const fetchOverdue = useOverdueStore((state) => state.fetchOverdue)
  const escalatingId = useOverdueStore((state) => state.escalatingId)
  const escalate = useOverdueStore((state) => state.escalate)

  useEffect(() => {
    fetchOverdue({})
  }, [fetchOverdue])

  const summary = useMemo(() => {
    const total = overdueList.reduce((sum, row) => sum + row.outstandingAmount, 0)
    const critical = overdueList.filter((row) => row.priority === 'critical').length
    const avgDelay = overdueList.length > 0 ? Math.round(overdueList.reduce((sum, row) => sum + row.daysOverdue, 0) / overdueList.length) : 0
    return { total, count: overdueList.length, critical, avgDelay }
  }, [overdueList])

  function RowActions({ row }) {
    return (
      <div className="flex items-center gap-1">
        <a
          href={`tel:${row.parentPhone.replace(/\s+/g, '')}`}
          aria-label={`Call parent of ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => escalate(row.id)}
          disabled={row.escalated || escalatingId === row.id}
          aria-label={row.escalated ? `Escalation already sent for ${row.studentName}` : `Send escalation for ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-500/10"
        >
          <MailWarning className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'studentName', header: 'Student', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</span> },
    { key: 'className', header: 'Class', render: (row) => `${row.className}-${row.section}` },
    { key: 'outstandingAmount', header: 'Outstanding', render: (row) => formatCurrency(row.outstandingAmount) },
    { key: 'lateFee', header: 'Late Fee Accrued', render: (row) => formatCurrency(row.lateFee) },
    { key: 'daysOverdue', header: 'Days Overdue', render: (row) => `${row.daysOverdue}d` },
    { key: 'parentName', header: 'Parent Contact', render: (row) => (
      <div>
        <p>{row.parentName}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{row.parentPhone}</p>
      </div>
    ) },
    { key: 'priority', header: 'Priority', render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{PRIORITY_LABEL[row.priority]}</Badge> },
    {
      key: 'escalated',
      header: 'Escalation',
      render: (row) => (row.escalated ? <Badge variant="danger">Escalated</Badge> : <Badge variant="neutral">Not Escalated</Badge>),
    },
    { key: 'actions', header: 'Actions', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Overdue Fees" />

      <div aria-live="polite" className="sr-only">
        {overdueList.length} overdue accounts institution-wide.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={ShieldAlert} label="Total Overdue" value={formatCurrency(summary.total)} status={status} />
        <SummaryCard icon={Users} label="Overdue Accounts" value={summary.count} status={status} />
        <SummaryCard icon={AlertTriangle} label="Critical Accounts" value={summary.critical} status={status} />
        <SummaryCard icon={Gauge} label="Average Delay" value={`${summary.avgDelay}d`} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Overdue Accounts Institution-Wide</h2>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={() => fetchOverdue({})} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={overdueList}
            keyField="id"
            titleKey="studentName"
            subtitleKey="className"
            trailingKey="outstandingAmount"
            emptyMessage="No overdue accounts. Every account is within its due window."
          />
        )}
      </div>
    </div>
  )
}
