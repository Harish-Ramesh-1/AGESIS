import { create } from 'zustand'
import { fetchLogs } from '../services/notificationsService'

export const useLogsStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],

  fetchLogs: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchLogs(filters)
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
