import { create } from 'zustand'

const MOCK_STUDENT_PROFILE = {
  parentName: 'Rajesh Mehta',
  studentName: 'Ananya Mehta',
  registrationNumber: 'P-12345',
  className: 'Grade 8',
  section: 'B',
  academicYear: '2025 - 2026',
  school: 'Agesis International School',
  avatarInitials: 'AM',
  paymentStatus: 'pending',
}

const FETCH_DELAY_MS = 700

export const useStudentStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,

  fetchProfile: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
      set({ status: 'success', profile: MOCK_STUDENT_PROFILE })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
