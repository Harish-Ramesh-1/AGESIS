import { create } from 'zustand'
import { submitPayment as submitPaymentRequest } from '../features/fee-management/services/paymentService'

const initialState = {
  step: 'form',
  paymentType: 'full',
  selectedComponentKeys: [],
  customAmount: '',
  selectedMethod: null,
  isSubmitting: false,
  error: null,
  transaction: null,
}

export const usePaymentStore = create((set, get) => ({
  ...initialState,

  setPaymentType: (paymentType) => set({ paymentType, selectedComponentKeys: [], customAmount: '' }),

  toggleComponent: (key) =>
    set((state) => ({
      selectedComponentKeys: state.selectedComponentKeys.includes(key)
        ? state.selectedComponentKeys.filter((item) => item !== key)
        : [...state.selectedComponentKeys, key],
    })),

  setCustomAmount: (customAmount) => set({ customAmount }),

  setMethod: (selectedMethod) => set({ selectedMethod }),

  prefill: ({ paymentType, selectedComponentKeys }) =>
    set({
      ...initialState,
      paymentType: paymentType ?? 'full',
      selectedComponentKeys: selectedComponentKeys ?? [],
    }),

  openConfirm: () => set({ step: 'confirm' }),
  closeConfirm: () => set({ step: 'form' }),

  submitPayment: async (amount) => {
    set({ step: 'processing', isSubmitting: true, error: null })
    try {
      const transaction = await submitPaymentRequest({ amount, method: get().selectedMethod })
      set({ step: 'success', isSubmitting: false, transaction })
    } catch (error) {
      set({ step: 'failure', isSubmitting: false, error: error.message })
    }
  },

  retry: () => set({ step: 'form', error: null }),

  reset: () => set({ ...initialState }),
}))
