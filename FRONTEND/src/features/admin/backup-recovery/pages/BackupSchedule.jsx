import { useEffect, useState } from 'react'
import { CheckCircle2, Database, Play, Server } from 'lucide-react'
import { useBackupRecoveryStore } from '../store/backupRecoveryStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton, PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

const FREQUENCY_OPTIONS = ['Daily', 'Weekly']

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function BackupSchedule() {
  const status = useBackupRecoveryStore((state) => state.scheduleStatus)
  const error = useBackupRecoveryStore((state) => state.scheduleError)
  const schedule = useBackupRecoveryStore((state) => state.schedule)
  const saveStatus = useBackupRecoveryStore((state) => state.scheduleSaveStatus)
  const saveError = useBackupRecoveryStore((state) => state.scheduleSaveError)
  const runBackupStatus = useBackupRecoveryStore((state) => state.runBackupStatus)
  const runBackupResult = useBackupRecoveryStore((state) => state.runBackupResult)
  const fetchSchedule = useBackupRecoveryStore((state) => state.fetchSchedule)
  const saveSchedule = useBackupRecoveryStore((state) => state.saveSchedule)
  const resetSaveStatus = useBackupRecoveryStore((state) => state.resetScheduleSaveStatus)
  const runBackup = useBackupRecoveryStore((state) => state.runBackup)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (schedule && !form) setForm(schedule)
  }, [schedule, form])

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
    await saveSchedule(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Backup Schedule" />
        <ErrorState message={error} onRetry={fetchSchedule} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Backup Schedule" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Backup schedule saved successfully.'}
        {runBackupStatus === 'success' && 'Manual backup completed successfully.'}
        {runBackupStatus === 'error' && `Manual backup failed. ${runBackupResult?.message ?? ''}`}
      </div>

      <GlassCard title="Automated Backup Configuration" description="Full database and document snapshots are stored off-site.">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="backup-frequency" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Backup Frequency
                </label>
                <select
                  id="backup-frequency"
                  value={form.frequency}
                  onChange={(event) => handleChange('frequency', event.target.value)}
                  className={selectClass}
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="backup-time" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Time of Day
                </label>
                <input
                  id="backup-time"
                  type="time"
                  value={form.timeOfDay}
                  onChange={(event) => handleChange('timeOfDay', event.target.value)}
                  className={selectClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="backup-retention" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Retention Period (days)
                </label>
                <input
                  id="backup-retention"
                  type="number"
                  min="1"
                  max="365"
                  value={form.retentionDays}
                  onChange={(event) => handleChange('retentionDays', Number(event.target.value))}
                  className={selectClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Storage Location</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-sm text-slate-600 shadow-clay-inset dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                  <Server className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {form.storageLocation}
                </div>
              </div>
            </div>

            {saveStatus === 'success' && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Schedule saved successfully.
              </p>
            )}
            {saveStatus === 'error' && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {saveError}
              </p>
            )}

            <div>
              <PrimaryButton type="submit" fullWidth={false} isLoading={saveStatus === 'loading'}>
                Save Schedule
              </PrimaryButton>
            </div>
          </form>
        )}
      </GlassCard>

      <GlassCard title="Run Backup Now" description="Trigger an immediate, on-demand backup outside the regular schedule.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <Database className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Manual backup</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {runBackupStatus === 'success' && runBackupResult
                  ? `Last run completed just now — ${runBackupResult.sizeMb} MB in ${runBackupResult.durationSeconds}s.`
                  : 'Runs immediately and does not affect the automated schedule above.'}
              </p>
            </div>
          </div>
          <GlassButton onClick={runBackup} disabled={runBackupStatus === 'loading'} className="shrink-0">
            <Play className="h-4 w-4" aria-hidden="true" />
            {runBackupStatus === 'loading' ? 'Running backup…' : 'Run Backup Now'}
          </GlassButton>
        </div>
        {runBackupStatus === 'error' && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {runBackupResult?.message}
          </p>
        )}
        {runBackupStatus === 'success' && runBackupResult && (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Completed at {formatDate(runBackupResult.timestamp)}.</p>
        )}
      </GlassCard>
    </div>
  )
}
