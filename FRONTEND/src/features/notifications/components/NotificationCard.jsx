import { Archive, ArchiveRestore, Pin, PinOff, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import Badge from '../../../components/common/Badge'
import { CATEGORY_ICONS } from '../icons'
import { formatRelativeTime } from '../../../utils/formatDate'

const PRIORITY_VARIANT = { high: 'danger', medium: 'warning', low: 'neutral' }

export default function NotificationCard({
  notification,
  isSelected,
  onToggleSelect,
  onAction,
  onMarkRead,
  onTogglePin,
  onToggleArchive,
  onDelete,
}) {
  const Icon = CATEGORY_ICONS[notification.category]

  function handleCardClick() {
    if (notification.unread) onMarkRead(notification.id)
  }

  return (
    <div
      onClick={handleCardClick}
      className={clsx(
        'relative flex animate-[fade-in_200ms_ease-premium] cursor-pointer items-start gap-3 rounded-clay border p-4 transition-all duration-200 ease-premium hover:-translate-y-0.5',
        notification.unread
          ? 'border-l-4 border-white/50 border-l-brand-500 bg-white/50 shadow-clay dark:border-white/10 dark:border-l-brand-400 dark:bg-white/[0.06]'
          : 'border-white/30 bg-white/20 opacity-80 dark:border-white/5 dark:bg-white/[0.02]',
      )}
    >
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(event) => {
            event.stopPropagation()
            onToggleSelect(notification.id)
          }}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select ${notification.title}`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus:ring-brand-500 dark:border-white/20"
        />
      )}

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
          <Badge variant={PRIORITY_VARIANT[notification.priority]}>{notification.priority}</Badge>
          {notification.pinned && <Badge variant="info">Pinned</Badge>}
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatRelativeTime(notification.timestamp)}
          </span>
          {notification.actionLabel && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAction(notification)
              }}
              className="text-xs font-semibold text-brand-600 transition-colors duration-200 hover:underline dark:text-brand-300"
            >
              {notification.actionLabel}
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={() => onTogglePin(notification.id)}
          aria-label={notification.pinned ? 'Unpin notification' : 'Pin notification'}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:hover:bg-white/10"
        >
          {notification.pinned ? (
            <PinOff className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pin className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggleArchive(notification.id)}
          aria-label={notification.archived ? 'Restore notification' : 'Archive notification'}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:hover:bg-white/10"
        >
          {notification.archived ? (
            <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
