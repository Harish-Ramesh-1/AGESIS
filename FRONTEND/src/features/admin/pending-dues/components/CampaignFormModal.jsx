import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { useReminderCampaignStore } from '../store/reminderCampaignStore'
import { AUDIENCE_OPTIONS, CHANNEL_OPTIONS } from '../utils/pendingDuesUtils'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function CampaignFormModal({ onClose }) {
  const createCampaign = useReminderCampaignStore((state) => state.createCampaign)
  const isSaving = useReminderCampaignStore((state) => state.isSaving)

  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0])
  const [channel, setChannel] = useState(CHANNEL_OPTIONS[0])
  const [message, setMessage] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!message.trim()) {
      setFormError('Please enter a message template for this campaign.')
      return
    }
    if (!scheduleDate) {
      setFormError('Please choose a schedule date.')
      return
    }

    await createCampaign({ audience, channel, message: message.trim(), scheduleDate })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create reminder campaign"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Create Reminder Campaign</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="campaign-audience" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Audience
                </label>
                <select id="campaign-audience" value={audience} onChange={(event) => setAudience(event.target.value)} className={inputClass}>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="campaign-channel" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Channel
                </label>
                <select id="campaign-channel" value={channel} onChange={(event) => setChannel(event.target.value)} className={inputClass}>
                  {CHANNEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="campaign-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Message Template
                </label>
                <textarea
                  id="campaign-message"
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="e.g. Reminder: your ward's fee installment is due soon. Please clear dues at the earliest."
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="campaign-schedule" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Schedule Date
                </label>
                <input
                  id="campaign-schedule"
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{formError}</p>}
          </div>

          <div className="flex gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">
            <SecondaryButton fullWidth={false} type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton fullWidth={false} type="submit" isLoading={isSaving}>
              Create Campaign
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
