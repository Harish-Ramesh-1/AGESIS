import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAccountantPreferencesStore } from '../store/preferencesStore'
import SettingsPageHeader from '../components/SettingsPageHeader'
import ToggleSwitch from '../components/ToggleSwitch'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'

const CATEGORIES = [
  { key: 'paymentAlerts', label: 'Payment Alerts' },
  { key: 'overdueAlerts', label: 'Overdue Alerts' },
  { key: 'systemAnnouncements', label: 'System Announcements' },
  { key: 'weeklySummary', label: 'Weekly Summary' },
]

const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
]

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const LANDING_PAGE_OPTIONS = [
  { value: ACCOUNTANT_ROUTES.dashboard, label: 'Dashboard' },
  { value: ACCOUNTANT_ROUTES.studentDirectory, label: 'Student Directory' },
  { value: ACCOUNTANT_ROUTES.paymentHistory, label: 'Payment History' },
  { value: ACCOUNTANT_ROUTES.monthlyRevenue, label: 'Financial Reports' },
]

const ACADEMIC_YEAR_OPTIONS = ['2025-2026', '2024-2025', '2023-2024']

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function Preferences() {
  const status = useAccountantPreferencesStore((state) => state.status)
  const error = useAccountantPreferencesStore((state) => state.error)
  const preferences = useAccountantPreferencesStore((state) => state.preferences)
  const saveStatus = useAccountantPreferencesStore((state) => state.saveStatus)
  const saveError = useAccountantPreferencesStore((state) => state.saveError)
  const fetchPreferences = useAccountantPreferencesStore((state) => state.fetchPreferences)
  const updatePreferences = useAccountantPreferencesStore((state) => state.updatePreferences)
  const resetSaveStatus = useAccountantPreferencesStore((state) => state.resetSaveStatus)

  const [form, setForm] = useState(null)
  const [bannerVisible, setBannerVisible] = useState(false)

  useEffect(() => {
    fetchPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (preferences && !form) {
      setForm(preferences)
    }
  }, [preferences, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      setBannerVisible(true)
      const timeout = setTimeout(() => {
        setBannerVisible(false)
        resetSaveStatus()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleToggle(categoryKey, channelKey, checked) {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [categoryKey]: { ...prev.notifications[categoryKey], [channelKey]: checked },
      },
    }))
  }

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function dismissBanner() {
    setBannerVisible(false)
    resetSaveStatus()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await updatePreferences(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <SettingsPageHeader pageTitle="Preferences" />
        <ErrorState message={error} onRetry={fetchPreferences} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SettingsPageHeader pageTitle="Preferences" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Preferences saved successfully.'}
        {saveStatus === 'error' && `Failed to save preferences. ${saveError ?? ''}`}
      </div>

      {bannerVisible && saveStatus === 'success' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Preferences saved successfully.
          </span>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss success message"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-emerald-600 transition-colors duration-200 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {saveStatus === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          Couldn&apos;t save preferences. {saveError}
        </p>
      )}

      <GlassCard title="Notification Preferences" description="Choose how you'd like to be notified for each alert category.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <div>
            <div className="hidden grid-cols-[1fr_4rem_4rem_4rem] gap-3 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
              <span>Category</span>
              {CHANNELS.map((channel) => (
                <span key={channel.key} className="text-center">
                  {channel.label}
                </span>
              ))}
            </div>
            <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-white/10">
              {CATEGORIES.map((category) => (
                <li key={category.key} className="grid grid-cols-3 items-center gap-3 py-3 sm:grid-cols-[1fr_4rem_4rem_4rem]">
                  <p className="col-span-3 text-sm font-medium text-slate-800 dark:text-slate-100 sm:col-span-1">{category.label}</p>
                  {CHANNELS.map((channel) => (
                    <div key={channel.key} className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 sm:hidden">{channel.label}</span>
                      <ToggleSwitch
                        checked={form.notifications[category.key][channel.key]}
                        onChange={(checked) => handleToggle(category.key, channel.key, checked)}
                        label={`${channel.label} notifications for ${category.label}`}
                      />
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>

      <GlassCard title="Display & Regional Preferences" description="Control how dates and default views appear across the portal.">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="preferences-date-format" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Date Format
              </label>
              <select
                id="preferences-date-format"
                value={form.dateFormat}
                onChange={(event) => handleFieldChange('dateFormat', event.target.value)}
                className={selectClass}
              >
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="preferences-landing-page" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Default Landing Page
              </label>
              <select
                id="preferences-landing-page"
                value={form.defaultLandingPage}
                onChange={(event) => handleFieldChange('defaultLandingPage', event.target.value)}
                className={selectClass}
              >
                {LANDING_PAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="preferences-academic-year" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Default Academic Year
              </label>
              <select
                id="preferences-academic-year"
                value={form.defaultAcademicYear}
                onChange={(event) => handleFieldChange('defaultAcademicYear', event.target.value)}
                className={selectClass}
              >
                {ACADEMIC_YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </GlassCard>

      <div>
        <PrimaryButton type="submit" fullWidth={false} disabled={isLoading} isLoading={saveStatus === 'loading'}>
          Save Preferences
        </PrimaryButton>
      </div>
    </form>
  )
}
