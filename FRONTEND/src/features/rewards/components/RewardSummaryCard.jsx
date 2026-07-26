import GlassCard from '../../../components/common/GlassCard'

const TONE = {
  brand: 'bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
}

export default function RewardSummaryCard({ icon: Icon, label, value, description, tone = 'brand' }) {
  return (
    <GlassCard className="p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {description && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{description}</p>}
    </GlassCard>
  )
}
