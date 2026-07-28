import { create } from 'zustand'
import { fetchOverviewSummary, fetchRecentTransactions } from '../services/paymentsService'

export const useOverviewStore = create((set, get) => ({
  summaryStatus: 'idle',
  summaryError: null,
  summary: null,

  transactionsStatus: 'idle',
  transactionsError: null,
  transactions: [],

  fetchSummary: async () => {
    if (get().summaryStatus === 'loading' || get().summaryStatus === 'success') return
    set({ summaryStatus: 'loading', summaryError: null })
    try {
      const summary = await fetchOverviewSummary()
      set({ summaryStatus: 'success', summary })
    } catch (error) {
      set({ summaryStatus: 'error', summaryError: error.message })
    }
  },

  fetchTransactions: async () => {
    if (get().transactionsStatus === 'loading' || get().transactionsStatus === 'success') return
    set({ transactionsStatus: 'loading', transactionsError: null })
    try {
      const transactions = await fetchRecentTransactions()
      set({ transactionsStatus: 'success', transactions })
    } catch (error) {
      set({ transactionsStatus: 'error', transactionsError: error.message })
    }
  },
}))
