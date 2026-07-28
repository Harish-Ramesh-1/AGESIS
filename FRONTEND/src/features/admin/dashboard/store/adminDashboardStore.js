import { create } from 'zustand'
import { fetchPerformance, fetchSummary } from '../services/dashboardService'

export const useAdminDashboardStore = create((set, get) => ({
  summaryStatus: 'idle',
  summaryError: null,
  hero: null,
  kpis: null,

  performanceStatus: 'idle',
  performanceError: null,
  performance: null,
  upcomingTasks: [],
  systemStatus: [],

  fetchSummary: async () => {
    if (get().summaryStatus === 'loading' || get().summaryStatus === 'success') return
    set({ summaryStatus: 'loading', summaryError: null })
    try {
      const { hero, kpis } = await fetchSummary()
      set({ summaryStatus: 'success', hero, kpis })
    } catch (error) {
      set({ summaryStatus: 'error', summaryError: error.message })
    }
  },

  fetchPerformance: async () => {
    if (get().performanceStatus === 'loading' || get().performanceStatus === 'success') return
    set({ performanceStatus: 'loading', performanceError: null })
    try {
      const { upcomingTasks, systemStatus, ...performance } = await fetchPerformance()
      set({ performanceStatus: 'success', performance, upcomingTasks, systemStatus })
    } catch (error) {
      set({ performanceStatus: 'error', performanceError: error.message })
    }
  },
}))
