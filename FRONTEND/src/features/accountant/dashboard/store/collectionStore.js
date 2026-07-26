import { create } from 'zustand'
import { fetchOverdueAccounts, fetchPendingDues } from '../services/dashboardService'

export const useCollectionStore = create((set, get) => ({
  pendingDuesStatus: 'idle',
  pendingDuesError: null,
  pendingDues: [],

  overdueStatus: 'idle',
  overdueError: null,
  overdueAccounts: [],

  fetchPendingDues: async () => {
    if (get().pendingDuesStatus === 'loading' || get().pendingDuesStatus === 'success') return
    set({ pendingDuesStatus: 'loading', pendingDuesError: null })
    try {
      const pendingDues = await fetchPendingDues()
      set({ pendingDuesStatus: 'success', pendingDues })
    } catch (error) {
      set({ pendingDuesStatus: 'error', pendingDuesError: error.message })
    }
  },

  fetchOverdueAccounts: async () => {
    if (get().overdueStatus === 'loading' || get().overdueStatus === 'success') return
    set({ overdueStatus: 'loading', overdueError: null })
    try {
      const overdueAccounts = await fetchOverdueAccounts()
      set({ overdueStatus: 'success', overdueAccounts })
    } catch (error) {
      set({ overdueStatus: 'error', overdueError: error.message })
    }
  },
}))
