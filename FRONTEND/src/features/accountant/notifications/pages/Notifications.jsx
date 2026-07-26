import { useEffect, useMemo, useState } from 'react'
import { BellOff, CalendarClock, CheckCheck, ListFilter, Search, TriangleAlert } from 'lucide-react'
import { useAccountantNotificationsStore } from '../store/notificationsStore'
import { NOTIFICATION_CATEGORIES } from '../services/notificationsService'
import { GlassButton } from '../../../../components/common/Button'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import ErrorState from '../../../../components/common/ErrorState'
import PageHeaderSimple from '../components/PageHeaderSimple'
import NotificationCard from '../components/NotificationCard'
import SummaryCard from '../components/SummaryCard'
import { getCategoryMeta } from '../utils/notificationMeta'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function Notifications() {
  const status = useAccountantNotificationsStore((state) => state.status)
  const error = useAccountantNotificationsStore((state) => state.error)
  const items = useAccountantNotificationsStore((state) => state.items)
  const fetchNotifications = useAccountantNotificationsStore((state) => state.fetchNotifications)
  const markAsRead = useAccountantNotificationsStore((state) => state.markAsRead)
  const markAllRead = useAccountantNotificationsStore((state) => state.markAllRead)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [readState, setReadState] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchNotifications({ query, category, readState })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, readState])

  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items])
  const todayCount = useMemo(() => {
    const todayKey = new Date().toDateString()
    return items.filter((item) => new Date(item.timestamp).toDateString() === todayKey).length
  }, [items])
  const actionRequiredCount = useMemo(() => items.filter((item) => item.actionRequired).length, [items])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Notifications"
        extraControls={
          <GlassButton icon={CheckCheck} onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </GlassButton>
        }
      />

      <div aria-live="polite" className="sr-only">
        {unreadCount} unread notifications, {actionRequiredCount} requiring action.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={BellOff} label="Unread Count" value={unreadCount} tone="brand" />
        <SummaryCard icon={CalendarClock} label="Today's Count" value={todayCount} tone="brand" />
        <SummaryCard icon={TriangleAlert} label="Action Required" value={actionRequiredCount} tone="warning" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />

        <div className="mb-5 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notifications"
              aria-label="Search notifications"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notif-category" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Category
              </label>
              <select
                id="notif-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClass}
              >
                <option value="">All Categories</option>
                {NOTIFICATION_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {getCategoryMeta(item).label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notif-read-state" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select
                id="notif-read-state"
                value={readState}
                onChange={(event) => setReadState(event.target.value)}
                className={selectClass}
              >
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            {(query || category || readState) && (
              <GlassButton
                icon={ListFilter}
                onClick={() => {
                  setQuery('')
                  setCategory('')
                  setReadState('')
                }}
              >
                Reset
              </GlassButton>
            )}
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchNotifications({ query, category, readState })} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={BellOff} title="No notifications found" description="Try adjusting your search or filters." />
        )}

        {status === 'success' && items.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onMarkRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
