import { create } from 'zustand'
import { fetchAuditLogs } from '../services/auditLogsService'

export const useAuditLogsStore = create((set) => ({
  status: 'idle',
  error: null,
  logs: [],

  fetchLogs: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const logs = await fetchAuditLogs(filters)
      set({ status: 'success', logs })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
