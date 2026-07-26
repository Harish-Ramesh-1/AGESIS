import { useEffect } from 'react'
import { Award, Coins, Flame, Target } from 'lucide-react'
import { useRewardsStore } from '../../../store/rewardsStore'
import PageHeader from '../components/PageHeader'
import RewardsHero from '../components/RewardsHero'
import RewardSummaryCard from '../components/RewardSummaryCard'
import BadgeGrid from '../components/BadgeGrid'
import RewardTimeline from '../components/RewardTimeline'
import LevelCard from '../components/LevelCard'
import BenefitCard from '../components/BenefitCard'
import UpcomingRewardCard from '../components/UpcomingRewardCard'
import AnalyticsChart from '../components/AnalyticsChart'
import LeaderboardCard from '../components/LeaderboardCard'
import MotivationBanner from '../components/MotivationBanner'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'

export default function RewardsPage() {
  const status = useRewardsStore((state) => state.status)
  const data = useRewardsStore((state) => state.data)
  const fetchRewards = useRewardsStore((state) => state.fetchRewards)

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  if (status === 'error') {
    return (
      <div>
        <PageHeader title="Rewards & Streaks" description="Earn recognition for paying your fees on time." />
        <ErrorState message="Couldn't load your rewards." onRetry={fetchRewards} />
      </div>
    )
  }

  if (status !== 'success' || !data) {
    return (
      <div>
        <PageHeader title="Rewards & Streaks" description="Earn recognition for paying your fees on time." />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const nextBadge = data.badges.find((badge) => !badge.unlocked)
  const platinumBadge = data.badges.find((badge) => badge.label === 'Platinum Member')

  return (
    <div>
      <PageHeader title="Rewards & Streaks" description="Earn recognition for paying your fees on time." />

      <div className="flex flex-col gap-8">
        <RewardsHero streak={data.streak} level={data.level} />

        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <RewardSummaryCard icon={Coins} label="Reward Points" value={data.points.toLocaleString()} tone="brand" />
            <RewardSummaryCard icon={Award} label="Current Badge" value={data.level.current} tone="emerald" />
            <RewardSummaryCard icon={Flame} label="Longest Streak" value={`${data.streak.longest} mo`} tone="amber" />
            <RewardSummaryCard
              icon={Target}
              label="Next Reward Goal"
              value={nextBadge ? nextBadge.label : 'All caught up'}
              description={nextBadge ? `${nextBadge.progress}% complete` : undefined}
              tone="violet"
            />
          </div>
        </section>

        <BadgeGrid badges={data.badges} />

        <RewardTimeline timeline={data.timeline} />

        <LevelCard level={data.level} />

        <section>
          <GlassCard title="Reward Benefits" description="Perks that come with your current level" hover={false}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.benefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </div>
          </GlassCard>
        </section>

        <section>
          <GlassCard title="Upcoming Rewards" hover={false}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.upcomingRewards.map((reward) => (
                <UpcomingRewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </GlassCard>
        </section>

        <AnalyticsChart analytics={data.analytics} streak={data.streak} />

        <LeaderboardCard leaderboard={data.leaderboard} />

        {platinumBadge && (
          <MotivationBanner
            message={`You are just one payment away from unlocking the ${platinumBadge.label.replace(' Member', '')} Badge.`}
          />
        )}
      </div>
    </div>
  )
}
