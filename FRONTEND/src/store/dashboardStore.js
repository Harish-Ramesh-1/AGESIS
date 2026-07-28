import { create } from 'zustand'
import { apiGet } from '../services/apiClient'

function monthKey(dateStr) {
  const date = new Date(dateStr)
  return date.getFullYear() * 12 + date.getMonth()
}

function computeStreaks(dates) {
  const keys = [...new Set(dates.map(monthKey))].sort((a, b) => a - b)
  if (keys.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < keys.length; i++) {
    run = keys[i] === keys[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  let current = 1
  for (let i = keys.length - 1; i > 0; i--) {
    if (keys[i] === keys[i - 1] + 1) current += 1
    else break
  }

  return { current, longest }
}

function badgeIcon(label = '') {
  const lower = label.toLowerCase()
  if (lower.includes('streak')) return 'Flame'
  if (lower.includes('early') || lower.includes('bird')) return 'Zap'
  return 'Award'
}

// The backend has no dedicated "announcements for parent" endpoint, so this maps
// recent notifications (GET /notifications) into the announcement shape instead.
function mapNotificationToAnnouncement(notification) {
  const category = notification.type === 'payment' ? 'fee' : undefined
  return {
    id: notification.id,
    title: notification.title,
    description: notification.message,
    date: notification.created_at?.slice(0, 10),
    category,
  }
}

export const useDashboardStore = create((set, get) => ({
  status: 'idle',
  error: null,
  rewards: null,
  documents: null,
  announcements: [],

  fetchDashboardExtras: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const [{ data: rewards }, { data: archive }, { data: notifications }] = await Promise.all([
        apiGet('/rewards'),
        apiGet('/documents/archive'),
        apiGet('/notifications'),
      ])

      const entries = rewards?.entries || []
      const { current, longest } = computeStreaks(entries.map((entry) => entry.created_at))
      const badgeLabels = [...new Set(entries.map((entry) => entry.badge).filter(Boolean))]

      const latestInvoice = (archive || []).find((doc) => doc.type === 'invoice')
      const latestReceipt = (archive || []).find((doc) => doc.type === 'receipt')

      set({
        status: 'success',
        rewards: {
          currentStreak: current,
          longestStreak: longest,
          points: Number(rewards?.totalPoints || 0),
          badges: badgeLabels.map((label, index) => ({
            id: `badge-${index}`,
            label,
            icon: badgeIcon(label),
          })),
        },
        documents: {
          latestInvoice: latestInvoice
            ? { id: latestInvoice.number, date: latestInvoice.createdAt?.slice(0, 10), label: `Invoice - ${latestInvoice.number}` }
            : null,
          latestReceipt: latestReceipt
            ? { id: latestReceipt.number, date: latestReceipt.createdAt?.slice(0, 10), label: `Receipt - ${latestReceipt.number}` }
            : null,
        },
        announcements: (notifications || []).slice(0, 10).map(mapNotificationToAnnouncement),
      })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
