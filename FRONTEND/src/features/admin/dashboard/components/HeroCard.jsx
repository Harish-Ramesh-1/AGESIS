import { useEffect } from 'react'
import { CircleDot } from 'lucide-react'
import { useAdminDashboardStore } from '../store/adminDashboardStore'
import Skeleton from '../../../../components/common/Skeleton'
import { formatDate } from '../../../../utils/formatDate'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function HeroCard() {
  const status = useAdminDashboardStore((state) => state.summaryStatus)
  const hero = useAdminDashboardStore((state) => state.hero)
  const error = useAdminDashboardStore((state) => state.summaryError)
  const fetchSummary = useAdminDashboardStore((state) => state.fetchSummary)

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-7 w-72 max-w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-16 w-40 shrink-0" />
        </div>
      </div>
    )
  }

  if (status === 'error' || !hero) {
    return (
      <div className="rounded-clay border border-red-100 bg-red-50/60 p-6 text-sm text-red-700 shadow-clay dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        Couldn&apos;t load the dashboard overview. {error}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {getGreeting()}, <span className="font-semibold text-slate-900 dark:text-white">{hero.adminName}</span>
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{hero.role}</h2>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">Today</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{formatDate(new Date())}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">Academic Year</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{hero.academicYear}</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 rounded-2xl border border-white/40 bg-white/40 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04] sm:items-end">
          <div className="sm:text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">New Users This Week</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{hero.newUsersThisWeek}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hero.newUsersToday} added today</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CircleDot className="h-3 w-3" aria-hidden="true" />
            {hero.systemStatus}
          </span>
        </div>
      </div>
    </div>
  )
}
