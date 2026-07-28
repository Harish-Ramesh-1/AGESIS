import { create } from 'zustand'
import { createScholarshipPolicy, fetchScholarshipPolicies, fetchScholarshipRecipients, toggleScholarshipPolicy } from '../services/feeStructureService'

export const useScholarshipsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  policies: [],
  isSaving: false,

  recipientsStatus: 'idle',
  recipientsError: null,
  recipients: [],

  actioningId: null,

  fetchPolicies: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const policies = await fetchScholarshipPolicies()
      set({ status: 'success', policies })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  fetchRecipients: async () => {
    if (get().recipientsStatus === 'loading') return
    set({ recipientsStatus: 'loading', recipientsError: null })
    try {
      const recipients = await fetchScholarshipRecipients()
      set({ recipientsStatus: 'success', recipients })
    } catch (error) {
      set({ recipientsStatus: 'error', recipientsError: error.message })
    }
  },

  addPolicy: async (payload) => {
    set({ isSaving: true })
    try {
      const policy = await createScholarshipPolicy(payload)
      set((state) => ({ policies: [policy, ...state.policies], isSaving: false }))
      return policy
    } catch (error) {
      set({ isSaving: false, error: error.message })
      throw error
    }
  },

  toggleActive: async (id) => {
    set({ actioningId: id })
    try {
      const policy = await toggleScholarshipPolicy(id)
      set((state) => ({ policies: state.policies.map((item) => (item.id === id ? policy : item)), actioningId: null }))
    } catch (error) {
      set({ actioningId: null, error: error.message })
    }
  },
}))
