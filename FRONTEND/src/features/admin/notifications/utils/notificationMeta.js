import { CalendarClock, CheckCheck, CircleCheck, CircleX, Mail, MessageSquare, Smartphone } from 'lucide-react'

export const CHANNEL_META = {
  SMS: { label: 'SMS', icon: MessageSquare, variant: 'info' },
  Email: { label: 'Email', icon: Mail, variant: 'neutral' },
  Push: { label: 'Push', icon: Smartphone, variant: 'info' },
}

export function getChannelMeta(channel) {
  return CHANNEL_META[channel] ?? { label: channel, icon: Mail, variant: 'neutral' }
}

export const DELIVERY_STATUS_META = {
  Delivered: { label: 'Delivered', variant: 'success', icon: CircleCheck },
  Read: { label: 'Read', variant: 'info', icon: CheckCheck },
  Failed: { label: 'Failed', variant: 'danger', icon: CircleX },
  Pending: { label: 'Pending', variant: 'warning', icon: CalendarClock },
}

export function getDeliveryStatusMeta(status) {
  return DELIVERY_STATUS_META[status] ?? { label: status, variant: 'neutral', icon: CircleCheck }
}
