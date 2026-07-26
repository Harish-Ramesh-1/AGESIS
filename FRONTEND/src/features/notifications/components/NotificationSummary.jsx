import { AlertCircle, Bell, CalendarClock, Megaphone } from 'lucide-react'
import SummaryTile from './SummaryTile'

export default function NotificationSummary({ notifications }) {
  const active = notifications.filter((item) => !item.archived)
  const unreadCount = active.filter((item) => item.unread).length
  const todayCount = active.filter(
    (item) => new Date(item.timestamp).toDateString() === new Date().toDateString(),
  ).length
  const reminderCount = active.filter((item) => item.category === 'payment' && item.actionType === 'pay-now').length
  const announcementCount = active.filter((item) => item.category === 'announcement').length

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryTile icon={Bell} label="Unread Notifications" value={unreadCount} tone="brand" />
      <SummaryTile icon={CalendarClock} label="Today's Alerts" value={todayCount} tone="emerald" />
      <SummaryTile icon={AlertCircle} label="Payment Reminders" value={reminderCount} tone="amber" />
      <SummaryTile icon={Megaphone} label="Announcements" value={announcementCount} tone="violet" />
    </div>
  )
}
