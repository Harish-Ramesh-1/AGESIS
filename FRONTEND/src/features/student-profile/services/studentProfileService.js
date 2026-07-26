const MOCK_PROFILE = {
  name: 'Ananya Mehta',
  registrationNumber: 'P-12345',
  admissionNumber: 'ADM-2019-0456',
  className: 'Grade 8',
  section: 'B',
  rollNumber: '23',
  academicYear: '2025-2026',
  status: 'active',
  avatarInitials: 'AM',

  personal: {
    dob: '2013-04-12',
    gender: 'Female',
    bloodGroup: 'O+',
    nationality: 'Indian',
    religion: 'Hindu',
    category: 'General',
    email: 'ananya.mehta@student.agesisschool.edu',
    phone: '+91 98765 43210',
    admissionDate: '2019-06-01',
  },

  guardians: [
    {
      id: 'g1',
      relationship: 'Father',
      name: 'Rajesh Mehta',
      email: 'rajesh.mehta@example.com',
      phone: '+91 90000 11111',
      occupation: 'Software Engineer',
      isEmergencyContact: true,
      initials: 'RM',
    },
    {
      id: 'g2',
      relationship: 'Mother',
      name: 'Sunita Mehta',
      email: 'sunita.mehta@example.com',
      phone: '+91 90000 22222',
      occupation: 'Doctor',
      isEmergencyContact: false,
      initials: 'SM',
    },
  ],

  school: {
    name: 'Agesis International School',
    campus: 'Whitefield Campus',
    department: 'Middle School',
    classTeacher: 'Mrs. Kavita Rao',
    academicCoordinator: 'Mr. Suresh Nambiar',
    house: 'Falcon House',
    busRoute: 'Route 12 - Whitefield',
    hostelStatus: 'Day Scholar',
  },

  address: {
    permanent: {
      line: '221B, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
    },
    current: {
      line: '221B, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
    },
    sameAsPermanent: true,
  },

  medical: {
    bloodGroup: 'O+',
    allergies: ['Peanuts', 'Dust'],
    conditions: ['Mild Asthma'],
    emergencyContact: '+91 90000 11111',
    doctorName: 'Dr. Ramesh Kumar',
    hospital: 'Manipal Hospital, Whitefield',
    notes: 'Carries an inhaler; inform the school nurse in case of exertion.',
  },

  academicSnapshot: {
    attendance: 96,
    currentGrade: 'A',
    assignmentsCompleted: 42,
    assignmentsTotal: 45,
    examsCompleted: 6,
    examsTotal: 8,
  },

  documents: [
    { id: 'd1', label: 'Admission Form', date: '2019-06-01' },
    { id: 'd2', label: 'ID Card', date: '2025-06-01' },
    { id: 'd3', label: 'Transfer Certificate', date: '2019-05-15' },
    { id: 'd4', label: 'Birth Certificate', date: '2013-04-20' },
    { id: 'd5', label: 'Latest Receipt', date: '2026-06-02' },
    { id: 'd6', label: 'Latest Invoice', date: '2026-07-18' },
  ],
}

const FETCH_DELAY_MS = 750

export async function fetchStudentProfile() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_PROFILE
}
