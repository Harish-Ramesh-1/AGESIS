import { create } from 'zustand'
import { fetchReminderHistory, retryReminder, sendBulkReminders, sendReminder } from '../services/pendingDuesService'

export const useReminderStore = create((set, get) => ({
  historyStatus: 'idle',
  historyError: null,
  history: [],
  isSending: false,
  lastBulkResult: null,

  fetchHistory: async () => {
    if (get().historyStatus === 'loading' || get().historyStatus === 'success') return
    set({ historyStatus: 'loading', historyError: null })
    try {
      const history = await fetchReminderHistory()
      set({ historyStatus: 'success', history })
    } catch (error) {
      set({ historyStatus: 'error', historyError: error.message })
    }
  },

  sendReminder: async (dueId, payload) => {
    set({ isSending: true })
    const entry = await sendReminder(dueId, payload)
    set((state) => ({ isSending: false, history: [entry, ...state.history] }))
    return entry
  },

  sendBulk: async (payload) => {
    set({ isSending: true, lastBulkResult: null })
    const entries = await sendBulkReminders(payload)
    set((state) => ({ isSending: false, history: [...entries, ...state.history], lastBulkResult: entries }))
    return entries
  },

  retry: async (id) => {
    const entry = await retryReminder(id)
    set((state) => ({ history: state.history.map((item) => (item.id === id ? entry : item)) }))
  },
}))
