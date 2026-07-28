import { create } from 'zustand'
import { cancelScheduled, fetchScheduled, rescheduleNotification } from '../services/notificationsService'

export const useScheduledStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],
  actionStatus: 'idle',

  fetchScheduled: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchScheduled()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  cancel: async (id) => {
    set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)) }))
    try {
      await cancelScheduled(id)
    } catch {
      // best-effort: local state already reflects the cancellation
    }
  },

  reschedule: async (id, scheduledAt) => {
    set({ actionStatus: 'loading' })
    try {
      const record = await rescheduleNotification(id, scheduledAt)
      set((state) => ({ actionStatus: 'success', items: state.items.map((item) => (item.id === id ? record : item)) }))
      return record
    } catch {
      set({ actionStatus: 'error' })
      return null
    }
  },
}))
