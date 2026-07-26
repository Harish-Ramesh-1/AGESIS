import { Award, BookCheck, CalendarCheck, ClipboardList, TrendingUp } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import ProgressBar from '../../../components/common/ProgressBar'

export default function AcademicCard({ snapshot }) {
  const assignmentsPercent = Math.round((snapshot.assignmentsCompleted / snapshot.assignmentsTotal) * 100)
  const examsPercent = Math.round((snapshot.examsCompleted / snapshot.examsTotal) * 100)

  const tiles = [
    { icon: CalendarCheck, label: 'Attendance', value: `${snapshot.attendance}%`, progress: snapshot.attendance },
    { icon: Award, label: 'Current Grade', value: snapshot.currentGrade },
    {
      icon: ClipboardList,
      label: 'Assignments',
      value: `${snapshot.assignmentsCompleted}/${snapshot.assignmentsTotal}`,
      progress: assignmentsPercent,
    },
    {
      icon: BookCheck,
      label: 'Examinations',
      value: `${snapshot.examsCompleted}/${snapshot.examsTotal}`,
      progress: examsPercent,
    },
  ]

  return (
    <GlassCard title="Academic Snapshot" hover={false}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-clay border border-white/40 bg-white/30 p-4 transition-all duration-200 ease-premium hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <tile.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{tile.value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tile.label}</p>
            {typeof tile.progress === 'number' && (
              <div className="mt-2">
                <ProgressBar value={tile.progress} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        Performance trending upward this term
      </div>
    </GlassCard>
  )
}
