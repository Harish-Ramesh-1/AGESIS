import { create } from 'zustand'
import { fetchReconciliation } from '../services/paymentsService'

export const useReconciliationStore = create((set, get) => ({
  status: 'idle',
  error: null,
  summary: null,
  rows: [],

  fetchReconciliation: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const { summary, rows } = await fetchReconciliation()
      set({ status: 'success', summary, rows })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
