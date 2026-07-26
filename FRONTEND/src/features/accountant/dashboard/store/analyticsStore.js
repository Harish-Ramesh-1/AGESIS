import { create } from 'zustand'
import { fetchPaymentMethods, fetchRevenue } from '../services/dashboardService'

export const useAnalyticsStore = create((set, get) => ({
  revenueStatus: 'idle',
  revenueError: null,
  revenueRange: 'month',
  revenuePoints: [],

  paymentMethodsStatus: 'idle',
  paymentMethodsError: null,
  paymentMethods: [],

  fetchRevenue: async (range) => {
    set({ revenueStatus: 'loading', revenueError: null, revenueRange: range })
    try {
      const { points } = await fetchRevenue(range)
      if (get().revenueRange !== range) return
      set({ revenueStatus: 'success', revenuePoints: points })
    } catch (error) {
      if (get().revenueRange !== range) return
      set({ revenueStatus: 'error', revenueError: error.message })
    }
  },

  fetchPaymentMethods: async () => {
    if (get().paymentMethodsStatus === 'loading' || get().paymentMethodsStatus === 'success') return
    set({ paymentMethodsStatus: 'loading', paymentMethodsError: null })
    try {
      const paymentMethods = await fetchPaymentMethods()
      set({ paymentMethodsStatus: 'success', paymentMethods })
    } catch (error) {
      set({ paymentMethodsStatus: 'error', paymentMethodsError: error.message })
    }
  },
}))
