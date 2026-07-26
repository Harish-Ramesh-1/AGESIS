import { create } from 'zustand'
import { calculateLateFee, LATE_FEE_RULES } from '../services/pendingDuesService'

export const useLateFeeStore = create((set) => ({
  rules: LATE_FEE_RULES,
  isCalculating: false,
  result: null,

  calculate: async (payload) => {
    set({ isCalculating: true })
    const result = await calculateLateFee(payload)
    set({ isCalculating: false, result })
    return result
  },

  clearResult: () => set({ result: null }),
}))
