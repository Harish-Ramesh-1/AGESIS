import { create } from 'zustand'
import { approveUser, fetchPendingApprovals, rejectUser } from '../services/userManagementService'

export const usePendingApprovalsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  approvals: [],
  approvedToday: 0,

  actionStatus: 'idle',
  actionError: null,
  actioningId: null,

  fetchApprovals: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const { approvals, approvedToday } = await fetchPendingApprovals()
      set({ status: 'success', approvals, approvedToday })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  approve: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const { approvals, approvedToday } = await approveUser(id)
      set({ actionStatus: 'success', approvals, approvedToday, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },

  reject: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const { approvals, approvedToday } = await rejectUser(id)
      set({ actionStatus: 'success', approvals, approvedToday, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },
}))
