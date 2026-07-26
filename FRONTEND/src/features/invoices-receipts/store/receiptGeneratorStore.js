import { create } from 'zustand'
import { fetchReceipts, fetchStudentsForDocument, generateReceipt } from '../services/documentsService'

export const useReceiptGeneratorStore = create((set) => ({
  searchStatus: 'idle',
  searchResults: [],

  selectedStudent: null,

  listStatus: 'idle',
  receipts: [],

  isSubmitting: false,
  submitError: null,
  lastReceipt: null,

  searchStudents: async (query) => {
    if (!query) {
      set({ searchResults: [], searchStatus: 'idle' })
      return
    }
    set({ searchStatus: 'loading' })
    const results = await fetchStudentsForDocument(query)
    set({ searchStatus: 'success', searchResults: results })
  },

  selectStudent: (student) => set({ selectedStudent: student, searchResults: [], lastReceipt: null }),
  clearStudent: () => set({ selectedStudent: null, lastReceipt: null }),

  fetchReceipts: async (filters) => {
    set({ listStatus: 'loading' })
    const receipts = await fetchReceipts(filters)
    set({ listStatus: 'success', receipts })
  },

  submitReceipt: async (payload) => {
    set({ isSubmitting: true, submitError: null })
    try {
      const receipt = await generateReceipt(payload)
      set((state) => ({ isSubmitting: false, lastReceipt: receipt, receipts: [receipt, ...state.receipts] }))
      return receipt
    } catch (error) {
      set({ isSubmitting: false, submitError: error.message })
      return null
    }
  },

  reset: () => set({ selectedStudent: null, lastReceipt: null, searchResults: [], searchStatus: 'idle' }),
}))
