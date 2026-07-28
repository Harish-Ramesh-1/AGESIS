import { create } from 'zustand'
import { fetchRevenue, fetchUserDistribution } from '../services/dashboardService'

export const useAnalyticsStore = create((set, get) => ({
  revenueRange: 'month',
  revenueStatus: 'idle',
  revenueError: null,
  revenuePoints: [],

  userDistributionStatus: 'idle',
  userDistributionError: null,
  userDistribution: [],

  fetchRevenue: async (range) => {
    set({ revenueStatus: 'loading', revenueError: null, revenueRange: range })
    try {
      const { points } = await fetchRevenue(range)
      set({ revenueStatus: 'success', revenuePoints: points })
    } catch (error) {
      set({ revenueStatus: 'error', revenueError: error.message })
    }
  },

  fetchUserDistribution: async () => {
    if (get().userDistributionStatus === 'loading' || get().userDistributionStatus === 'success') return
    set({ userDistributionStatus: 'loading', userDistributionError: null })
    try {
      const userDistribution = await fetchUserDistribution()
      set({ userDistributionStatus: 'success', userDistribution })
    } catch (error) {
      set({ userDistributionStatus: 'error', userDistributionError: error.message })
    }
  },
}))
