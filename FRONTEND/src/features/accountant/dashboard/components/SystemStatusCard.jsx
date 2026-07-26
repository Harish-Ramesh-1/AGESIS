import { useEffect } from 'react'
import { useAccountantDashboardStore } from '../store/accountantDashboardStore'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'

const GOOD_STATUSES = new Set(['online', 'healthy', 'running', 'connected'])
const STATUS_LABEL = {
  online: 'Online',
  healthy: 'Healthy',
  running: 'Running',
  connected: 'Connected',
  degraded: 'Degraded',
  down: 'Down',
}

export default function SystemStatusCard() {
  const status = useAccountantDashboardStore((state) => state.performanceStatus)
  const systemStatus = useAccountantDashboardStore((state) => state.systemStatus)
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
      <SectionHeader title="System Status" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load system status. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      )}

      {status === 'success' && (
        <div className="grid grid-cols-2 gap-2.5">
          {systemStatus.map((item) => {
            const isGood = GOOD_STATUSES.has(item.status)
            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/40 bg-white/40 p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                </div>
                <p
                  className={`mt-1.5 text-sm font-semibold ${isGood ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">{item.detail}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
