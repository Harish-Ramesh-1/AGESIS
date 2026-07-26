import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { REWARD_ICONS } from '../icons'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function UpcomingRewardCard({ reward }) {
  const navigate = useNavigate()
  const Icon = REWARD_ICONS[reward.icon]

  return (
    <div className="flex items-center gap-4 rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{reward.title}</p>
        <p className="mt-0.5 text-xs font-medium text-brand-600 dark:text-brand-300">{reward.reward}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate(PARENT_ROUTES.payFees)}
        aria-label={`Take action: ${reward.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:hover:bg-white/10"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
