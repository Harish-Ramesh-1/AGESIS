import { useEffect, useMemo, useState } from 'react'
import { CircleCheck, CircleX, ScrollText, Search } from 'lucide-react'
import { useLogsStore } from '../store/logsStore'
import { CHANNEL_OPTIONS, DELIVERY_STATUS_OPTIONS } from '../services/notificationsService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import NotificationsNav from '../components/NotificationsNav'
import SummaryCard from '../components/SummaryCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import { SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import { getChannelMeta, getDeliveryStatusMeta } from '../utils/notificationMeta'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

function formatTimestamp(value) {
  const time = new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${formatDate(value)} · ${time}`
}

export default function NotificationLogs() {
  const status = useLogsStore((state) => state.status)
  const error = useLogsStore((state) => state.error)
  const items = useLogsStore((state) => state.items)
  const fetchLogs = useLogsStore((state) => state.fetchLogs)

  const [query, setQuery] = useState('')
  const [channel, setChannel] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs({ query, channel, status: deliveryStatus })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, channel, deliveryStatus])

  const deliveredCount = useMemo(() => items.filter((item) => item.status === 'Delivered' || item.status === 'Read').length, [items])
  const failedCount = useMemo(() => items.filter((item) => item.status === 'Failed').length, [items])

  function handleReset() {
    setQuery('')
    setChannel('')
    setDeliveryStatus('')
  }

  const columns = [
    { key: 'timestamp', header: 'Timestamp', render: (row) => formatTimestamp(row.timestamp) },
    { key: 'recipient', header: 'Recipient' },
    { key: 'title', header: 'Notification' },
    { key: 'channel', header: 'Channel', render: (row) => <Badge variant={getChannelMeta(row.channel).variant}>{getChannelMeta(row.channel).label}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={getDeliveryStatusMeta(row.status).variant}>{getDeliveryStatusMeta(row.status).label}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Notification Logs" />
      <NotificationsNav />

      <div aria-live="polite" className="sr-only">
        {items.length} delivery log entries matching current filters.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={ScrollText} label="Total Logged" value={items.length} tone="brand" />
        <SummaryCard icon={CircleCheck} label="Delivered / Read" value={deliveredCount} tone="success" />
        <SummaryCard icon={CircleX} label="Failed" value={failedCount} tone="danger" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />

        <div className="mb-5 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by recipient or notification title"
              aria-label="Search notification logs"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-channel" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Channel
              </label>
              <select id="log-channel" value={channel} onChange={(event) => setChannel(event.target.value)} className={selectClass}>
                <option value="">All Channels</option>
                {CHANNEL_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="log-status" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select id="log-status" value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                {DELIVERY_STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <SecondaryButton fullWidth={false} onClick={handleReset}>
              Reset
            </SecondaryButton>
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchLogs({ query, channel, status: deliveryStatus })} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={ScrollText} title="No delivery logs found" description="Try adjusting your search or filters." />
        )}

        {status === 'success' && items.length > 0 && <DataTable columns={columns} rows={items} keyField="id" />}
      </div>
    </div>
  )
}
