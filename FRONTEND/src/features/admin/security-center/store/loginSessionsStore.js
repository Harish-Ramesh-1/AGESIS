import { create } from 'zustand'
import { fetchSessions, revokeSession } from '../services/securityCenterService'

export const useLoginSessionsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  sessions: [],

  actionStatus: 'idle',
  actionError: null,
  actioningId: null,

  fetchSessions: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const sessions = await fetchSessions()
      set({ status: 'success', sessions })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  revoke: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const sessions = await revokeSession(id)
      set({ actionStatus: 'success', sessions, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },
}))
