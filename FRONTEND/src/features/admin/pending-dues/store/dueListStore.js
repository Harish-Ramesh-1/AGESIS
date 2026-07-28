import { create } from 'zustand'
import { fetchDueList } from '../services/pendingDuesService'

export const useDueListStore = create((set) => ({
  status: 'idle',
  error: null,
  dueList: [],

  fetchDueList: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const dueList = await fetchDueList(filters)
      set({ status: 'success', dueList })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
