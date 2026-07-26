import { create } from 'zustand'
import { fetchDailyCollection } from '../services/reportsService'

export const useReportsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchDailyCollection: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchDailyCollection()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
