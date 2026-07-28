import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'

function toLocalInputValue(isoString) {
  const date = new Date(isoString)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function RescheduleDialog({ notification, onSubmit, onClose, isSubmitting }) {
  const [value, setValue] = useState(toLocalInputValue(notification.scheduledAt))

  async function handleSubmit(event) {
    event.preventDefault()
    if (!value) return
    const success = await onSubmit(notification.id, new Date(value).toISOString())
    if (success) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reschedule ${notification.title}`}
        className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Reschedule</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notification.title}</p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reschedule-datetime" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              New Date &amp; Time
            </label>
            <input
              id="reschedule-datetime"
              type="datetime-local"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-3">
            <SecondaryButton fullWidth={false} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth={false} isLoading={isSubmitting}>
              Save
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
