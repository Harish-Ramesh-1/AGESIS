import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useSystemSettingsStore } from '../store/systemSettingsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'

const TIMEZONE_OPTIONS = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Colombo', 'Asia/Kathmandu']
const DATE_FORMAT_OPTIONS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Kannada', 'Telugu']

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function GeneralSettings() {
  const status = useSystemSettingsStore((state) => state.generalStatus)
  const error = useSystemSettingsStore((state) => state.generalError)
  const general = useSystemSettingsStore((state) => state.general)
  const saveStatus = useSystemSettingsStore((state) => state.generalSaveStatus)
  const saveError = useSystemSettingsStore((state) => state.generalSaveError)
  const fetchGeneral = useSystemSettingsStore((state) => state.fetchGeneral)
  const saveGeneral = useSystemSettingsStore((state) => state.saveGeneral)
  const resetSaveStatus = useSystemSettingsStore((state) => state.resetGeneralSaveStatus)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchGeneral()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (general && !form) setForm(general)
  }, [general, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      const timeout = setTimeout(() => resetSaveStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveGeneral(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="General Settings" />
        <ErrorState message={error} onRetry={fetchGeneral} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="General Settings" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Settings saved successfully.'}
        {saveStatus === 'error' && `Failed to save settings. ${saveError ?? ''}`}
      </div>

      <GlassCard title="School-Wide Preferences" description="These defaults apply across the Parent, Accountant and Admin portals.">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  id="general-school-name"
                  label="School Display Name"
                  value={form.schoolDisplayName}
                  onChange={(event) => handleChange('schoolDisplayName', event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="general-timezone" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Timezone
                </label>
                <select
                  id="general-timezone"
                  value={form.timezone}
                  onChange={(event) => handleChange('timezone', event.target.value)}
                  className={selectClass}
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="general-currency" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Currency
                </label>
                <input
                  id="general-currency"
                  readOnly
                  value="INR — Indian Rupee (₹)"
                  className="rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-sm text-slate-500 shadow-clay-inset dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="general-date-format" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Date Format
                </label>
                <select
                  id="general-date-format"
                  value={form.dateFormat}
                  onChange={(event) => handleChange('dateFormat', event.target.value)}
                  className={selectClass}
                >
                  {DATE_FORMAT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="general-language" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Default Language
                </label>
                <select
                  id="general-language"
                  value={form.defaultLanguage}
                  onChange={(event) => handleChange('defaultLanguage', event.target.value)}
                  className={selectClass}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {saveStatus === 'success' && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Settings saved successfully.
              </p>
            )}
            {saveStatus === 'error' && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}

            <div>
              <PrimaryButton type="submit" fullWidth={false} isLoading={saveStatus === 'loading'}>
                Save Changes
              </PrimaryButton>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
