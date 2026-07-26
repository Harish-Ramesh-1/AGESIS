import { useEffect } from 'react'
import { Award, Flame, Zap } from 'lucide-react'
import { useDashboardStore } from '../../../../store/dashboardStore'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'
import DashboardCard from './DashboardCard'

const BADGE_ICON = { Award, Zap, Flame }

export default function RewardsCard() {
  const status = useDashboardStore((state) => state.status)
  const rewards = useDashboardStore((state) => state.rewards)
  const fetchDashboardExtras = useDashboardStore((state) => state.fetchDashboardExtras)

  useEffect(() => {
    fetchDashboardExtras()
  }, [fetchDashboardExtras])

  if (status === 'loading' || status === 'idle') {
    return (
      <DashboardCard title="Rewards & Streaks">
        <Skeleton className="h-40" />
      </DashboardCard>
    )
  }

  if (status === 'error' || !rewards) {
    return (
      <DashboardCard title="Rewards & Streaks">
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load rewards.</p>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Rewards & Streaks" description="Earned for paying fees on time">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{rewards.currentStreak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{rewards.longestStreak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Longest Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{rewards.points}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Reward Points</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {rewards.badges.map((badge) => {
          const Icon = BADGE_ICON[badge.icon] ?? Award
          return (
            <div
              key={badge.id}
              className="flex items-center gap-2 rounded-full border border-white/40 bg-white/40 py-1.5 pl-2 pr-3 transition-transform duration-200 ease-premium hover:scale-105 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{badge.label}</span>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
