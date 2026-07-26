import { CheckCircle2, Circle, Clock } from 'lucide-react'
import Timeline from '../../../components/common/Timeline'
import GlassCard from '../../../components/common/GlassCard'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const STATUS_META = {
  paid: { icon: CheckCircle2, tone: 'emerald', badge: 'Paid' },
  upcoming: { icon: Clock, tone: 'amber', badge: 'Upcoming' },
  pending: { icon: Circle, tone: 'slate', badge: 'Pending' },
}

export default function InstallmentTimeline({ installments }) {
  const items = installments.map((installment) => {
    const meta = STATUS_META[installment.status] ?? STATUS_META.pending
    return {
      id: installment.id,
      icon: meta.icon,
      tone: meta.tone,
      badge: meta.badge,
      title: `${installment.label} · ${formatCurrency(installment.amount)}`,
      description:
        installment.status === 'paid'
          ? `Paid on ${formatDate(installment.paidDate)}`
          : `Due ${formatDate(installment.dueDate)}`,
    }
  })

  return (
    <GlassCard title="Installment Timeline">
      <Timeline items={items} />
    </GlassCard>
  )
}
