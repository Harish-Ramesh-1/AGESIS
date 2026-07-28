import { create } from 'zustand'
import { addAcademicCalendarEvent, fetchAcademicCalendarEvents } from '../services/schoolManagementService'

export const useAcademicCalendarStore = create((set, get) => ({
  status: 'idle',
  error: null,
  events: [],

  fetchEvents: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const events = await fetchAcademicCalendarEvents()
      set({ status: 'success', events })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addEvent: async (nextEvent) => {
    try {
      const events = await addAcademicCalendarEvent(nextEvent)
      set({ events })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
