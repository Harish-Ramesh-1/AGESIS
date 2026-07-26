import { create } from 'zustand'
import { fetchStudentProfile } from '../features/student-profile/services/studentProfileService'

export const useStudentProfileStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,
  pendingRequests: { address: null, medical: null },

  fetchStudentProfile: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const profile = await fetchStudentProfile()
      set({ status: 'success', profile })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  submitAddressChangeRequest: (data) =>
    set((state) => ({
      pendingRequests: { ...state.pendingRequests, address: { data, submittedAt: new Date().toISOString() } },
    })),

  submitMedicalChangeRequest: (data) =>
    set((state) => ({
      pendingRequests: { ...state.pendingRequests, medical: { data, submittedAt: new Date().toISOString() } },
    })),

  cancelAddressChangeRequest: () =>
    set((state) => ({ pendingRequests: { ...state.pendingRequests, address: null } })),

  cancelMedicalChangeRequest: () =>
    set((state) => ({ pendingRequests: { ...state.pendingRequests, medical: null } })),
}))
