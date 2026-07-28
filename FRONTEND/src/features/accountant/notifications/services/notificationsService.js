import { apiGet, apiPatch } from '../../../../services/apiClient'

export const NOTIFICATION_CATEGORIES = [
  'payment-received',
  'refund-requested',
  'overdue-alert',
  'document-generated',
  'system-announcement',
]

// Categories that reasonably imply the accountant needs to act — the backend has no dedicated
// "actionRequired" flag on notifications, so this is derived from the notification type.
const ACTION_REQUIRED_CATEGORIES = new Set(['refund-requested', 'overdue-alert'])

function mapNotification(row) {
  const category = row.type ?? row.category
  return {
    id: row.id,
    category,
    title: row.title,
    description: row.message ?? row.description ?? '',
    timestamp: row.created_at ?? row.timestamp,
    unread: row.read === false || row.is_read === false || !!row.unread,
    actionRequired: ACTION_REQUIRED_CATEGORIES.has(category),
  }
}

export async function fetchNotifications(filters = {}) {
  const { category, readState, query } = filters
  const params = new URLSearchParams()
  if (category) params.set('type', category)
  if (readState === 'unread') params.set('read', 'false')
  if (readState === 'read') params.set('read', 'true')
  const qs = params.toString()
  const { data } = await apiGet(`/notifications${qs ? `?${qs}` : ''}`)
  let items = (data ?? []).map(mapNotification)
  if (query) {
    const q = query.toLowerCase()
    items = items.filter((item) => [item.title, item.description].join(' ').toLowerCase().includes(q))
  }
  return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function markNotificationRead(id) {
  const { data } = await apiPatch(`/notifications/${id}/read`)
  return mapNotification(data ?? { id })
}

export async function markAllNotificationsRead() {
  await apiPatch('/notifications/read-all')
  return fetchNotifications()
}
