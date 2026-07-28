import { create } from 'zustand'
import { createAdmission, fetchAdmissions, updateAdmissionStatus } from '../services/studentManagementService'

export const useAdmissionsStore = create((set, get) => ({
  status: 'idle',
  error: null,
  applications: [],

  fetchApplications: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const applications = await fetchAdmissions()
      set({ status: 'success', applications })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  addApplication: async (application) => {
    try {
      const applications = await createAdmission(application)
      set({ applications })
    } catch (error) {
      set({ error: error.message })
    }
  },

  setStatus: async (id, status) => {
    try {
      const applications = await updateAdmissionStatus(id, status)
      set({ applications })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
