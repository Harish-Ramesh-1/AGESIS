import { create } from 'zustand'
import { fetchRecentTransactions } from '../services/dashboardService'

export const usePaymentStore = create((set, get) => ({
  status: 'idle',
  error: null,
  transactions: [],

  fetchRecentTransactions: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const transactions = await fetchRecentTransactions()
      set({ status: 'success', transactions })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
