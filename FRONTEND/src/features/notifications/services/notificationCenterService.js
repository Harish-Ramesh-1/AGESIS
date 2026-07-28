import { apiGet } from '../../../services/apiClient'

const DEFAULT_PREFERENCES = {
  paymentNotifications: true,
  emailAlerts: true,
  smsAlerts: false,
  pushNotifications: true,
  schoolAnnouncements: true,
  marketingNotifications: false,
}

// The backend only tags notifications with a free-form `type` ('payment', 'info', ...).
// Map that onto the fixed category vocabulary the Notification Center UI understands
// (CATEGORY_ICONS has no fallback, so every notification must resolve to a known key).
function mapCategory(type) {
  if (type === 'payment') return 'payment'
  if (type === 'invoice') return 'invoice'
  if (type === 'receipt') return 'receipt'
  if (type === 'event') return 'event'
  if (type === 'scholarship') return 'scholarship'
  if (type === 'academic') return 'academic'
  if (type === 'info') return 'announcement'
  return 'system'
}

function mapPriority(notification) {
  const text = `${notification.title} ${notification.message}`.toLowerCase()
  if (text.includes('fail') || text.includes('overdue')) return 'high'
  if (notification.type === 'payment') return 'medium'
  return 'low'
}

function mapAction(category) {
  if (category === 'payment') return { actionLabel: 'View Receipt', actionType: 'view-receipt' }
  if (category === 'invoice') return { actionLabel: 'Download Invoice', actionType: 'download-invoice' }
  return { actionLabel: null, actionType: null }
}

function mapNotification(notification) {
  const category = mapCategory(notification.type)
  const { actionLabel, actionType } = mapAction(category)
  return {
    id: notification.id,
    category,
    title: notification.title,
    description: notification.message,
    timestamp: notification.created_at,
    priority: mapPriority(notification),
    unread: !notification.read,
    pinned: false,
    archived: false,
    actionLabel,
    actionType,
  }
}

export async function fetchNotificationCenterData() {
  const [{ data: notifications }, preferencesResult] = await Promise.all([
    apiGet('/notifications'),
    apiGet('/settings/preferences').catch(() => ({ data: {} })),
  ])

  return {
    notifications: (notifications || []).map(mapNotification),
    preferences: { ...DEFAULT_PREFERENCES, ...(preferencesResult?.data || {}) },
  }
}
