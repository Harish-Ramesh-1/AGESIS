import { create } from 'zustand'
import { fetchRoles } from '../services/rolesPermissionsService'

export const useRolesListStore = create((set, get) => ({
  status: 'idle',
  error: null,
  roles: [],

  fetchRoles: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const roles = await fetchRoles()
      set({ status: 'success', roles })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
