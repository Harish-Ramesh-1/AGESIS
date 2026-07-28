import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Megaphone, Send, Users } from 'lucide-react'
import { useAnnouncementsStore } from '../store/announcementsStore'
import { AUDIENCE_OPTIONS, CLASS_OPTIONS } from '../services/notificationsService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import NotificationsNav from '../components/NotificationsNav'
import SummaryCard from '../components/SummaryCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import DataTable from '../../../../components/common/DataTable'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import InputField from '../../../../components/common/Input'
import { formatDate } from '../../../../utils/formatDate'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const EMPTY_FORM = { title: '', message: '', audience: AUDIENCE_OPTIONS[0], className: CLASS_OPTIONS[0], scheduledAt: '' }

export default function Announcements() {
  const status = useAnnouncementsStore((state) => state.status)
  const error = useAnnouncementsStore((state) => state.error)
  const items = useAnnouncementsStore((state) => state.items)
  const sendStatus = useAnnouncementsStore((state) => state.sendStatus)
  const fetchAnnouncements = useAnnouncementsStore((state) => state.fetchAnnouncements)
  const sendNow = useAnnouncementsStore((state) => state.sendNow)
  const schedule = useAnnouncementsStore((state) => state.schedule)

  const [form, setForm] = useState(EMPTY_FORM)
  const [validationError, setValidationError] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!form.title.trim() || !form.message.trim()) {
      setValidationError('Title and message are required.')
      return false
    }
    setValidationError('')
    return true
  }

  async function handleSendNow() {
    if (!validate()) return
    const record = await sendNow({ title: form.title, message: form.message, audience: form.audience, className: form.audience === 'Specific Class' ? form.className : null })
    if (record) {
      setForm(EMPTY_FORM)
      setShowSchedule(false)
    }
  }

  async function handleConfirmSchedule() {
    if (!validate()) return
    if (!form.scheduledAt) {
      setValidationError('Choose a date and time to schedule this announcement.')
      return
    }
    const record = await schedule({ title: form.title, channel: 'Push', audience: form.audience, scheduledAt: new Date(form.scheduledAt).toISOString() })
    if (record) {
      setForm(EMPTY_FORM)
      setShowSchedule(false)
    }
  }

  const totalReach = useMemo(() => items.reduce((sum, item) => sum + item.reachCount, 0), [items])
  const monthCount = useMemo(() => {
    const now = new Date()
    return items.filter((item) => {
      const sent = new Date(item.sentAt)
      return sent.getMonth() === now.getMonth() && sent.getFullYear() === now.getFullYear()
    }).length
  }, [items])

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'audience', header: 'Audience', render: (row) => (row.audience === 'Specific Class' ? `${row.className}` : row.audience) },
    { key: 'reachCount', header: 'Reach', render: (row) => row.reachCount.toLocaleString('en-IN') },
    { key: 'sentAt', header: 'Sent Date', render: (row) => formatDate(row.sentAt) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Announcements" />
      <NotificationsNav />

      <div aria-live="polite" className="sr-only">
        {sendStatus === 'success' ? 'Announcement sent successfully.' : ''}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Megaphone} label="Total Announcements" value={items.length} tone="brand" />
        <SummaryCard icon={Users} label="Total Reach (All Time)" value={totalReach.toLocaleString('en-IN')} tone="brand" />
        <SummaryCard icon={CalendarClock} label="Sent This Month" value={monthCount} tone="success" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Compose Announcement</h2>

        <div className="flex flex-col gap-4">
          <InputField label="Title" value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="e.g. Term 2 fee due date extended" />

          <div className="flex flex-col gap-1">
            <label htmlFor="announcement-message" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Message
            </label>
            <textarea
              id="announcement-message"
              rows={4}
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              placeholder="Write the announcement message parents or staff will receive"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="announcement-audience" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Audience
              </label>
              <select id="announcement-audience" value={form.audience} onChange={(event) => updateField('audience', event.target.value)} className={selectClass}>
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {form.audience === 'Specific Class' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="announcement-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Class
                </label>
                <select id="announcement-class" value={form.className} onChange={(event) => updateField('className', event.target.value)} className={selectClass}>
                  {CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showSchedule && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="announcement-schedule" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Scheduled Date &amp; Time
              </label>
              <input
                id="announcement-schedule"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => updateField('scheduledAt', event.target.value)}
                className={selectClass}
              />
            </div>
          )}

          {validationError && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {validationError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <PrimaryButton fullWidth={false} onClick={handleSendNow} isLoading={sendStatus === 'loading' && !showSchedule}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Now
            </PrimaryButton>
            {showSchedule ? (
              <SecondaryButton fullWidth={false} onClick={handleConfirmSchedule} isLoading={sendStatus === 'loading' && showSchedule}>
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Confirm Schedule
              </SecondaryButton>
            ) : (
              <SecondaryButton fullWidth={false} onClick={() => setShowSchedule(true)}>
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Schedule
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Sent Announcements</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchAnnouncements} />}

        {status === 'success' && items.length === 0 && <EmptyState icon={Megaphone} title="No announcements sent yet" description="Announcements you send will appear here." />}

        {status === 'success' && items.length > 0 && <DataTable columns={columns} rows={items} keyField="id" />}
      </div>
    </div>
  )
}
