import { create } from 'zustand'
import { fetchNotifications } from '../services/dashboardService'

export const useDashboardNotificationStore = create((set, get) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchNotifications: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const items = await fetchNotifications()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  markAllRead: () => set((state) => ({ items: state.items.map((item) => ({ ...item, unread: false })) })),
}))
