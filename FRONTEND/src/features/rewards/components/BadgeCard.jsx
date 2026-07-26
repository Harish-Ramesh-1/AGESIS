import { Lock } from 'lucide-react'
import clsx from 'clsx'
import { REWARD_ICONS } from '../icons'

export default function BadgeCard({ badge }) {
  const Icon = REWARD_ICONS[badge.icon]

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center gap-2 overflow-hidden rounded-clay border p-5 text-center transition-all duration-200 ease-premium',
        badge.unlocked
          ? 'animate-[fade-in_400ms_ease-premium] border-white/50 bg-white/40 shadow-clay hover:-translate-y-0.5 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05]'
          : 'border-white/30 bg-white/20 dark:border-white/5 dark:bg-white/[0.02]',
      )}
    >
      <div className={clsx('flex flex-col items-center gap-2', !badge.unlocked && 'opacity-50 blur-[3px]')}>
        <span
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-2xl',
            badge.unlocked
              ? 'bg-brand-600 text-white'
              : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400',
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{badge.label}</p>
      </div>

      {!badge.unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/10 dark:bg-slate-950/20">
          <Lock className="h-4 w-4 text-slate-500 dark:text-slate-300" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-200">{badge.progress}%</span>
        </div>
      )}
    </div>
  )
}
