import { create } from 'zustand'
import { fetchAnalytics } from '../services/analyticsService'

export const useAnalyticsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  monthlyTrend: [],
  methodDistribution: [],
  annualSummary: null,

  fetchAnalytics: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const { monthlyTrend, methodDistribution, annualSummary } = await fetchAnalytics()
      set({ status: 'success', monthlyTrend, methodDistribution, annualSummary })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
