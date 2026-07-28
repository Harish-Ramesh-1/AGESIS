import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

export const AUDIENCE_OPTIONS = ['All Parents', 'Specific Class', 'All Staff']
export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`)
export const CHANNEL_OPTIONS = ['SMS', 'Email', 'Push']
export const DELIVERY_STATUS_OPTIONS = ['Delivered', 'Read', 'Failed', 'Pending']
export const TEMPLATE_CATEGORIES = ['Fee Reminder', 'Admission', 'Payment', 'Academic', 'Security', 'General']

const CHANNEL_TO_BACKEND = { SMS: 'sms', Email: 'email', Push: 'push' }
const CHANNEL_FROM_BACKEND = { sms: 'SMS', email: 'Email', push: 'Push' }
function channelToBackend(channel) {
  return CHANNEL_TO_BACKEND[channel] || 'email'
}
function channelFromBackend(channel) {
  return CHANNEL_FROM_BACKEND[channel] || channel
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

/** Active-student counts per class, used to back-fill a real reach count for historical
 * announcements since the announcements table doesn't persist a recipient-count column. */
async function getClassStrengthMap() {
  const { data } = await apiGet('/students?status=active')
  const map = {}
  let total = 0
  ;(data || []).forEach((student) => {
    map[student.class_name] = (map[student.class_name] || 0) + 1
    total += 1
  })
  return { byClass: map, total }
}

function mapAnnouncement(row, classStrength) {
  const classes = row.audience?.classes || []
  const audience = classes.length > 0 ? 'Specific Class' : 'All Parents'
  const className = classes.length > 0 ? `Class ${classes[0]}` : null
  const reachCount =
    typeof row.recipientCount === 'number'
      ? row.recipientCount
      : classes.length > 0
        ? classes.reduce((sum, cls) => sum + (classStrength?.byClass?.[cls] || 0), 0)
        : classStrength?.total || 0
  return { id: row.id, title: row.title, message: row.message, audience, className, reachCount, sentAt: row.sent_at || row.created_at }
}

export async function fetchAnnouncements() {
  const [{ data: announcements }, classStrength] = await Promise.all([apiGet('/notifications/announcements'), getClassStrengthMap()])
  return (announcements || [])
    .map((row) => mapAnnouncement(row, classStrength))
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
}

export async function sendAnnouncement(payload) {
  // The backend only ever broadcasts to parents of matching students — there is no staff
  // recipient concept in /notifications/announcements. Selecting "All Staff" here will still
  // reach all active students' parents (same as unfiltered "All Parents"), not actual staff.
  const classes = payload.audience === 'Specific Class' && payload.className ? [payload.className.replace('Class ', '')] : []
  const { data } = await apiPost('/notifications/announcements', {
    title: payload.title,
    message: payload.message,
    audience: { classes },
    channel: 'email',
  })
  return mapAnnouncement(data, null)
}

// ---------------------------------------------------------------------------
// Notification Templates
// ---------------------------------------------------------------------------

// notification_templates has no category column — encode/decode it as a bracket prefix in the
// unused `subject` field (subject is only meaningful for email sends and isn't shown in the UI).
function encodeSubject(category) {
  return `[${category}]`
}
function decodeCategory(subject) {
  const match = /^\[(.+?)\]$/.exec(subject || '')
  return match && TEMPLATE_CATEGORIES.includes(match[1]) ? match[1] : TEMPLATE_CATEGORIES[0]
}

function mapTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    channel: channelFromBackend(row.channel),
    category: decodeCategory(row.subject),
    body: row.body,
    updatedAt: row.updated_at || row.created_at,
  }
}

export async function fetchTemplates() {
  const { data } = await apiGet('/notifications/templates')
  return (data || []).map(mapTemplate).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function createTemplate(payload) {
  const { data } = await apiPost('/notifications/templates', {
    name: payload.name,
    channel: channelToBackend(payload.channel),
    subject: encodeSubject(payload.category),
    body: payload.body,
  })
  return mapTemplate(data)
}

export async function duplicateTemplate(id) {
  const { data } = await apiPost(`/notifications/templates/${id}/duplicate`)
  return mapTemplate(data)
}

export async function updateTemplate(id, payload) {
  const { data } = await apiPatch(`/notifications/templates/${id}`, {
    name: payload.name,
    channel: channelToBackend(payload.channel),
    subject: encodeSubject(payload.category),
    body: payload.body,
  })
  return mapTemplate(data)
}

// ---------------------------------------------------------------------------
// Scheduled Notifications
// ---------------------------------------------------------------------------

// scheduled_notifications has no channel/audience columns — encode them into the free-form
// `target` jsonb field (its documented purpose is describing who/how a schedule targets).
function mapScheduledStatus(status) {
  if (status === 'scheduled') return 'pending'
  if (status === 'failed') return 'cancelled'
  return status
}

function mapScheduled(row) {
  return {
    id: row.id,
    title: row.title,
    channel: channelFromBackend(row.target?.channel || 'email'),
    audience: row.target?.audience || 'All Parents',
    scheduledAt: row.scheduled_at,
    status: mapScheduledStatus(row.status),
  }
}

export async function fetchScheduled() {
  const { data } = await apiGet('/notifications/scheduled')
  return (data || []).map(mapScheduled).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
}

export async function scheduleAnnouncement(payload) {
  const { data } = await apiPost('/notifications/scheduled', {
    title: payload.title,
    message: payload.message || payload.title,
    target: { channel: channelToBackend(payload.channel || 'Email'), audience: payload.audience },
    scheduled_at: payload.scheduledAt,
  })
  return mapScheduled(data)
}

export async function cancelScheduled(id) {
  const { data } = await apiPatch(`/notifications/scheduled/${id}/cancel`)
  return mapScheduled(data)
}

export async function rescheduleNotification(id, scheduledAt) {
  const { data } = await apiPatch(`/notifications/scheduled/${id}`, { scheduled_at: scheduledAt })
  return mapScheduled(data)
}

// ---------------------------------------------------------------------------
// Notification Logs
// ---------------------------------------------------------------------------

const LOG_STATUS_LABEL = { sent: 'Delivered', failed: 'Failed', pending: 'Pending' }

function mapLog(row) {
  return {
    id: row.id,
    recipient: row.recipient || '—',
    channel: channelFromBackend(row.channel),
    // The backend only tracks sent/failed/pending — there's no "Read" receipt concept, so
    // that delivery status will never appear from real data.
    status: LOG_STATUS_LABEL[row.status] || row.status,
    timestamp: row.created_at,
    title: row.subject || '—',
  }
}

export async function fetchLogs(filters = {}) {
  const { channel, status, query } = filters
  const params = new URLSearchParams()
  if (channel) params.set('channel', channelToBackend(channel))
  if (status && status !== 'Read') {
    const backendStatus = Object.entries(LOG_STATUS_LABEL).find(([, label]) => label === status)?.[0]
    if (backendStatus) params.set('status', backendStatus)
  }
  const qs = params.toString()
  const { data } = await apiGet(`/notifications/logs${qs ? `?${qs}` : ''}`)
  let rows = (data || []).map(mapLog)
  if (status === 'Read') rows = [] // no backend record ever maps to "Read"
  if (query) {
    const q = query.toLowerCase()
    rows = rows.filter((row) => [row.recipient, row.title, row.id].join(' ').toLowerCase().includes(q))
  }
  return rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
