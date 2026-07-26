import { create } from 'zustand'
import {
  emailDocument,
  fetchDocumentActivity,
  fetchDocumentById,
  markDownloaded,
  markPrinted,
  shareDocument,
} from '../services/documentsService'

export const useDocumentViewerStore = create((set, get) => ({
  status: 'idle',
  error: null,
  document: null,

  activityStatus: 'idle',
  activity: [],

  isActing: false,
  shareLink: null,

  openDocument: async (id) => {
    set({ status: 'loading', error: null, document: null, activity: [], shareLink: null })
    try {
      const document = await fetchDocumentById(id)
      set({ status: 'success', document })
      get().fetchActivity(id)
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  fetchActivity: async (id) => {
    set({ activityStatus: 'loading' })
    const activity = await fetchDocumentActivity(id)
    set({ activityStatus: 'success', activity })
  },

  closeDocument: () => set({ document: null, status: 'idle', activity: [] }),

  email: async (id, payload) => {
    set({ isActing: true })
    await emailDocument(id, payload)
    set({ isActing: false })
    await get().fetchActivity(id)
  },

  share: async (id) => {
    set({ isActing: true })
    const result = await shareDocument(id)
    set({ isActing: false, shareLink: result.link })
    await get().fetchActivity(id)
  },

  registerDownload: async (id) => {
    await markDownloaded(id)
    await get().fetchActivity(id)
  },

  registerPrint: async (id) => {
    await markPrinted(id)
    await get().fetchActivity(id)
  },
}))
