import { AlertTriangle, X } from 'lucide-react'
import { useFeeNotificationStore } from '../../../store/feeNotificationStore'
import { formatDate } from '../../../utils/formatDate'

export default function ReminderBanner({ id, dueDate }) {
  const dismissedIds = useFeeNotificationStore((state) => state.dismissedIds)
  const dismiss = useFeeNotificationStore((state) => state.dismiss)

  if (dismissedIds.includes(id)) return null

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-clay border border-amber-200/70 bg-amber-50/70 px-5 py-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        Pay before <span className="font-semibold">{formatDate(dueDate)}</span> to avoid a late payment penalty.
      </p>
      <button
        type="button"
        onClick={() => dismiss(id)}
        aria-label="Dismiss reminder"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-amber-100 dark:hover:bg-amber-500/20"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
