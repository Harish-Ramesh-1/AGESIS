import { Pin } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import NotificationFeed from './NotificationFeed'

export default function PinnedSection({ notifications, ...feedProps }) {
  if (notifications.length === 0) return null

  return (
    <GlassCard
      title="Pinned Notifications"
      description="Important notices, critical payment alerts and principal messages"
      hover={false}
      action={<Pin className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" />}
    >
      <NotificationFeed notifications={notifications} {...feedProps} />
    </GlassCard>
  )
}
