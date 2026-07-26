import { create } from 'zustand'
import { approveApplication, fetchScholarshipApplications, fetchScholarshipPrograms, rejectApplication } from '../services/feeConfigService'

export const useScholarshipProgramStore = create((set, get) => ({
  status: 'idle',
  error: null,
  programs: [],

  applicationsStatus: 'idle',
  applicationsError: null,
  applications: [],

  actioningId: null,

  fetchPrograms: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const programs = await fetchScholarshipPrograms()
      set({ status: 'success', programs })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },

  fetchApplications: async () => {
    if (get().applicationsStatus === 'loading') return
    set({ applicationsStatus: 'loading', applicationsError: null })
    try {
      const applications = await fetchScholarshipApplications()
      set({ applicationsStatus: 'success', applications })
    } catch (error) {
      set({ applicationsStatus: 'error', applicationsError: error.message })
    }
  },

  approve: async (id) => {
    set({ actioningId: id })
    try {
      const { application, program } = await approveApplication(id)
      set((state) => ({
        applications: state.applications.map((item) => (item.id === id ? application : item)),
        programs: program ? state.programs.map((item) => (item.id === program.id ? program : item)) : state.programs,
        actioningId: null,
      }))
    } catch (error) {
      set({ actioningId: null, applicationsError: error.message })
    }
  },

  reject: async (id) => {
    set({ actioningId: id })
    try {
      const application = await rejectApplication(id)
      set((state) => ({
        applications: state.applications.map((item) => (item.id === id ? application : item)),
        actioningId: null,
      }))
    } catch (error) {
      set({ actioningId: null, applicationsError: error.message })
    }
  },
}))
