import { create } from 'zustand'
import { fetchAnalytics } from '../services/pendingDuesService'

export const usePendingDuesAnalyticsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchAnalytics: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchAnalytics()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
