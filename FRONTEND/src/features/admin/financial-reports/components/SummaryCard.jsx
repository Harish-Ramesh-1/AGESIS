import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import Skeleton from '../../../../components/common/Skeleton'

export default function SummaryCard({ icon: Icon, label, value, meta, trend, status = 'success' }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="mt-4 h-7 w-24" />
        <Skeleton className="mt-2 h-3.5 w-28" />
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              trend.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
            )}
          >
            {trend.direction === 'up' ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {meta && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{meta}</p>}
    </div>
  )
}
