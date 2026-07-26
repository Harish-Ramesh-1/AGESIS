import GlassCard from '../../../components/common/GlassCard'
import BadgeCard from './BadgeCard'

export default function BadgeGrid({ badges }) {
  return (
    <GlassCard title="Achievement Badges" hover={false}>
      <div className="thin-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.id} className="w-36 shrink-0 sm:w-auto">
            <BadgeCard badge={badge} />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
