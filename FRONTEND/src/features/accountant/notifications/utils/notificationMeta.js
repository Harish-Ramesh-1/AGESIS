import { CircleDollarSign, FileText, Megaphone, TriangleAlert, Undo2 } from 'lucide-react'

export const CATEGORY_META = {
  'payment-received': { label: 'Payment Received', icon: CircleDollarSign, variant: 'success' },
  'refund-requested': { label: 'Refund Requested', icon: Undo2, variant: 'warning' },
  'overdue-alert': { label: 'Overdue Alert', icon: TriangleAlert, variant: 'danger' },
  'document-generated': { label: 'Document Generated', icon: FileText, variant: 'info' },
  'system-announcement': { label: 'System Announcement', icon: Megaphone, variant: 'neutral' },
}

export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? { label: category, icon: FileText, variant: 'neutral' }
}
