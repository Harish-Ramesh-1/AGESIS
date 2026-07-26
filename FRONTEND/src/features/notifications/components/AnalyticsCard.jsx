import { BarChart3, CheckCircle2, Inbox, TrendingUp } from 'lucide-react'
import SummaryTile from './SummaryTile'
import { CATEGORY_LABELS } from '../icons'

export default function AnalyticsCard({ notifications }) {
  const active = notifications.filter((item) => !item.archived)
  const total = active.length
  const unread = active.filter((item) => item.unread).length
  const readRate = total === 0 ? 0 : Math.round(((total - unread) / total) * 100)

  const counts = active.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})
  const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryTile icon={Inbox} label="Total Notifications" value={total} tone="brand" />
      <SummaryTile icon={CheckCircle2} label="Read Rate" value={`${readRate}%`} tone="emerald" />
      <SummaryTile icon={BarChart3} label="Unread" value={unread} tone="amber" />
      <SummaryTile
        icon={TrendingUp}
        label="Most Frequent Category"
        value={mostFrequent ? CATEGORY_LABELS[mostFrequent[0]] : '—'}
        tone="violet"
      />
    </div>
  )
}
