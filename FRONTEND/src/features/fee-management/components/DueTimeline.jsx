import { AlertOctagon, Bell, CalendarClock, CircleDot, MailWarning } from 'lucide-react'
import Timeline from '../../../components/common/Timeline'
import GlassCard from '../../../components/common/GlassCard'
import { formatDate } from '../../../utils/formatDate'

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function DueTimeline({ dueDate, graceDays = 7 }) {
  const reminderDate = addDays(dueDate, -5)
  const penaltyStartDate = addDays(dueDate, graceDays)
  const finalReminderDate = addDays(dueDate, graceDays + 3)

  const items = [
    { id: 'today', icon: CircleDot, tone: 'brand', title: 'Today', meta: formatDate(new Date()) },
    { id: 'reminder', icon: Bell, tone: 'sky', title: 'Reminder', meta: formatDate(reminderDate) },
    { id: 'due', icon: CalendarClock, tone: 'amber', title: 'Due Date', meta: formatDate(dueDate) },
    { id: 'penalty', icon: AlertOctagon, tone: 'red', title: 'Penalty Starts', meta: formatDate(penaltyStartDate) },
    { id: 'final', icon: MailWarning, tone: 'red', title: 'Final Reminder', meta: formatDate(finalReminderDate) },
  ]

  return (
    <GlassCard title="Due Timeline">
      <Timeline items={items} />
    </GlassCard>
  )
}
