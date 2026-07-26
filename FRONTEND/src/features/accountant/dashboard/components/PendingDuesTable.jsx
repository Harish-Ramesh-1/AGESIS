import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, ChevronDown, UserRound } from 'lucide-react'
import { useCollectionStore } from '../store/collectionStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { STATUS_BADGE_VARIANT } from '../utils/dashboardUtils'

const STATUS_LABEL = { overdue: 'Overdue', 'due-soon': 'Due Soon', pending: 'Pending' }

export default function PendingDuesTable() {
  const status = useCollectionStore((state) => state.pendingDuesStatus)
  const pendingDues = useCollectionStore((state) => state.pendingDues)
  const error = useCollectionStore((state) => state.pendingDuesError)
  const fetchPendingDues = useCollectionStore((state) => state.fetchPendingDues)
  const navigate = useNavigate()
  const [remindedIds, setRemindedIds] = useState(() => new Set())

  useEffect(() => {
    fetchPendingDues()
  }, [fetchPendingDues])

  function handleSendReminder(id) {
    setRemindedIds((prev) => new Set(prev).add(id))
  }

  function RowActions({ row }) {
    const wasReminded = remindedIds.has(row.id)
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(ACCOUNTANT_ROUTES.studentFeeProfile)}
          aria-label={`View profile for ${row.student}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 ease-premium hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => handleSendReminder(row.id)}
          disabled={wasReminded}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/40 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]"
        >
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          {wasReminded ? 'Reminder Sent' : 'Send Reminder'}
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'student', header: 'Student' },
    { key: 'className', header: 'Class' },
    { key: 'amount', header: 'Pending Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'daysOverdue', header: 'Days Overdue', render: (row) => (row.daysOverdue > 0 ? row.daysOverdue : '—') },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
    { key: 'action', header: 'Action', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Pending Dues" description="Top outstanding students" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load pending dues. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={pendingDues} emptyMessage="No students with pending dues." />
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {pendingDues.map((row) => (
              <details
                key={row.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.student}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{row.className}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(row.amount)}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Due Date</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Overdue</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                        {row.daysOverdue > 0 ? `${row.daysOverdue}d` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Status</p>
                      <Badge variant={STATUS_BADGE_VARIANT[row.status]} className="mt-0.5">
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </div>
                  </div>
                  <RowActions row={row} />
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
