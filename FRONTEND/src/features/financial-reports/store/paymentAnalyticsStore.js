import { create } from 'zustand'
import { fetchPaymentAnalytics } from '../services/reportsService'

export const usePaymentAnalyticsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  data: null,

  fetchPaymentAnalytics: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const data = await fetchPaymentAnalytics()
      set({ status: 'success', data })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
