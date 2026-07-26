import { create } from 'zustand'
import { fetchHistory } from '../services/paymentsService'

export const useHistoryStore = create((set) => ({
  status: 'idle',
  error: null,
  transactions: [],

  fetchHistory: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const transactions = await fetchHistory(filters)
      set({ status: 'success', transactions })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
