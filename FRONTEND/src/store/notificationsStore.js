import { create } from 'zustand'
import { apiGet, apiPatch } from '../services/apiClient'

function mapNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    timestamp: notification.created_at,
    unread: !notification.read,
  }
}

export const useNotificationsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchNotifications: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const { data } = await apiGet('/notifications')
      set({ status: 'success', items: (data || []).map(mapNotification) })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  markAllRead: async () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, unread: false })) }))
    try {
      await apiPatch('/notifications/read-all')
    } catch {
      // best-effort: local state already reflects the read status
    }
  },
}))
