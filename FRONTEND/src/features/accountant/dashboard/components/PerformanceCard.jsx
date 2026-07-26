import { useEffect } from 'react'
import { useAccountantDashboardStore } from '../store/accountantDashboardStore'
import ProgressRing from '../../../../components/common/ProgressRing'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'

export default function PerformanceCard() {
  const status = useAccountantDashboardStore((state) => state.performanceStatus)
  const performance = useAccountantDashboardStore((state) => state.performance)
  const error = useAccountantDashboardStore((state) => state.performanceError)
  const fetchPerformance = useAccountantDashboardStore((state) => state.fetchPerformance)

  useEffect(() => {
    fetchPerformance()
  }, [fetchPerformance])

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Today's Performance" description="Progress toward the daily collection target" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load performance. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      )}

      {status === 'success' && performance && (
        <div className="flex flex-col items-center gap-5">
          <ProgressRing percent={performance.percent} label="Collected" size={144} />

          <dl className="grid w-full grid-cols-3 gap-3 text-center text-xs">
            <div>
              <dt className="text-slate-400 dark:text-slate-500">Target</dt>
              <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency(performance.target)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 dark:text-slate-500">Collected</dt>
              <dd className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-300">
                {formatCurrency(performance.collected)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 dark:text-slate-500">Remaining</dt>
              <dd className="mt-0.5 font-semibold text-amber-600 dark:text-amber-300">
                {formatCurrency(performance.remaining)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
