import { create } from 'zustand'
import { fetchMonthlyRevenue } from '../services/reportsService'

export const useRevenueStore = create((set) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchMonthlyRevenue: async () => {
    set({ status: 'loading', error: null })
    try {
      const data = await fetchMonthlyRevenue()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
