import GlassCard from '../../../components/common/GlassCard'
import { GlassButton } from '../../../components/common/Button'

export default function DownloadCard({ title, description, actions }) {
  return (
    <GlassCard title={title} description={description}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <GlassButton
            key={action.label}
            icon={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
            className="w-full justify-center py-3"
          >
            {action.label}
          </GlassButton>
        ))}
      </div>
    </GlassCard>
  )
}
