import { useEffect } from 'react'
import { Award, Bell, CreditCard, FileText, Megaphone } from 'lucide-react'
import { useNotificationsStore } from '../../../../store/notificationsStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'
import { formatRelativeTime } from '../../../../utils/formatDate'

const TYPE_ICON = {
  payment: CreditCard,
  due: Bell,
  invoice: FileText,
  circular: Megaphone,
  scholarship: Award,
}

export default function NotificationPanel() {
  const status = useNotificationsStore((state) => state.status)
  const items = useNotificationsStore((state) => state.items)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Notifications">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      </DashboardCard>
    )
  }

  if (status === 'error') {
    return (
      <DashboardCard title="Notifications">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load notifications.</p>
      </DashboardCard>
    )
  }

  if (items.length === 0) {
    return (
      <DashboardCard title="Notifications">
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Notifications">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = TYPE_ICON[item.type] ?? Bell
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                  {item.unread && (
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  )}
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
              </div>
              <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                {formatRelativeTime(item.timestamp)}
              </span>
            </li>
          )
        })}
      </ul>
    </DashboardCard>
  )
}
