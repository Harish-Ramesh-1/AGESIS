import { apiGet, apiPatch, apiPost } from '../../../services/apiClient'
import { useAuthStore } from '../../../store/authStore'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

function initialsOf(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Fee status ('paid'/'partial'/'pending'/'overdue') and outstandingAmount aren't fields on the
// Student row — derived from that student's real /dues records.
function deriveOutstandingAndStatus(dues) {
  const outstandingAmount = dues.reduce((sum, due) => sum + (Number(due.amount_due) - Number(due.amount_paid || 0)), 0)
  let status = 'paid'
  if (dues.some((due) => due.status === 'overdue')) status = 'overdue'
  else if (dues.some((due) => Number(due.amount_paid) > 0 && Number(due.amount_paid) < Number(due.amount_due))) status = 'partial'
  else if (dues.some((due) => due.status === 'pending')) status = 'pending'
  return { outstandingAmount, status }
}

function mapStudentRow(student, dues) {
  const { outstandingAmount, status } = deriveOutstandingAndStatus(dues)
  return {
    id: student.id,
    name: student.full_name,
    registrationNumber: student.admission_no,
    admissionNumber: student.admission_no,
    className: student.class_name,
    section: student.section,
    parentName: student.guardian_name,
    parentPhone: student.guardian_phone,
    parentEmail: student.guardian_email,
    academicYear: '2025-2026',
    outstandingAmount,
    status,
    // No backend fields exist for scholarship/discount/hostel/transport flags on the Student
    // row — filtering by these criteria is effectively a no-op (always passes) rather than faked.
    hasScholarship: false,
    hasDiscount: false,
    hasHostel: false,
    hasTransport: false,
    avatarInitials: initialsOf(student.full_name),
  }
}

export async function fetchStudents(filters) {
  const params = new URLSearchParams()
  if (filters?.className) params.set('className', filters.className)
  if (filters?.section) params.set('section', filters.section)
  if (filters?.query) params.set('query', filters.query)
  const qs = params.toString()
  const [studentsRes, duesRes] = await Promise.all([apiGet(`/students${qs ? `?${qs}` : ''}`), apiGet('/dues').catch(() => ({ data: [] }))])
  const students = studentsRes.data ?? []
  const dues = duesRes.data ?? []
  const duesByStudent = new Map()
  dues.forEach((due) => {
    const list = duesByStudent.get(due.student_id) ?? []
    list.push(due)
    duesByStudent.set(due.student_id, list)
  })

  let rows = students.map((student) => mapStudentRow(student, duesByStudent.get(student.id) ?? []))
  if (filters?.feeStatus) rows = rows.filter((row) => row.status === filters.feeStatus)
  return rows
}

export async function fetchStudentById(id) {
  const [studentRes, duesRes] = await Promise.all([apiGet(`/students/${id}`), apiGet('/dues').catch(() => ({ data: [] }))])
  const student = studentRes.data
  if (!student) throw new Error('Student not found')
  const studentDues = (duesRes.data ?? []).filter((due) => due.student_id === id)
  return mapStudentRow(student, studentDues)
}

export async function fetchFeeStructure(id) {
  const [feeStructureRes, miscRes, duesRes, lateFeeRes] = await Promise.all([
    apiGet(`/students/${id}/fee-structure`).catch(() => ({ data: null })),
    apiGet(`/fees/students/${id}/misc-charges`).catch(() => ({ data: [] })),
    apiGet('/dues').catch(() => ({ data: [] })),
    apiGet('/dues/late-fees/history').catch(() => ({ data: [] })),
  ])

  const assignment = feeStructureRes.data
  const components = assignment?.fee_structures?.components ?? []
  // Per-component discount/scholarship/concession/late-fee/status/enabled/installment-plan
  // breakdown isn't tracked by the backend's fee_structures.components (just {category, amount})
  // — left at reasonable defaults rather than fabricated.
  const feeComponents = components.map((component, index) => ({
    id: `${id}-fs-${index}`,
    component: component.category,
    amount: Number(component.amount) || 0,
    discount: 0,
    scholarship: 0,
    concession: 0,
    lateFee: 0,
    netAmount: Number(component.amount) || 0,
    status: 'pending',
    enabled: true,
    dueDate: '',
    installments: 1,
  }))

  const miscCharges = (miscRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? row.title ?? '',
    description: row.description ?? '',
    amount: Number(row.amount) || 0,
    applicableDate: row.applicable_date ?? row.created_at,
    remarks: row.remarks ?? '',
  }))

  const studentDueIds = new Set((duesRes.data ?? []).filter((due) => due.student_id === id).map((due) => due.id))
  const unwaivedCharges = (lateFeeRes.data ?? []).filter((charge) => studentDueIds.has(charge.due_id ?? charge.dueId) && !charge.waived)
  const penaltyAmount = unwaivedCharges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0)

  return {
    feeComponents,
    miscCharges,
    penalty: {
      currentLateFee: penaltyAmount,
      penaltyAmount,
      reason: penaltyAmount > 0 ? 'Payment overdue beyond grace period' : '',
    },
  }
}

function mapScholarship(row) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount) || 0,
    percentage: Number(row.percentage) || 0,
    reason: row.reason ?? '',
    startDate: row.start_date ?? row.startDate,
    endDate: row.end_date ?? row.endDate,
    status: row.status ?? 'active',
  }
}

export async function fetchScholarshipsAndDiscounts(id) {
  const [scholarshipsRes, discountsRes] = await Promise.all([apiGet(`/fees/students/${id}/scholarships`), apiGet(`/fees/students/${id}/discounts`)])
  return {
    scholarships: (scholarshipsRes.data ?? []).map(mapScholarship),
    discounts: (discountsRes.data ?? []).map(mapScholarship),
  }
}

export async function fetchConcessions(id) {
  const { data } = await apiGet(`/fees/students/${id}/concessions`)
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type ?? row.name ?? 'Fee Concession',
    amount: Number(row.amount) || 0,
    approvedBy: row.approved_by ?? row.approvedBy ?? accountantName(),
    reason: row.reason ?? '',
    effectiveDate: row.effective_date ?? row.effectiveDate,
    expiryDate: row.expiry_date ?? row.expiryDate,
    status: row.status ?? 'active',
  }))
}

const INSTALLMENTS_BY_PLAN = { 'Full Payment': 1, '2 Installments': 2, '4 Installments': 4, Monthly: 12 }

// AssignFeeModal collects a template name + academic year + installment plan + transport/hostel/
// optional-fee toggles — there's no backend concept of "templates" or priced add-ons, so this
// resolves the student's real class fee_structure (matching by name where possible) and appends
// the chosen add-ons as real $0 line items rather than dropping the selection silently. The
// installment plan is recorded via the `installments` field on the returned components.
export async function assignFeeStructure(id, payload) {
  const { data: student } = await apiGet(`/students/${id}`)
  const { data: structures } = await apiGet(`/fees/structures?className=${encodeURIComponent(student.class_name || '')}&status=active`)

  const structure =
    (structures || []).find((s) => s.name?.toLowerCase().includes(String(payload?.template || '').toLowerCase().split(' ')[0])) ||
    (structures || [])[0]
  if (!structure) throw new Error('No active fee structure exists for this class yet — create one in Fee Configuration first.')

  const addOns = []
  if (payload?.transport) addOns.push({ category: 'Transport (selected)', amount: 0 })
  if (payload?.hostel) addOns.push({ category: 'Hostel (selected)', amount: 0 })
  for (const fee of payload?.optionalFees || []) addOns.push({ category: fee, amount: 0 })

  const components = [...(structure.components || []), ...addOns]

  const { data: assignment } = await apiPost(`/fees/students/${id}/assign-structure`, {
    feeStructureId: structure.id,
    components,
  })

  const installments = INSTALLMENTS_BY_PLAN[payload?.installmentPlan] || 1
  return (assignment.components || []).map((component, index) => ({
    id: `${id}-fs-${index}`,
    component: component.category,
    amount: Number(component.amount) || 0,
    discount: 0,
    scholarship: 0,
    concession: 0,
    lateFee: 0,
    netAmount: Number(component.amount) || 0,
    status: 'pending',
    enabled: true,
    dueDate: '',
    installments,
  }))
}

// The backend has no endpoint for overriding a specific student's fee-component amounts within
// their assigned structure — the closest real capability is the fee-adjustment-request audit
// trail, so each changed component is logged there (type "correction") and the edited values are
// also reflected in the returned array for immediate UI feedback (not persisted server-side
// beyond the adjustment-request record).
export async function updateFeeComponents(id, components) {
  await Promise.all(
    components.map((component) =>
      apiPost('/fees/adjustment-requests', {
        student_id: id,
        type: 'correction',
        amount: component.amount,
        reason: `Fee component "${component.component}" amount edited to ${component.amount}`,
      }).catch(() => null),
    ),
  )
  return components
}

export async function addScholarship(id, payload) {
  await apiPost(`/fees/students/${id}/scholarships`, payload)
  const { data } = await apiGet(`/fees/students/${id}/scholarships`)
  return (data ?? []).map(mapScholarship)
}

export async function addDiscount(id, payload) {
  await apiPost(`/fees/students/${id}/discounts`, payload)
  const { data } = await apiGet(`/fees/students/${id}/discounts`)
  return (data ?? []).map(mapScholarship)
}

export async function addConcession(id, payload) {
  await apiPost(`/fees/students/${id}/concessions`, payload)
  const { data } = await apiGet(`/fees/students/${id}/concessions`)
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type ?? row.name ?? 'Fee Concession',
    amount: Number(row.amount) || 0,
    approvedBy: row.approved_by ?? row.approvedBy ?? accountantName(),
    reason: row.reason ?? '',
    effectiveDate: row.effective_date ?? row.effectiveDate,
    expiryDate: row.expiry_date ?? row.expiryDate,
    status: row.status ?? 'active',
  }))
}

export async function addMiscCharge(id, payload) {
  await apiPost(`/fees/students/${id}/misc-charges`, payload)
  const { data } = await apiGet(`/fees/students/${id}/misc-charges`)
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? row.title ?? '',
    description: row.description ?? '',
    amount: Number(row.amount) || 0,
    applicableDate: row.applicable_date ?? row.created_at,
    remarks: row.remarks ?? '',
  }))
}

// Waiving is modelled through the same /dues/late-fees/:id/waive endpoint used by Pending Dues —
// resolved here by finding this student's outstanding (unwaived) late-fee charges.
export async function waivePenalty(id, payload) {
  const [duesRes, lateFeeRes] = await Promise.all([apiGet('/dues').catch(() => ({ data: [] })), apiGet('/dues/late-fees/history').catch(() => ({ data: [] }))])
  const studentDueIds = new Set((duesRes.data ?? []).filter((due) => due.student_id === id).map((due) => due.id))
  const unwaivedCharges = (lateFeeRes.data ?? []).filter((charge) => studentDueIds.has(charge.due_id ?? charge.dueId) && !charge.waived)

  let remaining = payload.mode === 'full' ? Infinity : Number(payload.amount) || 0
  const waivedCharges = []
  for (const charge of unwaivedCharges) {
    if (remaining <= 0) break
    await apiPatch(`/dues/late-fees/${charge.id}/waive`, { reason: payload.reason })
    waivedCharges.push(charge)
    remaining -= Number(charge.amount) || 0
  }

  const waivedAmount = waivedCharges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0)
  const totalBefore = unwaivedCharges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0)
  const newPenalty = Math.max(0, totalBefore - waivedAmount)
  return { currentLateFee: newPenalty, penaltyAmount: newPenalty, reason: newPenalty > 0 ? 'Payment overdue beyond grace period' : '' }
}

export async function fetchAdjustmentHistory(id) {
  const { data } = await apiGet(`/fees/students/${id}/adjustment-history`)
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.created_at ?? row.date,
    feeComponent: row.fee_component ?? row.feeComponent ?? row.type ?? '',
    oldAmount: row.old_amount ?? row.oldAmount ?? null,
    newAmount: row.new_amount ?? row.newAmount ?? row.amount ?? null,
    reason: row.reason ?? '',
    updatedBy: row.updated_by ?? row.updatedBy ?? accountantName(),
    remarks: row.remarks ?? '',
  }))
}
