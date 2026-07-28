import { useEffect } from 'react'
import { ClipboardPlus, DatabaseBackup, FileText, LifeBuoy, ShieldAlert, UserCog } from 'lucide-react'
import { useAdminDashboardStore } from '../store/adminDashboardStore'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { PRIORITY_BADGE_VARIANT } from '../utils/dashboardUtils'

const TASK_ICON = { ClipboardPlus, ShieldAlert, DatabaseBackup, LifeBuoy, UserCog }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

export default function UpcomingTasks() {
  const status = useAdminDashboardStore((state) => state.performanceStatus)
  const upcomingTasks = useAdminDashboardStore((state) => state.upcomingTasks)
  const error = useAdminDashboardStore((state) => state.performanceError)
  const fetchPerformance = useAdminDashboardStore((state) => state.fetchPerformance)

  useEffect(() => {
    fetchPerformance()
  }, [fetchPerformance])

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Upcoming Tasks" />

      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load tasks. {error}</p>}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      )}

      {status === 'success' && upcomingTasks.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Nothing on the list. All caught up.</p>
      )}

      {status === 'success' && upcomingTasks.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {upcomingTasks.map((task) => {
            const Icon = TASK_ICON[task.icon] ?? FileText
            return (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-xl border border-white/40 bg-white/40 p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
                    <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">Due {task.due}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
