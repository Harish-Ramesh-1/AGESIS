import { create } from 'zustand'
import { fetchReceiptArchive } from '../services/invoicesService'

export const useArchiveStore = create((set) => ({
  status: 'idle',
  error: null,
  documents: [],

  fetchDocuments: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const documents = await fetchReceiptArchive(filters)
      set({ status: 'success', documents })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
