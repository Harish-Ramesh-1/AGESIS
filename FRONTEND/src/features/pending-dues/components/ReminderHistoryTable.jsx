import { ChevronDown, MailCheck, RotateCcw } from 'lucide-react'
import { useReminderStore } from '../store/reminderStore'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import { formatRelativeTime } from '../../../utils/formatDate'
import { REMINDER_STATUS_LABEL, REMINDER_STATUS_VARIANT } from '../utils/pendingDuesUtils'

export default function ReminderHistoryTable() {
  const status = useReminderStore((state) => state.historyStatus)
  const history = useReminderStore((state) => state.history)
  const error = useReminderStore((state) => state.historyError)
  const retry = useReminderStore((state) => state.retry)

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load reminder history. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return <EmptyState icon={MailCheck} title="No reminders sent yet" description="Reminders you send will show up here." />
  }

  function RowActions({ row }) {
    if (row.status !== 'failed') return <span className="text-xs text-slate-400 dark:text-slate-500">Delivered</span>
    return (
      <button
        type="button"
        onClick={() => retry(row.id)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Retry
      </button>
    )
  }

  const columns = [
    { key: 'studentName', header: 'Student' },
    { key: 'reminderType', header: 'Reminder Type' },
    { key: 'channel', header: 'Channel' },
    { key: 'sentBy', header: 'Sent By' },
    { key: 'sentTime', header: 'Sent Time', render: (row) => formatRelativeTime(row.sentTime) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={REMINDER_STATUS_VARIANT[row.status]}>{REMINDER_STATUS_LABEL[row.status]}</Badge> },
    { key: 'action', header: 'Delivery Report', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={history} emptyMessage="No reminders sent yet." />
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {history.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.reminderType} · {row.channel}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant={REMINDER_STATUS_VARIANT[row.status]}>{REMINDER_STATUS_LABEL[row.status]}</Badge>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <p className="text-slate-500 dark:text-slate-400">
                Sent by {row.sentBy} · {formatRelativeTime(row.sentTime)}
              </p>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
