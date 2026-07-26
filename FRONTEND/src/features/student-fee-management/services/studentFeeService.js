const DELAY_MS = 550

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hashId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash
}

const ACADEMIC_YEAR = '2025-2026'
const ACCOUNTANT_NAME = 'Kavita Sharma'

export const MOCK_STUDENTS = [
  { id: 'stu-01', name: 'Aditya Kulkarni', registrationNumber: 'P-10234', admissionNumber: 'ADM-2018-0231', className: '10', section: 'A', parentName: 'Rakesh Kulkarni', parentPhone: '+91 98200 11223', parentEmail: 'rakesh.kulkarni@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-02', name: 'Ishaan Verma', registrationNumber: 'P-10871', admissionNumber: 'ADM-2020-0412', className: '8', section: 'B', parentName: 'Sunil Verma', parentPhone: '+91 90080 44521', parentEmail: 'sunil.verma@example.com', outstandingAmount: 24500, status: 'partial', hasScholarship: true, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-03', name: 'Kabir Menon', registrationNumber: 'P-10456', admissionNumber: 'ADM-2017-0198', className: '10', section: 'C', parentName: 'Prakash Menon', parentPhone: '+91 97400 11298', parentEmail: 'prakash.menon@example.com', outstandingAmount: 62000, status: 'overdue', hasScholarship: false, hasDiscount: false, hasHostel: true, hasTransport: false },
  { id: 'stu-04', name: 'Diya Kulkarni', registrationNumber: 'P-11023', admissionNumber: 'ADM-2021-0567', className: '6', section: 'A', parentName: 'Manoj Kulkarni', parentPhone: '+91 98450 12233', parentEmail: 'manoj.kulkarni@example.com', outstandingAmount: 38500, status: 'overdue', hasScholarship: false, hasDiscount: true, hasHostel: false, hasTransport: false },
  { id: 'stu-05', name: 'Sanya Kapoor', registrationNumber: 'P-10998', admissionNumber: 'ADM-2020-0345', className: '9', section: 'A', parentName: 'Vikram Kapoor', parentPhone: '+91 99000 55667', parentEmail: 'vikram.kapoor@example.com', outstandingAmount: 51000, status: 'pending', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-06', name: 'Vihaan Pillai', registrationNumber: 'P-10777', admissionNumber: 'ADM-2019-0289', className: '9', section: 'B', parentName: 'Anand Pillai', parentPhone: '+91 90000 33445', parentEmail: 'anand.pillai@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: false, hasDiscount: false, hasHostel: true, hasTransport: true },
  { id: 'stu-07', name: 'Ananya Iyer', registrationNumber: 'P-11145', admissionNumber: 'ADM-2022-0678', className: '5', section: 'C', parentName: 'Suresh Iyer', parentPhone: '+91 98765 22110', parentEmail: 'suresh.iyer@example.com', outstandingAmount: 33000, status: 'partial', hasScholarship: true, hasDiscount: false, hasHostel: false, hasTransport: false },
  { id: 'stu-08', name: 'Reyansh Bhat', registrationNumber: 'P-10654', admissionNumber: 'ADM-2016-0102', className: '11', section: 'A', parentName: 'Deepak Bhat', parentPhone: '+91 99870 66554', parentEmail: 'deepak.bhat@example.com', outstandingAmount: 78000, status: 'pending', hasScholarship: false, hasDiscount: false, hasHostel: true, hasTransport: false },
  { id: 'stu-09', name: 'Myra Desai', registrationNumber: 'P-11201', admissionNumber: 'ADM-2023-0745', className: '4', section: 'B', parentName: 'Nikhil Desai', parentPhone: '+91 98200 99887', parentEmail: 'nikhil.desai@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: false },
  { id: 'stu-10', name: 'Aarav Nair', registrationNumber: 'P-12345', admissionNumber: 'ADM-2019-0456', className: '8', section: 'B', parentName: 'Rajesh Nair', parentPhone: '+91 90000 11111', parentEmail: 'rajesh.nair@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-11', name: 'Saanvi Joshi', registrationNumber: 'P-10589', admissionNumber: 'ADM-2018-0267', className: '6', section: 'B', parentName: 'Ramesh Joshi', parentPhone: '+91 90080 44521', parentEmail: 'ramesh.joshi@example.com', outstandingAmount: 41500, status: 'overdue', hasScholarship: false, hasDiscount: true, hasHostel: false, hasTransport: false },
  { id: 'stu-12', name: 'Arjun Reddy', registrationNumber: 'P-10432', admissionNumber: 'ADM-2017-0176', className: '8', section: 'A', parentName: 'Srinivas Reddy', parentPhone: '+91 97400 11298', parentEmail: 'srinivas.reddy@example.com', outstandingAmount: 55000, status: 'overdue', hasScholarship: true, hasDiscount: false, hasHostel: true, hasTransport: false },
  { id: 'stu-13', name: 'Kiara Shah', registrationNumber: 'P-11089', admissionNumber: 'ADM-2020-0398', className: '10', section: 'B', parentName: 'Jayesh Shah', parentPhone: '+91 99000 55667', parentEmail: 'jayesh.shah@example.com', outstandingAmount: 34000, status: 'pending', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-14', name: 'Yash Kapoor', registrationNumber: 'P-10345', admissionNumber: 'ADM-2017-0145', className: '9', section: 'A', parentName: 'Sanjay Kapoor', parentPhone: '+91 98450 12233', parentEmail: 'sanjay.kapoor@example.com', outstandingAmount: 68000, status: 'overdue', hasScholarship: false, hasDiscount: true, hasHostel: true, hasTransport: false },
  { id: 'stu-15', name: 'Ishita Rao', registrationNumber: 'P-10912', admissionNumber: 'ADM-2019-0334', className: '7', section: 'A', parentName: 'Ganesh Rao', parentPhone: '+91 98765 43299', parentEmail: 'ganesh.rao@example.com', outstandingAmount: 29500, status: 'partial', hasScholarship: true, hasDiscount: false, hasHostel: false, hasTransport: false },
  { id: 'stu-16', name: 'Rohan Verma', registrationNumber: 'P-10123', admissionNumber: 'ADM-2015-0067', className: '12', section: 'A', parentName: 'Ajay Verma', parentPhone: '+91 90080 22110', parentEmail: 'ajay.verma@example.com', outstandingAmount: 28500, status: 'pending', hasScholarship: false, hasDiscount: false, hasHostel: false, hasTransport: true },
  { id: 'stu-17', name: 'Meera Pillai', registrationNumber: 'P-10765', admissionNumber: 'ADM-2016-0089', className: '11', section: 'B', parentName: 'Girish Pillai', parentPhone: '+91 90000 44556', parentEmail: 'girish.pillai@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: false, hasDiscount: false, hasHostel: true, hasTransport: false },
  { id: 'stu-18', name: 'Advait Rao', registrationNumber: 'P-11167', admissionNumber: 'ADM-2021-0523', className: '7', section: 'C', parentName: 'Vinod Rao', parentPhone: '+91 98765 11223', parentEmail: 'vinod.rao@example.com', outstandingAmount: 0, status: 'paid', hasScholarship: true, hasDiscount: false, hasHostel: false, hasTransport: true },
].map((student) => ({
  ...student,
  avatarInitials: student.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  academicYear: ACADEMIC_YEAR,
}))

const SCHOLARSHIP_TYPES = ['Academic Scholarship', 'Sports Scholarship', 'Merit Scholarship', 'Government Scholarship']
const DISCOUNT_TYPES = ['Sibling Discount', 'Employee Discount', 'Special Discount']
const MISC_CHARGE_TYPES = ['Library Fine', 'Uniform Charges', 'Books & Stationery', 'Annual Day Event', 'Educational Tour', 'Laboratory Damage']

function tuitionForClass(className) {
  return 35000 + Number(className) * 3500
}

function buildFeeComponents(student) {
  const seed = hashId(student.id)
  const tuition = tuitionForClass(student.className)
  const discountAmount = student.hasDiscount ? Math.round(tuition * 0.1) : 0
  const scholarshipAmount = student.hasScholarship ? Math.round(tuition * 0.15) : 0
  const concessionAmount = student.status === 'partial' || student.status === 'overdue' ? 1500 : 0
  const lateFee = student.status === 'overdue' ? 2000 + (seed % 5) * 250 : 0

  const componentPaid = student.status === 'paid'
  const componentPartial = student.status === 'partial'

  const rows = [
    { key: 'tuition', label: 'Tuition Fee', amount: tuition, discount: discountAmount, scholarship: scholarshipAmount, concession: concessionAmount, lateFee },
    { key: 'library', label: 'Library Fee', amount: 2500, discount: 0, scholarship: 0, concession: 0, lateFee: 0 },
    { key: 'laboratory', label: 'Laboratory Fee', amount: 4500, discount: 0, scholarship: 0, concession: 0, lateFee: 0 },
    { key: 'sports', label: 'Sports Fee', amount: 3000, discount: 0, scholarship: 0, concession: 0, lateFee: 0 },
    { key: 'examination', label: 'Examination Fee', amount: 3500, discount: 0, scholarship: 0, concession: 0, lateFee: 0 },
    { key: 'miscellaneous', label: 'Miscellaneous Fee', amount: 2000, discount: 0, scholarship: 0, concession: 0, lateFee: 0 },
  ]

  if (student.hasTransport) {
    rows.splice(1, 0, { key: 'transport', label: 'Transport Fee', amount: 18000, discount: 0, scholarship: 0, concession: 0, lateFee: 0 })
  }
  if (student.hasHostel) {
    rows.splice(1, 0, { key: 'hostel', label: 'Hostel Fee', amount: 65000, discount: 0, scholarship: 0, concession: 0, lateFee: 0 })
  }

  return rows.map((row, index) => {
    const netAmount = row.amount - row.discount - row.scholarship - row.concession + row.lateFee
    let status = 'pending'
    if (componentPaid) status = 'paid'
    else if (componentPartial) status = index % 2 === 0 ? 'paid' : 'pending'
    return {
      id: `${student.id}-${row.key}`,
      component: row.label,
      amount: row.amount,
      discount: row.discount,
      scholarship: row.scholarship,
      concession: row.concession,
      lateFee: row.lateFee,
      netAmount,
      status,
      enabled: true,
      dueDate: row.key === 'tuition' ? '2026-08-05' : '2026-07-15',
      installments: row.key === 'tuition' ? 4 : 1,
    }
  })
}

function buildScholarships(student) {
  if (!student.hasScholarship) return []
  const seed = hashId(student.id)
  const type = SCHOLARSHIP_TYPES[seed % SCHOLARSHIP_TYPES.length]
  const tuition = tuitionForClass(student.className)
  const percentage = 15
  return [
    {
      id: `${student.id}-sch-1`,
      name: type,
      amount: Math.round(tuition * (percentage / 100)),
      percentage,
      reason: type === 'Government Scholarship' ? 'State merit-cum-means scholarship' : `Awarded for outstanding ${type.split(' ')[0].toLowerCase()} performance`,
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'active',
    },
  ]
}

function buildDiscounts(student) {
  if (!student.hasDiscount) return []
  const seed = hashId(student.id)
  const type = DISCOUNT_TYPES[seed % DISCOUNT_TYPES.length]
  const tuition = tuitionForClass(student.className)
  const percentage = 10
  return [
    {
      id: `${student.id}-disc-1`,
      name: type,
      amount: Math.round(tuition * (percentage / 100)),
      percentage,
      reason: type === 'Sibling Discount' ? 'Second child enrolled at AGESIS' : type === 'Employee Discount' ? 'Parent is a staff member' : 'Approved by school management',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'active',
    },
  ]
}

function buildConcessions(student) {
  if (student.status !== 'partial' && student.status !== 'overdue') return []
  return [
    {
      id: `${student.id}-con-1`,
      type: 'Fee Concession',
      amount: 1500,
      approvedBy: ACCOUNTANT_NAME,
      reason: 'Temporary financial hardship reported by parent',
      effectiveDate: '2025-06-01',
      expiryDate: '2026-03-31',
      status: 'active',
    },
  ]
}

function buildMiscCharges(student) {
  const seed = hashId(student.id)
  const count = seed % 3
  return Array.from({ length: count }).map((_, index) => {
    const type = MISC_CHARGE_TYPES[(seed + index) % MISC_CHARGE_TYPES.length]
    return {
      id: `${student.id}-misc-${index}`,
      name: type,
      description: `${type} recorded for ${student.academicYear}`,
      amount: 500 + ((seed + index * 137) % 2000),
      applicableDate: '2026-06-15',
      remarks: '',
    }
  })
}

function buildPenalty(student) {
  const feeComponents = buildFeeComponents(student)
  const tuitionRow = feeComponents.find((row) => row.component === 'Tuition Fee')
  const currentLateFee = tuitionRow?.lateFee ?? 0
  return {
    currentLateFee,
    penaltyAmount: currentLateFee,
    reason: currentLateFee > 0 ? 'Payment overdue beyond grace period' : '',
  }
}

function buildAdjustmentHistory(student) {
  if (student.status === 'paid') {
    return [
      {
        id: `${student.id}-hist-1`,
        date: '2026-04-05',
        feeComponent: 'Tuition Fee',
        oldAmount: tuitionForClass(student.className) - 2000,
        newAmount: tuitionForClass(student.className),
        reason: 'Annual fee revision',
        updatedBy: ACCOUNTANT_NAME,
        remarks: 'Applied school-wide',
      },
    ]
  }
  return [
    {
      id: `${student.id}-hist-1`,
      date: '2026-04-05',
      feeComponent: 'Tuition Fee',
      oldAmount: tuitionForClass(student.className) - 2000,
      newAmount: tuitionForClass(student.className),
      reason: 'Annual fee revision',
      updatedBy: ACCOUNTANT_NAME,
      remarks: 'Applied school-wide',
    },
    {
      id: `${student.id}-hist-2`,
      date: '2026-06-12',
      feeComponent: 'Miscellaneous Fee',
      oldAmount: 0,
      newAmount: 2000,
      reason: 'Component enabled for the term',
      updatedBy: ACCOUNTANT_NAME,
      remarks: '',
    },
  ]
}

function buildDetail(student) {
  return {
    feeComponents: buildFeeComponents(student),
    miscCharges: buildMiscCharges(student),
    scholarships: buildScholarships(student),
    discounts: buildDiscounts(student),
    concessions: buildConcessions(student),
    penalty: buildPenalty(student),
    adjustmentHistory: buildAdjustmentHistory(student),
  }
}

const detailCache = new Map()

function getOrBuildDetail(id) {
  if (!detailCache.has(id)) {
    const student = MOCK_STUDENTS.find((item) => item.id === id)
    detailCache.set(id, buildDetail(student))
  }
  return detailCache.get(id)
}

function pushHistory(detail, entry) {
  detail.adjustmentHistory = [
    { id: `hist-${Date.now()}`, date: new Date().toISOString().slice(0, 10), updatedBy: ACCOUNTANT_NAME, remarks: '', ...entry },
    ...detail.adjustmentHistory,
  ]
}

function totalNetAmount(components) {
  return components.reduce((sum, row) => sum + row.netAmount, 0)
}

function applyFilters(students, filters = {}) {
  const { query, className, section, feeStatus, scholarship, discount, hostel, transport } = filters
  return students.filter((student) => {
    if (query) {
      const q = query.toLowerCase()
      const haystack = [
        student.name,
        student.registrationNumber,
        student.admissionNumber,
        student.parentName,
        student.parentPhone,
        student.parentEmail,
        student.className,
        student.section,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (className && student.className !== className) return false
    if (section && student.section !== section) return false
    if (feeStatus && student.status !== feeStatus) return false
    if (scholarship && !student.hasScholarship) return false
    if (discount && !student.hasDiscount) return false
    if (hostel && !student.hasHostel) return false
    if (transport && !student.hasTransport) return false
    return true
  })
}

export async function fetchStudents(filters) {
  await delay()
  return applyFilters(MOCK_STUDENTS, filters)
}

export async function fetchStudentById(id) {
  await delay()
  const student = MOCK_STUDENTS.find((item) => item.id === id)
  if (!student) throw new Error('Student not found')
  return student
}

export async function fetchFeeStructure(id) {
  await delay()
  const detail = getOrBuildDetail(id)
  return { feeComponents: detail.feeComponents, miscCharges: detail.miscCharges, penalty: detail.penalty }
}

export async function fetchScholarshipsAndDiscounts(id) {
  await delay()
  const detail = getOrBuildDetail(id)
  return { scholarships: detail.scholarships, discounts: detail.discounts }
}

export async function fetchConcessions(id) {
  await delay()
  const detail = getOrBuildDetail(id)
  return detail.concessions
}

export async function assignFeeStructure(id, payload) {
  await delay(800)
  const detail = getOrBuildDetail(id)
  const previousTotal = totalNetAmount(detail.feeComponents)
  const student = MOCK_STUDENTS.find((item) => item.id === id)
  const rebuilt = buildFeeComponents({
    ...student,
    hasTransport: payload.transport,
    hasHostel: payload.hostel,
  })
  const optionalRows = (payload.optionalFees ?? []).map((label, index) => ({
    id: `${id}-optional-${index}-${Date.now()}`,
    component: label,
    amount: 2500,
    discount: 0,
    scholarship: 0,
    concession: 0,
    lateFee: 0,
    netAmount: 2500,
    status: 'pending',
    enabled: true,
    dueDate: '2026-07-15',
    installments: 1,
  }))
  const finalComponents = [...rebuilt, ...optionalRows]
  detail.feeComponents = finalComponents
  pushHistory(detail, {
    feeComponent: 'Fee Structure',
    oldAmount: previousTotal,
    newAmount: totalNetAmount(finalComponents),
    reason: `${payload.template} template assigned (${payload.installmentPlan})`,
    remarks: payload.academicYear,
  })
  return detail.feeComponents
}

export async function updateFeeComponents(id, components) {
  await delay(700)
  const detail = getOrBuildDetail(id)
  components.forEach((updated) => {
    const existing = detail.feeComponents.find((row) => row.id === updated.id)
    if (existing && (existing.amount !== updated.amount || existing.enabled !== updated.enabled)) {
      pushHistory(detail, {
        feeComponent: existing.component,
        oldAmount: existing.amount,
        newAmount: updated.amount,
        reason: existing.enabled !== updated.enabled ? (updated.enabled ? 'Component enabled' : 'Component disabled') : 'Amount edited',
        remarks: '',
      })
    }
  })
  detail.feeComponents = components
  return detail.feeComponents
}

export async function addScholarship(id, payload) {
  await delay()
  const detail = getOrBuildDetail(id)
  const record = { id: `sch-${Date.now()}`, status: 'active', ...payload }
  detail.scholarships = [...detail.scholarships, record]
  pushHistory(detail, { feeComponent: 'Scholarship', oldAmount: 0, newAmount: payload.amount, reason: `${payload.name} added`, remarks: payload.reason })
  return detail.scholarships
}

export async function addDiscount(id, payload) {
  await delay()
  const detail = getOrBuildDetail(id)
  const record = { id: `disc-${Date.now()}`, status: 'active', ...payload }
  detail.discounts = [...detail.discounts, record]
  pushHistory(detail, { feeComponent: 'Discount', oldAmount: 0, newAmount: payload.amount, reason: `${payload.name} added`, remarks: payload.reason })
  return detail.discounts
}

export async function addConcession(id, payload) {
  await delay()
  const detail = getOrBuildDetail(id)
  const record = { id: `con-${Date.now()}`, status: 'active', ...payload }
  detail.concessions = [...detail.concessions, record]
  pushHistory(detail, { feeComponent: 'Concession', oldAmount: 0, newAmount: payload.amount, reason: `${payload.type} added`, remarks: payload.reason })
  return detail.concessions
}

export async function addMiscCharge(id, payload) {
  await delay()
  const detail = getOrBuildDetail(id)
  const record = { id: `misc-${Date.now()}`, ...payload }
  detail.miscCharges = [...detail.miscCharges, record]
  pushHistory(detail, { feeComponent: payload.name, oldAmount: 0, newAmount: payload.amount, reason: 'Miscellaneous charge added', remarks: payload.remarks ?? '' })
  return detail.miscCharges
}

export async function waivePenalty(id, payload) {
  await delay(700)
  const detail = getOrBuildDetail(id)
  const oldPenalty = detail.penalty.penaltyAmount
  const waivedAmount = payload.mode === 'full' ? oldPenalty : Math.min(payload.amount, oldPenalty)
  const newPenalty = Math.max(0, oldPenalty - waivedAmount)
  detail.penalty = { ...detail.penalty, penaltyAmount: newPenalty, currentLateFee: newPenalty }
  pushHistory(detail, {
    feeComponent: 'Late Fee Penalty',
    oldAmount: oldPenalty,
    newAmount: newPenalty,
    reason: payload.reason,
    remarks: payload.mode === 'full' ? 'Full waiver approved' : `Partial waiver of ${waivedAmount}`,
  })
  return detail.penalty
}

export async function fetchAdjustmentHistory(id) {
  await delay()
  const detail = getOrBuildDetail(id)
  return detail.adjustmentHistory
}
