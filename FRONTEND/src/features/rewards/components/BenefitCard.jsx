import { REWARD_ICONS } from '../icons'

export default function BenefitCard({ benefit }) {
  const Icon = REWARD_ICONS[benefit.icon]

  return (
    <div className="flex items-start gap-3 rounded-clay border border-white/40 bg-white/30 p-4 transition-all duration-200 ease-premium hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{benefit.label}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{benefit.description}</p>
      </div>
    </div>
  )
}
