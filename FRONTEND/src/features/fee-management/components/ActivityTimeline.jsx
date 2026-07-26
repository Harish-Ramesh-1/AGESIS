import { AlertCircle, CreditCard, Download, FileText } from 'lucide-react'
import Timeline from '../../../components/common/Timeline'
import GlassCard from '../../../components/common/GlassCard'
import { formatDate } from '../../../utils/formatDate'

const TYPE_META = {
  payment: { icon: CreditCard, tone: 'emerald' },
  invoice: { icon: FileText, tone: 'brand' },
  receipt: { icon: Download, tone: 'sky' },
  latefee: { icon: AlertCircle, tone: 'amber' },
}

export default function ActivityTimeline({ activities }) {
  const items = [...activities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((activity) => {
      const meta = TYPE_META[activity.type] ?? TYPE_META.payment
      return {
        id: activity.id,
        icon: meta.icon,
        tone: meta.tone,
        title: activity.title,
        description: activity.description,
        meta: formatDate(activity.date),
      }
    })

  return (
    <GlassCard title="Recent Fee Activities">
      <Timeline items={items} />
    </GlassCard>
  )
}
