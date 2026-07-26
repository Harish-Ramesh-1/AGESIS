import { Coins } from 'lucide-react'
import Timeline from '../../../components/common/Timeline'
import GlassCard from '../../../components/common/GlassCard'

export default function RewardTimeline({ timeline }) {
  const items = timeline.map((entry) => ({
    id: entry.id,
    icon: Coins,
    tone: 'amber',
    title: `${entry.month} · +${entry.points} pts`,
    badge: entry.title,
    description: entry.description,
  }))

  return (
    <GlassCard title="Rewards Timeline">
      <Timeline items={items} />
    </GlassCard>
  )
}
