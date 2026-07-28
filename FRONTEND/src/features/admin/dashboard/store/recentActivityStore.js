import { create } from 'zustand'
import { fetchRecentActivity } from '../services/dashboardService'

export const useRecentActivityStore = create((set, get) => ({
  status: 'idle',
  error: null,
  activity: [],

  fetchRecentActivity: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const activity = await fetchRecentActivity()
      set({ status: 'success', activity })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
