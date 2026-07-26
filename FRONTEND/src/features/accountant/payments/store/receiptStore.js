import { create } from 'zustand'
import { fetchReceipt } from '../services/paymentsService'

export const usePaymentReceiptStore = create((set) => ({
  status: 'idle',
  error: null,
  activeReceipt: null,

  openReceipt: async (id) => {
    set({ status: 'loading', error: null, activeReceipt: null })
    try {
      const receipt = await fetchReceipt(id)
      set({ status: 'success', activeReceipt: receipt })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  closeReceipt: () => set({ activeReceipt: null, status: 'idle' }),
}))
