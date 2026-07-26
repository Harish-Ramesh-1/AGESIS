import { create } from 'zustand'
import { fetchReceipts } from '../services/receiptService'

export const useReceiptStore = create((set, get) => ({
  status: 'idle',
  error: null,
  receipts: [],
  pinnedIds: [],
  favouriteIds: [],
  recentlyDownloaded: [],

  fetchReceipts: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const receipts = await fetchReceipts()
      set({ status: 'success', receipts })
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

  recordDownload: (receipt) =>
    set((state) => ({
      recentlyDownloaded: [
        { id: receipt.id, type: 'receipt', label: `Receipt ${receipt.id}`, downloadedAt: new Date().toISOString() },
        ...state.recentlyDownloaded.filter((item) => item.id !== receipt.id),
      ].slice(0, 5),
    })),
}))
