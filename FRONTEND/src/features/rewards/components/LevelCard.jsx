import { Check } from 'lucide-react'
import clsx from 'clsx'
import GlassCard from '../../../components/common/GlassCard'
import ProgressBar from '../../../components/common/ProgressBar'

export default function LevelCard({ level }) {
  const currentIndex = level.tiers.indexOf(level.current)
  const progressPercent = Math.min(100, Math.round((level.xp / level.nextLevelXp) * 100))

  return (
    <GlassCard
      title="Current Level"
      description={`${level.xp.toLocaleString()} / ${level.nextLevelXp.toLocaleString()} XP to ${level.nextLevel}`}
    >
      <div className="flex items-center justify-between">
        {level.tiers.map((tier, index) => (
          <div key={tier} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                index < currentIndex
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : index === currentIndex
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500',
              )}
            >
              {index < currentIndex ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={clsx(
                'text-xs font-medium',
                index === currentIndex ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {tier}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <ProgressBar value={progressPercent} />
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{level.xp.toLocaleString()} XP</span>
          <span>{level.nextLevelXp.toLocaleString()} XP</span>
        </div>
      </div>
    </GlassCard>
  )
}
