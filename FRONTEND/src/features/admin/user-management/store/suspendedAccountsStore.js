import { create } from 'zustand'
import { fetchSuspendedAccounts, reactivateAccount } from '../services/userManagementService'

export const useSuspendedAccountsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  accounts: [],

  actionStatus: 'idle',
  actionError: null,
  actioningId: null,

  fetchAccounts: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const accounts = await fetchSuspendedAccounts()
      set({ status: 'success', accounts })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  reactivate: async (id) => {
    set({ actionStatus: 'loading', actionError: null, actioningId: id })
    try {
      const accounts = await reactivateAccount(id)
      set({ actionStatus: 'success', accounts, actioningId: null })
    } catch (error) {
      set({ actionStatus: 'error', actionError: error.message, actioningId: null })
    }
  },
}))
