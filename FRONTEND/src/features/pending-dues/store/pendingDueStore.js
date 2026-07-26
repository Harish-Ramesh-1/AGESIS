import { create } from 'zustand'
import { fetchDueList, fetchOverdue } from '../services/pendingDuesService'

export const usePendingDueStore = create((set) => ({
  dueListStatus: 'idle',
  dueListError: null,
  dueList: [],

  overdueStatus: 'idle',
  overdueError: null,
  overdueList: [],

  fetchDueList: async (filters) => {
    set({ dueListStatus: 'loading', dueListError: null })
    try {
      const dueList = await fetchDueList(filters)
      set({ dueListStatus: 'success', dueList })
    } catch (error) {
      set({ dueListStatus: 'error', dueListError: error.message })
    }
  },

  fetchOverdue: async (filters) => {
    set({ overdueStatus: 'loading', overdueError: null })
    try {
      const overdueList = await fetchOverdue(filters)
      set({ overdueStatus: 'success', overdueList })
    } catch (error) {
      set({ overdueStatus: 'error', overdueError: error.message })
    }
  },
}))
