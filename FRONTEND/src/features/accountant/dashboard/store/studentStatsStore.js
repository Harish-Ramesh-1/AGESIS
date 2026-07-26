import { create } from 'zustand'
import { fetchStudentStats } from '../services/dashboardService'

export const useStudentStatsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  stats: null,

  fetchStudentStats: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const stats = await fetchStudentStats()
      set({ status: 'success', stats })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
