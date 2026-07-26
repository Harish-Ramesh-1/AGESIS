import { Bell, CheckCircle2, CreditCard, FileText, Receipt } from 'lucide-react'
import Timeline from '../../../components/common/Timeline'
import GlassCard from '../../../components/common/GlassCard'
import { formatDate } from '../../../utils/formatDate'

export default function TimelineCard({ transaction }) {
  if (!transaction) return null

  const items = [
    { id: 'created', icon: CreditCard, tone: 'brand', title: 'Payment Created', meta: formatDate(transaction.date) },
    {
      id: 'completed',
      icon: CheckCircle2,
      tone: 'emerald',
      title: 'Payment Completed',
      meta: formatDate(transaction.date),
    },
    { id: 'receipt', icon: Receipt, tone: 'sky', title: 'Receipt Generated', meta: transaction.receiptNumber ?? '—' },
    {
      id: 'invoice',
      icon: FileText,
      tone: 'violet',
      title: 'Invoice Generated',
      meta: transaction.invoiceNumber ?? '—',
    },
    { id: 'notification', icon: Bell, tone: 'amber', title: 'Notification Sent', meta: 'Email & SMS' },
  ]

  return (
    <GlassCard title="Transaction Timeline" description={`For ${transaction.id}`}>
      <Timeline items={items} />
    </GlassCard>
  )
}
