import { create } from 'zustand'
import { fetchStudentOutstanding, fetchStudentsForPayment, receivePayment, recordManualPayment } from '../services/paymentsService'

const ONLINE_METHODS = new Set(['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'])

export const useReceivePaymentStore = create((set) => ({
  searchStatus: 'idle',
  searchResults: [],

  selectedStudent: null,
  detailStatus: 'idle',

  isSubmitting: false,
  submitError: null,
  lastReceipt: null,

  searchStudents: async (query) => {
    if (!query) {
      set({ searchResults: [], searchStatus: 'idle' })
      return
    }
    set({ searchStatus: 'loading' })
    const results = await fetchStudentsForPayment(query)
    set({ searchStatus: 'success', searchResults: results })
  },

  selectStudent: async (studentId) => {
    set({ detailStatus: 'loading', lastReceipt: null })
    const student = await fetchStudentOutstanding(studentId)
    set({ detailStatus: 'success', selectedStudent: student, searchResults: [] })
  },

  clearStudent: () => set({ selectedStudent: null, detailStatus: 'idle', lastReceipt: null }),

  submitPayment: async (payload) => {
    set({ isSubmitting: true, submitError: null })
    try {
      const submit = ONLINE_METHODS.has(payload.method) ? receivePayment : recordManualPayment
      const receipt = await submit(payload)
      const refreshedStudent = await fetchStudentOutstanding(payload.studentId)
      set({ isSubmitting: false, lastReceipt: receipt, selectedStudent: refreshedStudent })
      return receipt
    } catch (error) {
      set({ isSubmitting: false, submitError: error.message })
      return null
    }
  },

  reset: () => set({ selectedStudent: null, detailStatus: 'idle', lastReceipt: null, searchResults: [], searchStatus: 'idle' }),
}))
