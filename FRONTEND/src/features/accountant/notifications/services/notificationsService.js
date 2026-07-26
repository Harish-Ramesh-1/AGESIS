const DELAY_MS = 600

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const NOW = Date.now()

function hoursAgo(hours) {
  return new Date(NOW - hours * 60 * 60 * 1000).toISOString()
}

function daysAgo(days) {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString()
}

export const NOTIFICATION_CATEGORIES = [
  'payment-received',
  'refund-requested',
  'overdue-alert',
  'document-generated',
  'system-announcement',
]

const NOTIFICATIONS = [
  { id: 'ntf-1', category: 'payment-received', title: 'Payment received from Aarav Nair', description: 'Rs. 45,000 received via UPI against tuition fee for Class 8-B.', timestamp: hoursAgo(0.5), unread: true, actionRequired: false },
  { id: 'ntf-2', category: 'overdue-alert', title: 'Fee overdue: Kabir Menon', description: 'Installment 1 of Rs. 31,000 is 14 days overdue for Class 10-C.', timestamp: hoursAgo(1), unread: true, actionRequired: true },
  { id: 'ntf-3', category: 'refund-requested', title: 'Refund requested by Meera Pillai', description: 'Parent requested a refund of Rs. 15,000 for the optional Sports Academy fee.', timestamp: hoursAgo(2), unread: true, actionRequired: true },
  { id: 'ntf-4', category: 'document-generated', title: 'Receipt generated: RCT-8801', description: 'Payment receipt for Aarav Nair was generated and emailed to the parent.', timestamp: hoursAgo(3), unread: false, actionRequired: false },
  { id: 'ntf-5', category: 'system-announcement', title: 'Scheduled maintenance tonight', description: 'The payment gateway will be briefly unavailable between 11:30 PM and 12:00 AM.', timestamp: hoursAgo(4), unread: true, actionRequired: false },
  { id: 'ntf-6', category: 'payment-received', title: 'Payment received from Meera Pillai', description: 'Rs. 62,000 received via Credit Card against tuition fee for Class 11-B.', timestamp: hoursAgo(6), unread: false, actionRequired: false },
  { id: 'ntf-7', category: 'overdue-alert', title: 'Fee overdue: Diya Kulkarni', description: 'Full balance of Rs. 38,500 is 9 days overdue for Class 6-A.', timestamp: hoursAgo(9), unread: false, actionRequired: true },
  { id: 'ntf-8', category: 'document-generated', title: 'Bulk invoices generated', description: '128 invoices for the second term were generated and queued for dispatch.', timestamp: hoursAgo(14), unread: false, actionRequired: false },
  { id: 'ntf-9', category: 'refund-requested', title: 'Refund requested by Vihaan Pillai', description: 'Parent requested a refund of Rs. 8,000 citing overpayment against tuition fee.', timestamp: daysAgo(1), unread: false, actionRequired: true },
  { id: 'ntf-10', category: 'payment-received', title: 'Payment received from Ishita Rao', description: 'Rs. 29,500 received via Debit Card against tuition fee for Class 7-A.', timestamp: daysAgo(1.3), unread: false, actionRequired: false },
  { id: 'ntf-11', category: 'system-announcement', title: 'New academic year fee structure published', description: 'The 2026-2027 fee structure has been published and is ready for assignment.', timestamp: daysAgo(2), unread: false, actionRequired: false },
  { id: 'ntf-12', category: 'overdue-alert', title: 'Fee overdue: Yash Kapoor', description: 'Installment 1 of Rs. 34,000 is 21 days overdue for Class 9-A.', timestamp: daysAgo(2.5), unread: false, actionRequired: true },
  { id: 'ntf-13', category: 'document-generated', title: 'Receipt generated: RCT-8795', description: 'Refund adjustment receipt for Kabir Menon was generated.', timestamp: daysAgo(3), unread: false, actionRequired: false },
  { id: 'ntf-14', category: 'payment-received', title: 'Payment received from Sanya Kapoor', description: 'Rs. 25,500 received via Cash against tuition fee for Class 9-A.', timestamp: daysAgo(4), unread: false, actionRequired: false },
  { id: 'ntf-15', category: 'system-announcement', title: 'Portal update: faster receipt downloads', description: 'Receipt PDFs now generate in under two seconds across the portal.', timestamp: daysAgo(6), unread: false, actionRequired: false },
]

export async function fetchNotifications(filters = {}) {
  await delay()
  const { category, readState, query } = filters
  return NOTIFICATIONS.filter((item) => {
    if (category && item.category !== category) return false
    if (readState === 'unread' && !item.unread) return false
    if (readState === 'read' && item.unread) return false
    if (query) {
      const q = query.toLowerCase()
      if (![item.title, item.description].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function markNotificationRead(id) {
  await delay(200)
  const record = NOTIFICATIONS.find((item) => item.id === id)
  if (!record) throw new Error('Notification not found')
  record.unread = false
  return record
}

export async function markAllNotificationsRead() {
  await delay(300)
  NOTIFICATIONS.forEach((item) => {
    item.unread = false
  })
  return NOTIFICATIONS
}
