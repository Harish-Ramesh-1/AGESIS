import { create } from 'zustand'
import { fetchDocuments as fetchDocumentsRequest } from '../features/fee-management/services/documentService'

export const useDocumentStore = create((set, get) => ({
  status: 'idle',
  error: null,
  documents: null,

  fetchDocuments: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const documents = await fetchDocumentsRequest()
      set({ status: 'success', documents })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
