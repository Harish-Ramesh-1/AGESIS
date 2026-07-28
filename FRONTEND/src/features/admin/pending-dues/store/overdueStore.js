import { create } from 'zustand'
import { escalateAccount, fetchOverdue } from '../services/pendingDuesService'

export const useOverdueStore = create((set) => ({
  status: 'idle',
  error: null,
  overdueList: [],
  escalatingId: null,

  fetchOverdue: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const overdueList = await fetchOverdue(filters)
      set({ status: 'success', overdueList })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  escalate: async (id) => {
    set({ escalatingId: id })
    try {
      const record = await escalateAccount(id)
      set((state) => ({ overdueList: state.overdueList.map((item) => (item.id === id ? record : item)), escalatingId: null }))
    } catch (error) {
      set({ escalatingId: null, error: error.message })
    }
  },
}))
