import { apiGet } from '../../../services/apiClient'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export async function fetchStudentProfile() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) throw new Error('No student profile is linked to this account yet.')

  const { data: archive } = await apiGet('/documents/archive')

  // The backend has no address/medical/academic-performance modules yet, so those
  // sections fall back to `null`/empty placeholders (InfoItem renders '—' for null).
  const address = { line: null, city: null, state: null, postalCode: null, country: null }

  return {
    name: student.full_name,
    registrationNumber: student.admission_no,
    admissionNumber: student.admission_no,
    className: student.class_name ? `Grade ${student.class_name}` : '',
    section: student.section || '',
    rollNumber: student.admission_no,
    academicYear: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
    status: student.status || 'active',
    avatarInitials: initials(student.full_name),

    personal: {
      dob: student.dob,
      gender: student.gender,
      bloodGroup: null,
      nationality: null,
      religion: null,
      category: null,
      email: null,
      phone: null,
      admissionDate: student.admitted_at,
    },

    guardians: [
      {
        id: 'primary-guardian',
        relationship: 'Guardian',
        name: student.guardian_name,
        email: student.guardian_email,
        phone: student.guardian_phone,
        occupation: null,
        isEmergencyContact: true,
        initials: initials(student.guardian_name || ''),
      },
    ],

    school: {
      name: 'Agesis International School',
      campus: null,
      department: null,
      classTeacher: null,
      academicCoordinator: null,
      house: null,
      busRoute: null,
      hostelStatus: null,
    },

    address: {
      permanent: address,
      current: address,
      sameAsPermanent: true,
    },

    medical: {
      bloodGroup: null,
      allergies: [],
      conditions: [],
      emergencyContact: student.guardian_phone || null,
      doctorName: null,
      hospital: null,
      notes: null,
    },

    // No academic-performance module exists on the backend yet.
    academicSnapshot: {
      attendance: 0,
      currentGrade: '—',
      assignmentsCompleted: 0,
      assignmentsTotal: 1,
      examsCompleted: 0,
      examsTotal: 1,
    },

    documents: (archive || []).slice(0, 6).map((doc) => ({
      id: doc.number,
      label: `${doc.type === 'invoice' ? 'Invoice' : 'Receipt'} - ${doc.number}`,
      date: doc.createdAt?.slice(0, 10),
    })),
  }
}
