import ProgressBar from '../../../../components/common/ProgressBar/ProgressBar'

export default function SummaryCard({ icon: Icon, label, value, description, progress }) {
  return (
    <div className="group relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {description && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{description}</p>}
      {typeof progress === 'number' && (
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      )}
    </div>
  )
}
