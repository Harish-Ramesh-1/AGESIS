import { create } from 'zustand'
import {
  changePassword,
  fetchSecurity,
  signOutOtherSessions,
  signOutSession,
  toggleTwoFactor,
} from '../services/accountantSettingsService'

export const useAccountantSecurityStore = create((set, get) => ({
  status: 'idle',
  error: null,
  twoFactorEnabled: false,
  sessions: [],
  loginHistory: [],

  passwordStatus: 'idle',
  passwordError: null,

  twoFactorStatus: 'idle',

  sessionActionStatus: 'idle',
  sessionActionError: null,

  fetchSecurity: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { twoFactorEnabled, sessions, loginHistory } = await fetchSecurity()
      set({ status: 'success', twoFactorEnabled, sessions, loginHistory })
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

  toggleTwoFactor: async (enabled) => {
    set({ twoFactorStatus: 'loading' })
    try {
      const { twoFactorEnabled } = await toggleTwoFactor(enabled)
      set({ twoFactorStatus: 'success', twoFactorEnabled })
    } catch (error) {
      set({ twoFactorStatus: 'error', error: error.message })
    }
  },

  signOutSession: async (sessionId) => {
    set({ sessionActionStatus: 'loading', sessionActionError: null })
    try {
      const sessions = await signOutSession(sessionId)
      set({ sessionActionStatus: 'success', sessions })
    } catch (error) {
      set({ sessionActionStatus: 'error', sessionActionError: error.message })
    }
  },

  signOutOtherSessions: async () => {
    set({ sessionActionStatus: 'loading', sessionActionError: null })
    try {
      const sessions = await signOutOtherSessions()
      set({ sessionActionStatus: 'success', sessions })
    } catch (error) {
      set({ sessionActionStatus: 'error', sessionActionError: error.message })
    }
  },
}))
