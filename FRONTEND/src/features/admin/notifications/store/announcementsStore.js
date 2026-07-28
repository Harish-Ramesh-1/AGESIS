import { create } from 'zustand'
import { fetchAnnouncements, scheduleAnnouncement, sendAnnouncement } from '../services/notificationsService'

export const useAnnouncementsStore = create((set) => ({
  status: 'idle',
  error: null,
  items: [],
  sendStatus: 'idle',
  sendError: null,

  fetchAnnouncements: async () => {
    set({ status: 'loading', error: null })
    try {
      const items = await fetchAnnouncements()
      set({ status: 'success', items })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  sendNow: async (payload) => {
    set({ sendStatus: 'loading', sendError: null })
    try {
      const record = await sendAnnouncement(payload)
      set((state) => ({ sendStatus: 'success', items: [record, ...state.items] }))
      return record
    } catch (error) {
      set({ sendStatus: 'error', sendError: error.message })
      return null
    }
  },

  schedule: async (payload) => {
    set({ sendStatus: 'loading', sendError: null })
    try {
      const record = await scheduleAnnouncement(payload)
      set({ sendStatus: 'success' })
      return record
    } catch (error) {
      set({ sendStatus: 'error', sendError: error.message })
      return null
    }
  },

  resetSendStatus: () => set({ sendStatus: 'idle', sendError: null }),
}))
