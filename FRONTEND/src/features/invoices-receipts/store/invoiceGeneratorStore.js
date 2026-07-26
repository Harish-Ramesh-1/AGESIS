import { create } from 'zustand'
import { fetchInvoices, fetchStudentsForDocument, generateInvoice } from '../services/documentsService'

export const useInvoiceGeneratorStore = create((set) => ({
  searchStatus: 'idle',
  searchResults: [],

  selectedStudent: null,

  listStatus: 'idle',
  invoices: [],

  isSubmitting: false,
  submitError: null,
  lastInvoice: null,

  searchStudents: async (query) => {
    if (!query) {
      set({ searchResults: [], searchStatus: 'idle' })
      return
    }
    set({ searchStatus: 'loading' })
    const results = await fetchStudentsForDocument(query)
    set({ searchStatus: 'success', searchResults: results })
  },

  selectStudent: (student) => set({ selectedStudent: student, searchResults: [], lastInvoice: null }),
  clearStudent: () => set({ selectedStudent: null, lastInvoice: null }),

  fetchInvoices: async (filters) => {
    set({ listStatus: 'loading' })
    const invoices = await fetchInvoices(filters)
    set({ listStatus: 'success', invoices })
  },

  submitInvoice: async (payload) => {
    set({ isSubmitting: true, submitError: null })
    try {
      const invoice = await generateInvoice(payload)
      set((state) => ({ isSubmitting: false, lastInvoice: invoice, invoices: [invoice, ...state.invoices] }))
      return invoice
    } catch (error) {
      set({ isSubmitting: false, submitError: error.message })
      return null
    }
  },

  reset: () => set({ selectedStudent: null, lastInvoice: null, searchResults: [], searchStatus: 'idle' }),
}))
