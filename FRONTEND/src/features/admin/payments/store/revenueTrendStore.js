import { create } from 'zustand'
import { fetchRevenueTrend } from '../services/paymentsService'

export const useRevenueTrendStore = create((set) => ({
  range: 'month',
  status: 'idle',
  error: null,
  points: [],

  fetchRevenue: async (range) => {
    set({ status: 'loading', range, error: null })
    try {
      const { points } = await fetchRevenueTrend(range)
      set({ status: 'success', points })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
