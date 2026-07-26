import { create } from 'zustand'
import { fetchFeeDetails as fetchFeeDetailsRequest } from '../features/fee-management/services/feeService'

export const useFeeStore = create((set, get) => ({
  status: 'idle',
  error: null,
  details: null,

  fetchFeeDetails: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const details = await fetchFeeDetailsRequest()
      set({ status: 'success', details })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
