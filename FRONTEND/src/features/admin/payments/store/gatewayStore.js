import { create } from 'zustand'
import { fetchGatewayTransactions } from '../services/paymentsService'

export const useGatewayStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchTransactions: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchGatewayTransactions(filters)
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
