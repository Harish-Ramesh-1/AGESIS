import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Mail, MessageSquareText, Send, Smartphone } from 'lucide-react'
import clsx from 'clsx'
import { usePendingDueStore } from '../store/pendingDueStore'
import { useReminderStore } from '../store/reminderStore'
import { REMINDER_TEMPLATES } from '../services/pendingDuesService'
import Skeleton from '../../../components/common/Skeleton'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../utils/pendingDuesUtils'

const CHANNEL_ICONS = { Email: Mail, SMS: Smartphone, 'Push Notification': Send, WhatsApp: MessageSquareText }
const CHANNELS = ['Email', 'SMS', 'Push Notification', 'WhatsApp']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function ReminderCenter() {
  const dueStatus = usePendingDueStore((state) => state.dueListStatus)
  const dueList = usePendingDueStore((state) => state.dueList)
  const fetchDueList = usePendingDueStore((state) => state.fetchDueList)
  const sendBulk = useReminderStore((state) => state.sendBulk)
  const isSending = useReminderStore((state) => state.isSending)
  const lastBulkResult = useReminderStore((state) => state.lastBulkResult)

  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [template, setTemplate] = useState(REMINDER_TEMPLATES[0].key)
  const [channel, setChannel] = useState('Email')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchDueList({})
  }, [fetchDueList])

  const matchingStudents = useMemo(() => {
    return dueList.filter((row) => {
      if (className && row.className !== className) return false
      if (section && row.section !== section) return false
      if (dueFrom && row.dueDate < dueFrom) return false
      if (dueTo && row.dueDate > dueTo) return false
      return true
    })
  }, [dueList, className, section, dueFrom, dueTo])

  const templateMeta = REMINDER_TEMPLATES.find((item) => item.key === template)

  async function handleSend() {
    await sendBulk({ dueIds: matchingStudents.map((row) => row.id), template: templateMeta.label, channel })
    setShowPreview(false)
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Bulk Reminder Center" description="Select a group of students and send fee reminders in bulk" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={className} onChange={(event) => setClassName(event.target.value)} className={selectClass} aria-label="Select class">
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Class {option}
            </option>
          ))}
        </select>
        <select value={section} onChange={(event) => setSection(event.target.value)} className={selectClass} aria-label="Select section">
          <option value="">All Sections</option>
          {SECTION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Section {option}
            </option>
          ))}
        </select>
        <input type="date" value={dueFrom} onChange={(event) => setDueFrom(event.target.value)} className={selectClass} aria-label="Due date from" />
        <input type="date" value={dueTo} onChange={(event) => setDueTo(event.target.value)} className={selectClass} aria-label="Due date to" />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Choose Template</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {REMINDER_TEMPLATES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTemplate(item.key)}
              aria-pressed={template === item.key}
              className={clsx(
                'rounded-xl border px-3 py-3 text-center text-xs font-medium transition-all duration-200 ease-premium hover:-translate-y-0.5',
                template === item.key
                  ? 'border-brand-400/70 bg-white/60 text-brand-700 shadow-clay-active dark:border-brand-400/40 dark:bg-white/[0.08] dark:text-brand-300'
                  : 'border-white/40 bg-white/30 text-slate-600 shadow-clay dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Channel</p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((item) => {
            const Icon = CHANNEL_ICONS[item]
            return (
              <button
                key={item}
                type="button"
                onClick={() => setChannel(item)}
                aria-pressed={channel === item}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
                  channel === item
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        {dueStatus === 'loading' ? (
          <Skeleton className="h-10" />
        ) : (
          <>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <span className="font-semibold">{matchingStudents.length}</span> student{matchingStudents.length === 1 ? '' : 's'} match this selection
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{templateMeta.tone}</p>
            <button type="button" onClick={() => setShowPreview((prev) => !prev)} className="mt-2 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
              {showPreview ? 'Hide' : 'Preview'} recipient list
            </button>
            {showPreview && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {matchingStudents.slice(0, 12).map((row) => (
                  <li key={row.id} className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {row.studentName}
                  </li>
                ))}
                {matchingStudents.length > 12 && (
                  <li className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    +{matchingStudents.length - 12} more
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>

      {lastBulkResult && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Sent {lastBulkResult.length} reminder{lastBulkResult.length === 1 ? '' : 's'} via {channel}.
        </div>
      )}

      <PrimaryButton className="mt-5" fullWidth={false} isLoading={isSending} disabled={matchingStudents.length === 0} onClick={handleSend}>
        <Send className="h-4 w-4" aria-hidden="true" />
        Send to {matchingStudents.length} Student{matchingStudents.length === 1 ? '' : 's'}
      </PrimaryButton>
    </div>
  )
}
