import { create } from 'zustand'
import { fetchPolicies, updatePolicies } from '../services/securityCenterService'

export const useSecurityPoliciesStore = create((set, get) => ({
  status: 'idle',
  error: null,
  policies: null,

  saveStatus: 'idle',
  saveError: null,

  fetchPolicies: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const policies = await fetchPolicies()
      set({ status: 'success', policies })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  savePolicies: async (patch) => {
    set({ saveStatus: 'loading', saveError: null })
    try {
      const policies = await updatePolicies(patch)
      set({ saveStatus: 'success', policies })
      return true
    } catch (error) {
      set({ saveStatus: 'error', saveError: error.message })
      return false
    }
  },

  resetSaveStatus: () => set({ saveStatus: 'idle', saveError: null }),
}))
