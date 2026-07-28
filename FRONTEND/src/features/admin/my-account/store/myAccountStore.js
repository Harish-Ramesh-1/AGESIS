import { create } from 'zustand'
import { changePassword, fetchProfile } from '../services/myAccountService'

export const useMyAccountStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,

  passwordStatus: 'idle',
  passwordError: null,

  fetchProfile: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const profile = await fetchProfile()
      set({ status: 'success', profile })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  changePassword: async (payload) => {
    set({ passwordStatus: 'loading', passwordError: null })
    try {
      await changePassword(payload)
      set({ passwordStatus: 'success' })
      return true
    } catch (error) {
      set({ passwordStatus: 'error', passwordError: error.message })
      return false
    }
  },

  resetPasswordStatus: () => set({ passwordStatus: 'idle', passwordError: null }),
}))
