import { create } from 'zustand'
import { fetchAllUsers, suspendUser } from '../services/userManagementService'

export const useAllUsersStore = create((set) => ({
  status: 'idle',
  error: null,
  users: [],
  summary: null,

  actionStatus: 'idle',
  actionError: null,

  fetchUsers: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const { users, summary } = await fetchAllUsers(filters)
      set({ status: 'success', users, summary })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  toggleSuspend: async (id, filters) => {
    set({ actionStatus: 'loading', actionError: null })
    try {
      await suspendUser(id)
      const { users, summary } = await fetchAllUsers(filters)
      set({ actionStatus: 'success', users, summary })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message })
    }
  },
}))
