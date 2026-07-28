import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useSystemSettingsStore } from '../store/systemSettingsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'

const GRADING_SCALE_OPTIONS = [
  { value: 'letter', label: 'Letter Grade (A–F)' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'gpa', label: 'GPA (0–10)' },
]

const MONTH_OPTIONS = ['January', 'April', 'June', 'July', 'September']

const WORKING_DAY_OPTIONS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AcademicConfiguration() {
  const status = useSystemSettingsStore((state) => state.academicStatus)
  const error = useSystemSettingsStore((state) => state.academicError)
  const academic = useSystemSettingsStore((state) => state.academic)
  const saveStatus = useSystemSettingsStore((state) => state.academicSaveStatus)
  const saveError = useSystemSettingsStore((state) => state.academicSaveError)
  const fetchAcademic = useSystemSettingsStore((state) => state.fetchAcademic)
  const saveAcademic = useSystemSettingsStore((state) => state.saveAcademic)
  const resetSaveStatus = useSystemSettingsStore((state) => state.resetAcademicSaveStatus)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchAcademic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (academic && !form) setForm(academic)
  }, [academic, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      const timeout = setTimeout(() => resetSaveStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleWorkingDay(dayKey) {
    setForm((prev) => ({ ...prev, workingDays: { ...prev.workingDays, [dayKey]: !prev.workingDays[dayKey] } }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveAcademic(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Academic Configuration" />
        <ErrorState message={error} onRetry={fetchAcademic} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Academic Configuration" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Academic configuration saved successfully.'}
        {saveStatus === 'error' && `Failed to save configuration. ${saveError ?? ''}`}
      </div>

      <GlassCard title="Grading & Attendance" description="Applied school-wide unless overridden at the class level.">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="academic-grading-scale" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Grading Scale
                </label>
                <select
                  id="academic-grading-scale"
                  value={form.gradingScale}
                  onChange={(event) => handleChange('gradingScale', event.target.value)}
                  className={selectClass}
                >
                  {GRADING_SCALE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="academic-attendance-threshold" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Attendance Minimum Threshold (%)
                </label>
                <input
                  id="academic-attendance-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={form.attendanceThresholdPercent}
                  onChange={(event) => handleChange('attendanceThresholdPercent', Number(event.target.value))}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="academic-year-start" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Default Academic Year Start Month
                </label>
                <select
                  id="academic-year-start"
                  value={form.academicYearStartMonth}
                  onChange={(event) => handleChange('academicYearStartMonth', event.target.value)}
                  className={selectClass}
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Working Days</p>
              <div className="flex flex-wrap gap-2">
                {WORKING_DAY_OPTIONS.map((day) => {
                  const checked = form.workingDays[day.key]
                  return (
                    <label
                      key={day.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-premium ${
                        checked
                          ? 'border-brand-500 bg-brand-50/80 text-brand-700 dark:border-brand-400/50 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleWorkingDay(day.key)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      {day.label}
                    </label>
                  )
                })}
              </div>
            </div>

            {saveStatus === 'success' && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Configuration saved successfully.
              </p>
            )}
            {saveStatus === 'error' && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}

            <div>
              <PrimaryButton type="submit" fullWidth={false} isLoading={saveStatus === 'loading'}>
                Save Configuration
              </PrimaryButton>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
