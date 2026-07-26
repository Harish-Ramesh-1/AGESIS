import { create } from 'zustand'
import { createTicket, fetchFaqs, fetchTickets } from '../services/supportService'

export const useSupportStore = create((set, get) => ({
  status: 'idle',
  error: null,
  faqs: [],
  tickets: [],
  submitStatus: 'idle',
  submitError: null,

  fetchAll: async (query) => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const [faqs, tickets] = await Promise.all([fetchFaqs(query), fetchTickets()])
      set({ status: 'success', faqs, tickets })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  searchFaqs: async (query) => {
    try {
      const faqs = await fetchFaqs(query)
      set({ faqs })
    } catch (error) {
      set({ error: error.message })
    }
  },

  submitTicket: async (payload) => {
    set({ submitStatus: 'loading', submitError: null })
    try {
      const ticket = await createTicket(payload)
      set((state) => ({ submitStatus: 'success', tickets: [ticket, ...state.tickets] }))
      return ticket
    } catch (error) {
      set({ submitStatus: 'error', submitError: error.message })
      return null
    }
  },

  resetSubmitStatus: () => set({ submitStatus: 'idle', submitError: null }),
}))
