import { useEffect, useMemo, useState } from 'react'
import { Ban, CalendarClock, CheckCheck, SquarePen } from 'lucide-react'
import { useScheduledStore } from '../store/scheduledStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import NotificationsNav from '../components/NotificationsNav'
import SummaryCard from '../components/SummaryCard'
import RescheduleDialog from '../components/RescheduleDialog'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import { formatDate } from '../../../../utils/formatDate'
import { getChannelMeta } from '../utils/notificationMeta'

const STATUS_META = {
  pending: { label: 'Pending', variant: 'warning' },
  sent: { label: 'Sent', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

function formatScheduledAt(value) {
  const time = new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${formatDate(value)} · ${time}`
}

export default function ScheduledNotifications() {
  const status = useScheduledStore((state) => state.status)
  const error = useScheduledStore((state) => state.error)
  const items = useScheduledStore((state) => state.items)
  const actionStatus = useScheduledStore((state) => state.actionStatus)
  const fetchScheduled = useScheduledStore((state) => state.fetchScheduled)
  const cancel = useScheduledStore((state) => state.cancel)
  const reschedule = useScheduledStore((state) => state.reschedule)

  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchScheduled()
  }, [fetchScheduled])

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'pending').length, [items])
  const sentCount = useMemo(() => items.filter((item) => item.status === 'sent').length, [items])
  const cancelledCount = useMemo(() => items.filter((item) => item.status === 'cancelled').length, [items])

  async function handleReschedule(id, scheduledAt) {
    const record = await reschedule(id, scheduledAt)
    return Boolean(record)
  }

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'channel', header: 'Channel', render: (row) => <Badge variant={getChannelMeta(row.channel).variant}>{getChannelMeta(row.channel).label}</Badge> },
    { key: 'audience', header: 'Audience' },
    { key: 'scheduledAt', header: 'Scheduled For', render: (row) => formatScheduledAt(row.scheduledAt) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_META[row.status]?.variant ?? 'neutral'}>{STATUS_META[row.status]?.label ?? row.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(row)}
              aria-label={`Reschedule ${row.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => cancel(row.id)}
              aria-label={`Cancel ${row.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Scheduled Notifications" />
      <NotificationsNav />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={CalendarClock} label="Pending" value={pendingCount} tone="warning" />
        <SummaryCard icon={CheckCheck} label="Sent" value={sentCount} tone="success" />
        <SummaryCard icon={Ban} label="Cancelled" value={cancelledCount} tone="danger" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Upcoming &amp; Past Schedules</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchScheduled} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={CalendarClock} title="Nothing scheduled" description="Notifications you schedule will appear here." />
        )}

        {status === 'success' && items.length > 0 && <DataTable columns={columns} rows={items} keyField="id" />}
      </div>

      {editing && (
        <RescheduleDialog notification={editing} onSubmit={handleReschedule} onClose={() => setEditing(null)} isSubmitting={actionStatus === 'loading'} />
      )}
    </div>
  )
}
