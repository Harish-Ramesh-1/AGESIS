import { create } from 'zustand'
import { applyLateFee, approveWaiver, fetchLateFeeHistory, waiveLateFee } from '../services/pendingDuesService'
import { usePendingDueStore } from './pendingDueStore'

// Applying/waiving a penalty mutates the same record objects the pendingDueStore
// already holds in its `overdueList` array, so that array reference never changes.
// Re-fetching here forces a fresh array reference and a re-render of anything reading it.
function refreshOverdueList() {
  return usePendingDueStore.getState().fetchOverdue({})
}

export const usePenaltyStore = create((set, get) => ({
  historyStatus: 'idle',
  historyError: null,
  history: [],
  actioningId: null,

  fetchHistory: async () => {
    if (get().historyStatus === 'loading') return
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchLateFeeHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  applyPenalty: async (dueId, payload) => {
    set({ actioningId: dueId })
    const record = await applyLateFee(dueId, payload)
    set({ actioningId: null })
    await Promise.all([get().fetchHistory(), refreshOverdueList()])
    return record
  },

  waivePenalty: async (dueId, payload) => {
    set({ actioningId: dueId })
    const record = await waiveLateFee(dueId, payload)
    set({ actioningId: null })
    await Promise.all([get().fetchHistory(), refreshOverdueList()])
    return record
  },

  approveWaiver: async (dueId) => {
    set({ actioningId: dueId })
    const record = await approveWaiver(dueId)
    set({ actioningId: null })
    await refreshOverdueList()
    return record
  },
}))
