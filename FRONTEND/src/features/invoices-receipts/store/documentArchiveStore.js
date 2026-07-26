import { create } from 'zustand'
import { deleteDocument, fetchDocuments } from '../services/documentsService'

export const useDocumentArchiveStore = create((set) => ({
  status: 'idle',
  error: null,
  documents: [],

  fetchDocuments: async (filters) => {
    set({ status: 'loading', error: null })
    try {
      const documents = await fetchDocuments(filters)
      set({ status: 'success', documents })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  deleteDocument: async (id) => {
    await deleteDocument(id)
    set((state) => ({ documents: state.documents.filter((doc) => doc.documentNumber !== id) }))
  },
}))
