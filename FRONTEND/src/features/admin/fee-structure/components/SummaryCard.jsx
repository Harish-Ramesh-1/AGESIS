import Skeleton from '../../../../components/common/Skeleton'

export default function SummaryCard({ icon: Icon, label, value, meta, status = 'success' }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="mt-4 h-6 w-24" />
        <Skeleton className="mt-2 h-3.5 w-28" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="truncate text-xl font-bold text-slate-900 dark:text-white">{value}</p>
          {meta && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{meta}</p>}
        </div>
      </div>
    </div>
  )
}
