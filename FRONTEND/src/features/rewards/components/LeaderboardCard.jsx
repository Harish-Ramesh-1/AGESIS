import { Flame } from 'lucide-react'
import clsx from 'clsx'
import GlassCard from '../../../components/common/GlassCard'

export default function LeaderboardCard({ leaderboard }) {
  return (
    <GlassCard title="Family Leaderboard" description="Top 10 families by timely payment streak">
      <ol className="flex flex-col gap-1.5">
        {leaderboard.map((entry) => (
          <li
            key={entry.rank}
            className={clsx(
              'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200',
              entry.isCurrentUser
                ? 'bg-brand-50/80 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'text-slate-600 dark:text-slate-300',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                {entry.rank}
              </span>
              <span>
                {entry.name}
                {entry.isCurrentUser && ' (You)'}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              {entry.streak} mo
            </span>
          </li>
        ))}
      </ol>
    </GlassCard>
  )
}
