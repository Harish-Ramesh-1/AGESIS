import { useEffect, useState } from 'react'
import { CalendarClock, Mail, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useExportStore } from '../store/exportStore'
import Skeleton from '../../../components/common/Skeleton'
import InputField from '../../../components/common/Input'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'

const REPORT_OPTIONS = ['Daily Collection', 'Monthly Revenue', 'Outstanding Dues', 'Collection Analytics', 'Payment Analytics']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function ScheduleCard() {
  const status = useExportStore((state) => state.scheduleStatus)
  const schedules = useExportStore((state) => state.schedules)
  const fetchSchedules = useExportStore((state) => state.fetchSchedules)
  const createSchedule = useExportStore((state) => state.createSchedule)
  const toggleSchedule = useExportStore((state) => state.toggleSchedule)
  const isScheduling = useExportStore((state) => state.isScheduling)

  const [reportName, setReportName] = useState(REPORT_OPTIONS[0])
  const [frequency, setFrequency] = useState(FREQUENCIES[0])
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  async function handleCreate(event) {
    event.preventDefault()
    if (!email.trim()) return
    await createSchedule({ reportName, frequency, email: email.trim() })
    setEmail('')
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Scheduled Reports" description="Automatically email reports on a recurring basis" />

      <form onSubmit={handleCreate} className="mb-5 flex flex-col gap-3 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/[0.06]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={reportName} onChange={(event) => setReportName(event.target.value)} className={selectClass} aria-label="Report">
            {REPORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="flex gap-1.5" role="group" aria-label="Frequency">
            {FREQUENCIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFrequency(item)}
                aria-pressed={frequency === item}
                className={clsx(
                  'flex-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 ease-premium',
                  frequency === item
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <InputField type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email delivery address" required />
        </div>
        <PrimaryButton type="submit" fullWidth={false} isLoading={isScheduling}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Schedule Report
        </PrimaryButton>
      </form>

      {status === 'loading' && (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      )}

      {status === 'success' && schedules.length === 0 && <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">No scheduled reports yet.</p>}

      {status === 'success' && schedules.length > 0 && (
        <ul className="flex flex-col gap-2">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{schedule.reportName}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-400 dark:text-slate-500">
                    {schedule.frequency} · <Mail className="h-3 w-3" aria-hidden="true" /> {schedule.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={schedule.active}
                aria-label={`${schedule.active ? 'Disable' : 'Enable'} schedule for ${schedule.reportName}`}
                onClick={() => toggleSchedule(schedule.id)}
                className={clsx('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-premium', schedule.active ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15')}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium',
                    schedule.active ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
