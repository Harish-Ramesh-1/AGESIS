import { CircleAlert } from 'lucide-react'
import clsx from 'clsx'
import Badge from '../../../../components/common/Badge'
import { formatRelativeTime } from '../../../../utils/formatDate'
import { getCategoryMeta } from '../utils/notificationMeta'

export default function NotificationCard({ notification, onMarkRead }) {
  const meta = getCategoryMeta(notification.category)
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={() => notification.unread && onMarkRead(notification.id)}
      className={clsx(
        'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ease-premium',
        notification.unread
          ? 'border-brand-200/70 bg-brand-50/50 hover:bg-brand-50/80 dark:border-brand-500/20 dark:bg-brand-500/[0.06] dark:hover:bg-brand-500/10'
          : 'border-white/40 bg-white/40 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]',
      )}
    >
      <span
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          meta.variant === 'success' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
          meta.variant === 'warning' && 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
          meta.variant === 'danger' && 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300',
          meta.variant === 'info' && 'bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
          meta.variant === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{notification.title}</span>
            {notification.unread && (
              <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            )}
          </span>
          <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatRelativeTime(notification.timestamp)}</span>
        </span>
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{notification.description}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {notification.actionRequired && (
            <Badge variant="warning" className="gap-1">
              <CircleAlert className="h-3 w-3" aria-hidden="true" />
              Action Required
            </Badge>
          )}
        </span>
      </span>
    </button>
  )
}
