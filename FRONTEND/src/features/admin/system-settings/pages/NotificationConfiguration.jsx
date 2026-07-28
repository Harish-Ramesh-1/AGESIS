import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useSystemSettingsStore } from '../store/systemSettingsStore'
import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from '../services/systemSettingsService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ToggleSwitch from '../components/ToggleSwitch'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'

export default function NotificationConfiguration() {
  const status = useSystemSettingsStore((state) => state.notificationStatus)
  const error = useSystemSettingsStore((state) => state.notificationError)
  const notificationConfig = useSystemSettingsStore((state) => state.notificationConfig)
  const saveStatus = useSystemSettingsStore((state) => state.notificationSaveStatus)
  const saveError = useSystemSettingsStore((state) => state.notificationSaveError)
  const fetchNotificationConfig = useSystemSettingsStore((state) => state.fetchNotificationConfig)
  const saveNotificationConfig = useSystemSettingsStore((state) => state.saveNotificationConfig)
  const resetSaveStatus = useSystemSettingsStore((state) => state.resetNotificationSaveStatus)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchNotificationConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (notificationConfig && !form) setForm(notificationConfig)
  }, [notificationConfig, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      const timeout = setTimeout(() => resetSaveStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleToggle(eventKey, channelKey, checked) {
    setForm((prev) => ({
      ...prev,
      [eventKey]: { ...prev[eventKey], [channelKey]: checked },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveNotificationConfig(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Notification Configuration" />
        <ErrorState message={error} onRetry={fetchNotificationConfig} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageHeaderSimple title="Notification Configuration" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Notification preferences saved successfully.'}
        {saveStatus === 'error' && `Failed to save preferences. ${saveError ?? ''}`}
      </div>

      <GlassCard
        title="System Event Notifications"
        description="Choose which channels are used to notify users when each system event occurs."
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <div>
            <div className="hidden grid-cols-[1fr_4rem_4rem_4rem] gap-3 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
              <span>Event</span>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <span key={channel.key} className="text-center">
                  {channel.label}
                </span>
              ))}
            </div>
            <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-white/10">
              {NOTIFICATION_EVENTS.map((event) => (
                <li key={event.key} className="grid grid-cols-3 items-center gap-3 py-3 sm:grid-cols-[1fr_4rem_4rem_4rem]">
                  <p className="col-span-3 text-sm font-medium text-slate-800 dark:text-slate-100 sm:col-span-1">{event.label}</p>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <div key={channel.key} className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 sm:hidden">{channel.label}</span>
                      <ToggleSwitch
                        checked={form[event.key][channel.key]}
                        onChange={(checked) => handleToggle(event.key, channel.key, checked)}
                        label={`${channel.label} notifications for ${event.label}`}
                      />
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>

      {saveStatus === 'success' && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Preferences saved successfully.
        </p>
      )}
      {saveStatus === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {saveError}
        </p>
      )}

      <div>
        <PrimaryButton type="submit" fullWidth={false} disabled={isLoading} isLoading={saveStatus === 'loading'}>
          Save Preferences
        </PrimaryButton>
      </div>
    </form>
  )
}
