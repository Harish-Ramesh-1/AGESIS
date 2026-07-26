import ProgressRing from '../../../components/common/ProgressRing'
import GlassCard from '../../../components/common/GlassCard'
import Badge from '../../../components/common/Badge'

export default function RewardsHero({ streak, level }) {
  const progressPercent = Math.min(100, Math.round((level.xp / level.nextLevelXp) * 100))

  return (
    <GlassCard hover={false}>
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <ProgressRing percent={progressPercent} label={level.current} size={160} />
        <div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">🔥 {streak.current} Months</p>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Excellent! You have paid your school fees on time for {streak.current} consecutive months.
          </p>
          <Badge variant="info" className="mt-4">
            {level.current} Level
          </Badge>
        </div>
      </div>
    </GlassCard>
  )
}
