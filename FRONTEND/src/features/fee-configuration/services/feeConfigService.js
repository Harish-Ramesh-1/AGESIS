import { computeAnnualTotal } from '../utils/feeConfigUtils'

const DELAY_MS = 600
const ACCOUNTANT_NAME = 'Kavita Sharma'

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Fee Structure Templates
// ---------------------------------------------------------------------------

let structureCounter = 107

const FEE_STRUCTURES = [
  {
    id: 'FS-101',
    name: 'Primary Wing Standard Plan',
    classStart: 1,
    classEnd: 5,
    academicYear: '2025-2026',
    status: 'active',
    components: [
      { rowId: 'c-101-1', label: 'Tuition Fee', amount: 15000, frequency: 'term-wise' },
      { rowId: 'c-101-2', label: 'Admission Fee', amount: 5000, frequency: 'one-time' },
      { rowId: 'c-101-3', label: 'Development Fee', amount: 3000, frequency: 'one-time' },
      { rowId: 'c-101-4', label: 'Library Fee', amount: 500, frequency: 'term-wise' },
      { rowId: 'c-101-5', label: 'Sports Fee', amount: 800, frequency: 'term-wise' },
    ],
  },
  {
    id: 'FS-102',
    name: 'Middle School Standard Plan',
    classStart: 6,
    classEnd: 8,
    academicYear: '2025-2026',
    status: 'active',
    components: [
      { rowId: 'c-102-1', label: 'Tuition Fee', amount: 18000, frequency: 'term-wise' },
      { rowId: 'c-102-2', label: 'Admission Fee', amount: 6000, frequency: 'one-time' },
      { rowId: 'c-102-3', label: 'Development Fee', amount: 3500, frequency: 'one-time' },
      { rowId: 'c-102-4', label: 'Laboratory Fee', amount: 1200, frequency: 'term-wise' },
      { rowId: 'c-102-5', label: 'Computer Fee', amount: 300, frequency: 'monthly' },
      { rowId: 'c-102-6', label: 'Sports Fee', amount: 900, frequency: 'term-wise' },
    ],
  },
  {
    id: 'FS-103',
    name: 'High School Standard Plan',
    classStart: 9,
    classEnd: 10,
    academicYear: '2025-2026',
    status: 'active',
    components: [
      { rowId: 'c-103-1', label: 'Tuition Fee', amount: 22000, frequency: 'term-wise' },
      { rowId: 'c-103-2', label: 'Admission Fee', amount: 7000, frequency: 'one-time' },
      { rowId: 'c-103-3', label: 'Examination Fee', amount: 1500, frequency: 'term-wise' },
      { rowId: 'c-103-4', label: 'Laboratory Fee', amount: 1500, frequency: 'term-wise' },
      { rowId: 'c-103-5', label: 'Computer Fee', amount: 350, frequency: 'monthly' },
    ],
  },
  {
    id: 'FS-104',
    name: 'Senior Secondary Science Plan',
    classStart: 11,
    classEnd: 12,
    academicYear: '2025-2026',
    status: 'active',
    components: [
      { rowId: 'c-104-1', label: 'Tuition Fee', amount: 28000, frequency: 'term-wise' },
      { rowId: 'c-104-2', label: 'Admission Fee', amount: 8000, frequency: 'one-time' },
      { rowId: 'c-104-3', label: 'Laboratory Fee', amount: 2500, frequency: 'term-wise' },
      { rowId: 'c-104-4', label: 'Examination Fee', amount: 2000, frequency: 'term-wise' },
      { rowId: 'c-104-5', label: 'Miscellaneous Fee', amount: 600, frequency: 'term-wise' },
    ],
  },
  {
    id: 'FS-105',
    name: 'Senior Secondary Commerce Plan',
    classStart: 11,
    classEnd: 12,
    academicYear: '2025-2026',
    status: 'draft',
    components: [
      { rowId: 'c-105-1', label: 'Tuition Fee', amount: 25000, frequency: 'term-wise' },
      { rowId: 'c-105-2', label: 'Admission Fee', amount: 8000, frequency: 'one-time' },
      { rowId: 'c-105-3', label: 'Examination Fee', amount: 2000, frequency: 'term-wise' },
      { rowId: 'c-105-4', label: 'Miscellaneous Fee', amount: 600, frequency: 'term-wise' },
    ],
  },
  {
    id: 'FS-106',
    name: 'Hostel Boarding Plan',
    classStart: 6,
    classEnd: 12,
    academicYear: '2025-2026',
    status: 'active',
    components: [
      { rowId: 'c-106-1', label: 'Hostel Fee', amount: 35000, frequency: 'term-wise' },
      { rowId: 'c-106-2', label: 'Mess Charges', amount: 4000, frequency: 'monthly' },
      { rowId: 'c-106-3', label: 'Admission Fee', amount: 5000, frequency: 'one-time' },
    ],
  },
  {
    id: 'FS-100',
    name: 'Primary Wing Legacy Plan',
    classStart: 1,
    classEnd: 5,
    academicYear: '2024-2025',
    status: 'archived',
    components: [
      { rowId: 'c-100-1', label: 'Tuition Fee', amount: 13500, frequency: 'term-wise' },
      { rowId: 'c-100-2', label: 'Admission Fee', amount: 4500, frequency: 'one-time' },
      { rowId: 'c-100-3', label: 'Library Fee', amount: 450, frequency: 'term-wise' },
    ],
  },
]

function classRangeLabel(classStart, classEnd) {
  return classStart === classEnd ? `Class ${classStart}` : `Class ${classStart}-${classEnd}`
}

function decorateStructure(structure) {
  return {
    ...structure,
    classRange: classRangeLabel(structure.classStart, structure.classEnd),
    componentCount: structure.components.length,
    totalAnnualFee: computeAnnualTotal(structure.components),
  }
}

export async function fetchFeeStructures() {
  await delay()
  return FEE_STRUCTURES.map(decorateStructure)
}

export async function createFeeStructure(payload) {
  await delay(700)
  structureCounter += 1
  const structure = {
    id: `FS-${structureCounter}`,
    name: payload.name,
    classStart: Number(payload.classStart),
    classEnd: Number(payload.classEnd),
    academicYear: payload.academicYear,
    status: 'draft',
    components: payload.components.map((component) => ({
      rowId: component.rowId,
      label: component.label,
      amount: Number(component.amount) || 0,
      frequency: component.frequency,
    })),
  }
  FEE_STRUCTURES.unshift(structure)
  return decorateStructure(structure)
}

export async function updateFeeStructureStatus(id, status) {
  await delay(400)
  const structure = FEE_STRUCTURES.find((item) => item.id === id)
  if (!structure) throw new Error('Fee structure not found')
  structure.status = status
  return decorateStructure(structure)
}

// ---------------------------------------------------------------------------
// Bulk Assignment
// ---------------------------------------------------------------------------

export const TOTAL_STUDENTS = 1450

const CLASS_STRENGTH = {
  1: 118, 2: 120, 3: 115, 4: 122, 5: 119,
  6: 128, 7: 124, 8: 132, 9: 135, 10: 130,
  11: 78, 12: 74,
}

let batchCounter = 306

const ASSIGNMENT_BATCHES = [
  { id: 'AB-301', templateId: 'FS-102', templateName: 'Middle School Standard Plan', targetDescription: 'Class 6 - Section A', studentsAffected: 42, assignedDate: '2026-07-20', status: 'completed' },
  { id: 'AB-300', templateId: 'FS-104', templateName: 'Senior Secondary Science Plan', targetDescription: 'Class 11 - Section A', studentsAffected: 38, assignedDate: '2026-07-18', status: 'completed' },
  { id: 'AB-299', templateId: 'FS-106', templateName: 'Hostel Boarding Plan', targetDescription: 'Class 9 - Section B', studentsAffected: 25, assignedDate: '2026-07-15', status: 'completed' },
  { id: 'AB-298', templateId: 'FS-103', templateName: 'High School Standard Plan', targetDescription: 'Class 10 - All Sections', studentsAffected: 130, assignedDate: '2026-07-10', status: 'completed' },
  { id: 'AB-297', templateId: 'FS-101', templateName: 'Primary Wing Standard Plan', targetDescription: 'Class 3 - Section C', studentsAffected: 40, assignedDate: '2026-07-05', status: 'in-progress' },
  { id: 'AB-296', templateId: 'FS-105', templateName: 'Senior Secondary Commerce Plan', targetDescription: 'Class 12 - Section A', studentsAffected: 33, assignedDate: '2026-06-28', status: 'failed' },
]

export async function fetchAssignmentBatches() {
  await delay()
  return [...ASSIGNMENT_BATCHES]
}

export async function previewAssignment({ classId, section }) {
  await delay(350)
  const strength = CLASS_STRENGTH[Number(classId)] ?? 0
  if (!classId) return 0
  return section ? Math.round(strength / 3) : strength
}

export async function createAssignmentBatch(payload) {
  await delay(900)
  const template = FEE_STRUCTURES.find((item) => item.id === payload.templateId)
  batchCounter += 1
  const status = Math.random() > 0.12 ? 'completed' : 'in-progress'
  const batch = {
    id: `AB-${batchCounter}`,
    templateId: payload.templateId,
    templateName: template?.name ?? 'Unknown Template',
    targetDescription: payload.targetDescription,
    studentsAffected: payload.studentsAffected,
    assignedDate: new Date().toISOString().slice(0, 10),
    status,
  }
  ASSIGNMENT_BATCHES.unshift(batch)
  return batch
}

// ---------------------------------------------------------------------------
// Scholarships & Discounts
// ---------------------------------------------------------------------------

const SCHOLARSHIP_PROGRAMS = [
  { id: 'SP-1', name: 'Merit Scholarship - Academic Excellence', type: 'merit', discountType: 'percentage', discountValue: 25, activeRecipients: 34, budgetAllocated: 1200000, budgetUsed: 850000, status: 'active' },
  { id: 'SP-2', name: 'Need-Based Fee Assistance', type: 'need-based', discountType: 'percentage', discountValue: 40, activeRecipients: 58, budgetAllocated: 2000000, budgetUsed: 1450000, status: 'active' },
  { id: 'SP-3', name: 'Sibling Discount Program', type: 'sibling', discountType: 'fixed', discountValue: 8000, activeRecipients: 76, budgetAllocated: 900000, budgetUsed: 608000, status: 'active' },
  { id: 'SP-4', name: 'Staff Ward Concession', type: 'staff', discountType: 'percentage', discountValue: 50, activeRecipients: 21, budgetAllocated: 600000, budgetUsed: 410000, status: 'active' },
  { id: 'SP-5', name: 'Sports Excellence Scholarship', type: 'sports', discountType: 'fixed', discountValue: 15000, activeRecipients: 14, budgetAllocated: 350000, budgetUsed: 210000, status: 'active' },
  { id: 'SP-6', name: 'Alumni Legacy Grant', type: 'merit', discountType: 'fixed', discountValue: 5000, activeRecipients: 6, budgetAllocated: 100000, budgetUsed: 30000, status: 'inactive' },
]

const SCHOLARSHIP_APPLICATIONS = [
  { id: 'SA-2101', studentName: 'Aarav Nair', className: 'Class 8', programId: 'SP-1', programName: 'Merit Scholarship - Academic Excellence', requestedAmount: 12000, status: 'pending', appliedDate: '2026-07-21' },
  { id: 'SA-2102', studentName: 'Diya Kulkarni', className: 'Class 6', programId: 'SP-2', programName: 'Need-Based Fee Assistance', requestedAmount: 18000, status: 'pending', appliedDate: '2026-07-20' },
  { id: 'SA-2103', studentName: 'Kabir Menon', className: 'Class 10', programId: 'SP-3', programName: 'Sibling Discount Program', requestedAmount: 8000, status: 'pending', appliedDate: '2026-07-19' },
  { id: 'SA-2104', studentName: 'Sanya Kapoor', className: 'Class 9', programId: 'SP-5', programName: 'Sports Excellence Scholarship', requestedAmount: 15000, status: 'pending', appliedDate: '2026-07-18' },
  { id: 'SA-2105', studentName: 'Ishita Rao', className: 'Class 7', programId: 'SP-4', programName: 'Staff Ward Concession', requestedAmount: 9500, status: 'pending', appliedDate: '2026-07-17' },
  { id: 'SA-2106', studentName: 'Reyansh Bhat', className: 'Class 11', programId: 'SP-1', programName: 'Merit Scholarship - Academic Excellence', requestedAmount: 14000, status: 'approved', appliedDate: '2026-07-12' },
  { id: 'SA-2107', studentName: 'Saanvi Joshi', className: 'Class 6', programId: 'SP-2', programName: 'Need-Based Fee Assistance', requestedAmount: 16000, status: 'approved', appliedDate: '2026-07-10' },
  { id: 'SA-2108', studentName: 'Arjun Reddy', className: 'Class 8', programId: 'SP-3', programName: 'Sibling Discount Program', requestedAmount: 8000, status: 'rejected', appliedDate: '2026-07-08' },
]

export async function fetchScholarshipPrograms() {
  await delay()
  return SCHOLARSHIP_PROGRAMS.map((program) => ({ ...program }))
}

export async function fetchScholarshipApplications() {
  await delay()
  return [...SCHOLARSHIP_APPLICATIONS]
}

export async function approveApplication(id) {
  await delay(500)
  const application = SCHOLARSHIP_APPLICATIONS.find((item) => item.id === id)
  if (!application) throw new Error('Application not found')
  application.status = 'approved'
  const program = SCHOLARSHIP_PROGRAMS.find((item) => item.id === application.programId)
  if (program) {
    program.activeRecipients += 1
    program.budgetUsed = Math.min(program.budgetAllocated, program.budgetUsed + application.requestedAmount)
  }
  return { application: { ...application }, program: program ? { ...program } : null }
}

export async function rejectApplication(id) {
  await delay(500)
  const application = SCHOLARSHIP_APPLICATIONS.find((item) => item.id === id)
  if (!application) throw new Error('Application not found')
  application.status = 'rejected'
  return { ...application }
}

// ---------------------------------------------------------------------------
// Fee Adjustments (cross-student approval queue)
// ---------------------------------------------------------------------------

const ADJUSTMENT_REQUESTS = [
  { id: 'ADJ-501', studentName: 'Myra Desai', className: 'Class 4', section: 'B', adjustmentType: 'waiver', amount: 3500, reason: 'Family medical emergency', requestedBy: 'Kavita Sharma', status: 'pending', date: '2026-07-22' },
  { id: 'ADJ-502', studentName: 'Vihaan Pillai', className: 'Class 9', section: 'B', adjustmentType: 'charge', amount: 1200, reason: 'Damaged lab equipment - replacement charge', requestedBy: 'Front Office - Meera Nair', status: 'pending', date: '2026-07-21' },
  { id: 'ADJ-503', studentName: 'Aditya Kulkarni', className: 'Class 10', section: 'A', adjustmentType: 'correction', amount: 500, reason: 'Duplicate library fee entry correction', requestedBy: 'Kavita Sharma', status: 'pending', date: '2026-07-20' },
  { id: 'ADJ-504', studentName: 'Ananya Iyer', className: 'Class 5', section: 'C', adjustmentType: 'waiver', amount: 6000, reason: 'Sibling already availing full waiver', requestedBy: 'Admin - Suresh Iyer', status: 'pending', date: '2026-07-19' },
  { id: 'ADJ-505', studentName: 'Rohan Verma', className: 'Class 12', section: 'A', adjustmentType: 'charge', amount: 2500, reason: 'Late re-admission processing fee', requestedBy: 'Kavita Sharma', status: 'pending', date: '2026-07-18' },
  { id: 'ADJ-506', studentName: 'Kiara Shah', className: 'Class 10', section: 'B', adjustmentType: 'waiver', amount: 4200, reason: 'Approved transport fee exemption', requestedBy: 'Kavita Sharma', status: 'approved', date: '2026-07-15' },
  { id: 'ADJ-507', studentName: 'Advait Rao', className: 'Class 7', section: 'C', adjustmentType: 'correction', amount: 800, reason: 'Incorrect class fee slab applied', requestedBy: 'Front Office - Meera Nair', status: 'approved', date: '2026-07-12' },
  { id: 'ADJ-508', studentName: 'Ishaan Verma', className: 'Class 8', section: 'B', adjustmentType: 'charge', amount: 1500, reason: 'Excursion charge shortfall', requestedBy: 'Admin - Suresh Iyer', status: 'rejected', date: '2026-07-09' },
  { id: 'ADJ-509', studentName: 'Meera Pillai', className: 'Class 11', section: 'B', adjustmentType: 'waiver', amount: 5000, reason: 'Merit-based partial waiver top-up', requestedBy: 'Kavita Sharma', status: 'approved', date: '2026-07-06' },
  { id: 'ADJ-510', studentName: 'Yash Kapoor', className: 'Class 9', section: 'A', adjustmentType: 'charge', amount: 900, reason: 'Uniform replacement charge', requestedBy: 'Front Office - Meera Nair', status: 'rejected', date: '2026-07-02' },
]

function applyAdjustmentFilters(rows, filters = {}) {
  const { status, adjustmentType } = filters
  return rows.filter((row) => {
    if (status && row.status !== status) return false
    if (adjustmentType && row.adjustmentType !== adjustmentType) return false
    return true
  })
}

export async function fetchAdjustmentRequests(filters) {
  await delay()
  return applyAdjustmentFilters(ADJUSTMENT_REQUESTS, filters)
}

export async function approveAdjustment(id) {
  await delay(500)
  const request = ADJUSTMENT_REQUESTS.find((item) => item.id === id)
  if (!request) throw new Error('Adjustment request not found')
  request.status = 'approved'
  return { ...request }
}

export async function rejectAdjustment(id) {
  await delay(500)
  const request = ADJUSTMENT_REQUESTS.find((item) => item.id === id)
  if (!request) throw new Error('Adjustment request not found')
  request.status = 'rejected'
  return { ...request }
}

export { ACCOUNTANT_NAME }
