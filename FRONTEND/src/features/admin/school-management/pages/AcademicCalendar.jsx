import { useEffect, useMemo } from 'react'
import { BookOpen, CalendarDays, PartyPopper, Plus, Trophy, Users } from 'lucide-react'
import { useAcademicCalendarStore } from '../store/academicCalendarStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import Timeline from '../../../../components/common/Timeline'
import { GlassButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'

const EVENT_ICON = { PartyPopper, Users, BookOpen, Trophy, CalendarDays }

function monthKey(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function AcademicCalendar() {
  const status = useAcademicCalendarStore((state) => state.status)
  const error = useAcademicCalendarStore((state) => state.error)
  const events = useAcademicCalendarStore((state) => state.events)
  const fetchEvents = useAcademicCalendarStore((state) => state.fetchEvents)

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const groupedEvents = useMemo(() => {
    const groups = new Map()
    for (const event of events) {
      const key = monthKey(event.date)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push({
        id: event.id,
        icon: EVENT_ICON[event.icon] ?? CalendarDays,
        tone: event.tone,
        title: event.title,
        description: event.description,
        badge: event.type,
        meta: formatDate(event.date),
      })
    }
    return Array.from(groups.entries())
  }, [events])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Academic Calendar"
        extraControls={<GlassButton icon={Plus}>Add Event</GlassButton>}
      />

      {status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchEvents} />}

      {status === 'success' && events.length === 0 && (
        <EmptyState icon={CalendarDays} title="No events scheduled" description="Upcoming academic events will appear here." />
      )}

      {status === 'success' && events.length > 0 && (
        <div className="flex flex-col gap-6">
          {groupedEvents.map(([month, items]) => (
            <div
              key={month}
              className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
              />
              <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{month}</h2>
              <Timeline items={items} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
