import { create } from 'zustand'
import { fetchInvoices } from '../services/invoiceService'

export const useInvoiceStore = create((set, get) => ({
  status: 'idle',
  error: null,
  invoices: [],
  pinnedIds: [],
  favouriteIds: [],
  recentlyDownloaded: [],

  fetchInvoices: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const invoices = await fetchInvoices()
      set({ status: 'success', invoices })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  togglePin: (id) =>
    set((state) => ({
      pinnedIds: state.pinnedIds.includes(id)
        ? state.pinnedIds.filter((item) => item !== id)
        : [...state.pinnedIds, id],
    })),

  toggleFavourite: (id) =>
    set((state) => ({
      favouriteIds: state.favouriteIds.includes(id)
        ? state.favouriteIds.filter((item) => item !== id)
        : [...state.favouriteIds, id],
    })),

  recordDownload: (invoice) =>
    set((state) => ({
      recentlyDownloaded: [
        { id: invoice.id, type: 'invoice', label: `Invoice ${invoice.id}`, downloadedAt: new Date().toISOString() },
        ...state.recentlyDownloaded.filter((item) => item.id !== invoice.id),
      ].slice(0, 5),
    })),
}))
