import { create } from 'zustand'
import { fetchNotificationCenterData } from '../services/notificationCenterService'

export const useNotificationCenterStore = create((set, get) => ({
  status: 'idle',
  error: null,
  notifications: [],
  preferences: null,

  fetchNotifications: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const { notifications, preferences } = await fetchNotificationCenterData()
      set({ status: 'success', notifications, preferences })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    })),

  markAllRead: () =>
    set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, unread: false })) })),

  togglePin: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    })),

  toggleArchive: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, archived: !item.archived, pinned: false } : item,
      ),
    })),

  deleteNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) })),

  archiveMany: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        ids.includes(item.id) ? { ...item, archived: true, pinned: false } : item,
      ),
    })),

  deleteMany: (ids) =>
    set((state) => ({ notifications: state.notifications.filter((item) => !ids.includes(item.id)) })),

  togglePreference: (key) =>
    set((state) => ({ preferences: { ...state.preferences, [key]: !state.preferences[key] } })),
}))
