import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import EmptyState from '../../../components/common/EmptyState'
import { CATEGORY_ICONS } from '../icons'
import { formatDate } from '../../../utils/formatDate'

export default function ArchiveList({ notifications, onRestore, onDelete }) {
  return (
    <GlassCard title="Archive" description="Archived notifications" hover={false}>
      {notifications.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived notifications"
          description="Archived notifications will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const Icon = CATEGORY_ICONS[notification.category]
            return (
              <li
                key={notification.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/30 bg-white/20 px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(notification.timestamp)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRestore(notification.id)}
                    aria-label={`Restore ${notification.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
                  >
                    <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    aria-label={`Delete ${notification.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
