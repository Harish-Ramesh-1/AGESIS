import { create } from 'zustand'
import { fetchPermissionMatrix } from '../services/rolesPermissionsService'

export const usePermissionMatrixStore = create((set, get) => ({
  status: 'idle',
  error: null,
  matrix: null,

  fetchMatrix: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const matrix = await fetchPermissionMatrix()
      set({ status: 'success', matrix })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
