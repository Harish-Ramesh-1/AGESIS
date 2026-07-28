import { create } from 'zustand'
import { assignRole, fetchRoleChanges, searchAssignableUsers } from '../services/rolesPermissionsService'

export const useRoleAssignmentStore = create((set, get) => ({
  status: 'idle',
  error: null,
  changes: [],

  searchStatus: 'idle',
  searchResults: [],

  assignStatus: 'idle',
  assignError: null,

  fetchChanges: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const changes = await fetchRoleChanges()
      set({ status: 'success', changes })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  searchUsers: async (query) => {
    set({ searchStatus: 'loading' })
    try {
      const searchResults = await searchAssignableUsers(query)
      set({ searchStatus: 'success', searchResults })
    } catch {
      set({ searchStatus: 'error', searchResults: [] })
    }
  },

  clearSearch: () => set({ searchResults: [], searchStatus: 'idle' }),

  assign: async (payload) => {
    set({ assignStatus: 'loading', assignError: null })
    try {
      const changes = await assignRole(payload)
      set({ assignStatus: 'success', changes })
      return true
    } catch (error) {
      set({ assignStatus: 'error', assignError: error.message })
      return false
    }
  },

  resetAssignStatus: () => set({ assignStatus: 'idle', assignError: null }),
}))
