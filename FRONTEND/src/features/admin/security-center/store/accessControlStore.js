import { create } from 'zustand'
import { addAllowedIp, fetchAccessControl, removeAllowedIp, updateDeviceTrust } from '../services/securityCenterService'

export const useAccessControlStore = create((set, get) => ({
  status: 'idle',
  error: null,
  allowlist: [],
  deviceTrust: null,

  addStatus: 'idle',
  addError: null,

  removeStatus: 'idle',
  removingId: null,

  toggleStatus: 'idle',

  fetchAccessControl: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { allowlist, deviceTrust } = await fetchAccessControl()
      set({ status: 'success', allowlist, deviceTrust })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addIp: async (payload) => {
    set({ addStatus: 'loading', addError: null })
    try {
      const allowlist = await addAllowedIp(payload)
      set({ addStatus: 'success', allowlist })
      return true
    } catch (error) {
      set({ addStatus: 'error', addError: error.message })
      return false
    }
  },

  resetAddStatus: () => set({ addStatus: 'idle', addError: null }),

  removeIp: async (id) => {
    set({ removeStatus: 'loading', removingId: id })
    try {
      const allowlist = await removeAllowedIp(id)
      set({ removeStatus: 'success', allowlist, removingId: null })
    } catch {
      set({ removeStatus: 'error', removingId: null })
    }
  },

  toggleDeviceTrust: async (enabled) => {
    set({ toggleStatus: 'loading' })
    try {
      const deviceTrust = await updateDeviceTrust({ requireDeviceVerification: enabled })
      set({ toggleStatus: 'success', deviceTrust })
    } catch {
      set({ toggleStatus: 'error' })
    }
  },
}))
