import { create } from 'zustand'
import { fetchInvites, inviteUser, resendInvite } from '../services/userManagementService'

export const useInviteUserStore = create((set, get) => ({
  status: 'idle',
  error: null,
  invites: [],

  sendStatus: 'idle',
  sendError: null,

  resendStatus: 'idle',
  resendError: null,
  resendingId: null,

  fetchInvites: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const invites = await fetchInvites()
      set({ status: 'success', invites })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  sendInvite: async (payload) => {
    set({ sendStatus: 'loading', sendError: null })
    try {
      const invites = await inviteUser(payload)
      set({ sendStatus: 'success', invites })
      return true
    } catch (error) {
      set({ sendStatus: 'error', sendError: error.message })
      return false
    }
  },

  resetSendStatus: () => set({ sendStatus: 'idle', sendError: null }),

  resendInvite: async (id) => {
    set({ resendStatus: 'loading', resendError: null, resendingId: id })
    try {
      const invites = await resendInvite(id)
      set({ resendStatus: 'success', invites, resendingId: null })
    } catch (error) {
      set({ resendStatus: 'error', resendError: error.message, resendingId: null })
    }
  },
}))
