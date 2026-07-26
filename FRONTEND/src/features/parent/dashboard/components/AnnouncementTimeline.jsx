import { Calendar, GraduationCap, Megaphone, Users } from 'lucide-react'
import { useDashboardStore } from '../../../../store/dashboardStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import Timeline from '../../../../components/common/Timeline'
import DashboardCard from './DashboardCard'
import { daysUntil, formatDate } from '../../../../utils/formatDate'

const CATEGORY_META = {
  holiday: { icon: Calendar, label: 'Holiday', tone: 'sky' },
  meeting: { icon: Users, label: 'Meeting', tone: 'violet' },
  fee: { icon: Megaphone, label: 'Fee', tone: 'amber' },
  scholarship: { icon: GraduationCap, label: 'Scholarship', tone: 'emerald' },
}

const DEFAULT_META = { icon: Megaphone, label: 'Notice', tone: 'slate' }

function relativeDateLabel(date) {
  const remaining = daysUntil(date)
  if (remaining > 1) return `In ${remaining} days`
  if (remaining === 1) return 'Tomorrow'
  if (remaining === 0) return 'Today'
  return null
}

export default function AnnouncementTimeline() {
  const status = useDashboardStore((state) => state.status)
  const announcements = useDashboardStore((state) => state.announcements)

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="School Announcements">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      </DashboardCard>
    )
  }

  if (status === 'error') {
    return (
      <DashboardCard title="School Announcements">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load announcements.</p>
      </DashboardCard>
    )
  }

  if (announcements.length === 0) {
    return (
      <DashboardCard title="School Announcements">
        <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No announcements yet.</p>
      </DashboardCard>
    )
  }

  const items = [...announcements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((item) => {
      const meta = CATEGORY_META[item.category] ?? DEFAULT_META
      const relativeLabel = relativeDateLabel(item.date)
      return {
        id: item.id,
        icon: meta.icon,
        tone: meta.tone,
        badge: meta.label,
        title: item.title,
        description: item.description,
        meta: relativeLabel ? `${formatDate(item.date)} · ${relativeLabel}` : formatDate(item.date),
      }
    })

  return (
    <DashboardCard title="School Announcements" description="Latest updates from the school">
      <Timeline items={items} />
    </DashboardCard>
  )
}
