import { create } from 'zustand'
import { fetchPendingApprovals } from '../services/dashboardService'

export const usePendingApprovalsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  approvals: [],

  fetchPendingApprovals: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const approvals = await fetchPendingApprovals()
      set({ status: 'success', approvals })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
