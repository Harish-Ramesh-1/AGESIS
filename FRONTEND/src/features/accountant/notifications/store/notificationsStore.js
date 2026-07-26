import { create } from 'zustand'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationsService'

export const useAccountantNotificationsStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchNotifications: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchNotifications(filters)
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  markAsRead: async (id) => {
    set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, unread: false } : item)) }))
    try {
      await markNotificationRead(id)
    } catch {
      // best-effort: local state already reflects the read status
    }
  },

  markAllRead: async () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, unread: false })) }))
    try {
      await markAllNotificationsRead()
    } catch {
      // best-effort: local state already reflects the read status
    }
  },
}))
