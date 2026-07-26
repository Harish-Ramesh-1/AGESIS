import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, ClipboardX, Gauge, Mail, MessageSquareText, Send, Smartphone } from 'lucide-react'
import clsx from 'clsx'
import { useReminderStore } from '../store/reminderStore'
import { usePendingDueStore } from '../store/pendingDueStore'
import PendingDuesPageHeader from '../components/PendingDuesPageHeader'
import SectionHeader from '../components/SectionHeader'
import OutstandingSummaryCard from '../components/OutstandingSummaryCard'
import ReminderCenter from '../components/ReminderCenter'
import ReminderHistoryTable from '../components/ReminderHistoryTable'

const CHANNEL_INFO = [
  { label: 'Email', icon: Mail, ready: true },
  { label: 'SMS', icon: Smartphone, ready: true },
  { label: 'Push Notification', icon: Send, ready: true },
  { label: 'WhatsApp', icon: MessageSquareText, ready: true, badge: 'Ready' },
]

const AUTOMATION_OPTIONS = [
  { key: 'daily', label: 'Schedule Daily Reminders' },
  { key: 'weekly', label: 'Schedule Weekly Reminders' },
  { key: 'beforeDue', label: 'Auto Reminder Before Due Date' },
  { key: 'afterDue', label: 'Auto Reminder After Due Date' },
]

export default function ReminderManagement() {
  const historyStatus = useReminderStore((state) => state.historyStatus)
  const history = useReminderStore((state) => state.history)
  const fetchHistory = useReminderStore((state) => state.fetchHistory)
  const dueList = usePendingDueStore((state) => state.dueList)
  const fetchDueList = usePendingDueStore((state) => state.fetchDueList)

  const [automation, setAutomation] = useState({ daily: true, weekly: false, beforeDue: true, afterDue: true })

  useEffect(() => {
    fetchHistory()
    fetchDueList({})
  }, [fetchHistory, fetchDueList])

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const sentToday = history.filter((item) => item.sentTime.slice(0, 10) === today).length
    const failed = history.filter((item) => item.status === 'failed').length
    const delivered = history.filter((item) => item.status === 'delivered').length
    const responseRate = history.length > 0 ? Math.round((delivered / history.length) * 100) : 0
    const scheduled = dueList.filter((row) => row.status === 'upcoming' || row.status === 'pending').length
    return { sentToday, failed, responseRate, scheduled }
  }, [history, dueList])

  function toggleAutomation(key) {
    setAutomation((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PendingDuesPageHeader pageTitle="Reminder Management" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OutstandingSummaryCard icon={Send} label="Reminders Sent Today" value={summary.sentToday} status={historyStatus} />
        <OutstandingSummaryCard icon={CalendarClock} label="Scheduled Reminders" value={summary.scheduled} meta="Upcoming automated sends" status={historyStatus} />
        <OutstandingSummaryCard icon={ClipboardX} label="Failed Deliveries" value={summary.failed} status={historyStatus} />
        <OutstandingSummaryCard icon={Gauge} label="Response Rate" value={`${summary.responseRate}%`} status={historyStatus} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Reminder Channels" description="Available delivery channels for fee reminders" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHANNEL_INFO.map((channel) => (
            <div key={channel.label} className="flex flex-col items-center gap-2 rounded-clay border border-white/40 bg-white/30 px-3 py-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <channel.icon className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{channel.label}</span>
              {channel.badge && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{channel.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      <ReminderCenter />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Automation" description="Configure when reminders are sent automatically" />
        <div className="flex flex-wrap gap-2">
          {AUTOMATION_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => toggleAutomation(option.key)}
              aria-pressed={automation[option.key]}
              className={clsx(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
                automation[option.key]
                  ? 'bg-brand-600 text-white shadow-clay-button'
                  : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Reminder History" />
        <ReminderHistoryTable />
      </div>
    </div>
  )
}
