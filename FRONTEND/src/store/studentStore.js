import { create } from 'zustand'
import { apiGet } from '../services/apiClient'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export const useStudentStore = create((set, get) => ({
  status: 'idle',
  error: null,
  profile: null,
  studentId: null,

  fetchProfile: async () => {
    if (get().status === 'loading' || get().status === 'success') return
    set({ status: 'loading', error: null })
    try {
      const [{ data: me }, { data: children }] = await Promise.all([
        apiGet('/auth/me'),
        apiGet('/students/me/children'),
      ])
      const student = children?.[0]
      if (!student) {
        set({ status: 'success', profile: null, studentId: null })
        return
      }

      const { data: outstanding } = await apiGet(`/students/${student.id}/outstanding`)

      set({
        status: 'success',
        studentId: student.id,
        profile: {
          parentName: me?.fullName || 'Parent',
          studentName: student.full_name,
          registrationNumber: student.admission_no,
          className: student.class_name ? `Grade ${student.class_name}` : '',
          section: student.section || '',
          academicYear: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
          school: 'Agesis International School',
          avatarInitials: initials(student.full_name),
          paymentStatus: outstanding?.outstanding > 0 ? 'pending' : 'paid',
        },
      })
    } catch (error) {
      set({ status: 'error', error: error.message })
    }
  },
}))
