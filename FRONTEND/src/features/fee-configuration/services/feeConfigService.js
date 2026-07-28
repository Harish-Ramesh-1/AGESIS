import { apiGet, apiPatch, apiPost } from '../../../services/apiClient'
import { computeAnnualTotal } from '../utils/feeConfigUtils'
import { useAuthStore } from '../../../store/authStore'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

function classRangeLabel(classStart, classEnd) {
  return classStart === classEnd ? `Class ${classStart}` : `Class ${classStart}-${classEnd}`
}

// Backend fee_structures rows are academic-year-tagged but the year isn't echoed back on
// GET /fees/structures — approximated from the row's creation date using a June academic-year
// boundary, since no better source is available.
function academicYearFromDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1
  return `${year}-${year + 1}`
}

// ---------------------------------------------------------------------------
// Fee Structure Templates
// ---------------------------------------------------------------------------
// The backend ties one fee_structures row to a single class_name (no class-range concept), while
// this UI lets an accountant define one template across a class range. A range is therefore
// created as one backend row per class (sharing the same `name`), and fetchFeeStructures groups
// rows back into range-shaped cards by name. The aggregated `id` is a "|"-joined list of the
// underlying row ids so status updates and assignment can resolve back to real rows.

function decorateGroup(name, group) {
  const classNumbers = group.map((row) => Number(row.class_name)).filter((n) => !Number.isNaN(n))
  const classStart = classNumbers.length ? Math.min(...classNumbers) : 0
  const classEnd = classNumbers.length ? Math.max(...classNumbers) : classStart
  const components = group[0]?.components ?? []
  const status = group.some((row) => row.status === 'active') ? 'active' : group.every((row) => row.status === 'archived') ? 'archived' : 'draft'
  const totalAnnualFee = group.length
    ? Math.round(group.reduce((sum, row) => sum + (Number(row.total_amount) || computeAnnualTotal(row.components ?? [])), 0) / group.length)
    : 0
  return {
    id: group.map((row) => row.id).join('|'),
    name,
    classStart,
    classEnd,
    classRange: classRangeLabel(classStart, classEnd),
    academicYear: academicYearFromDate(group[0]?.created_at),
    status,
    components,
    componentCount: components.length,
    totalAnnualFee,
  }
}

export async function fetchFeeStructures() {
  const { data } = await apiGet('/fees/structures')
  const groups = new Map()
  ;(data ?? []).forEach((row) => {
    const key = row.name
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  })
  return [...groups.entries()].map(([name, group]) => decorateGroup(name, group))
}

async function resolveAcademicYearId(label) {
  try {
    const { data } = await apiGet('/admin/school/academic-years')
    const match = (data ?? []).find((row) => row.name === label || row.label === label || row.year === label)
    return match?.id
  } catch {
    return undefined
  }
}

export async function createFeeStructure(payload) {
  const components = payload.components.map((component) => ({ category: component.label, amount: Number(component.amount) || 0 }))
  const academicYearId = await resolveAcademicYearId(payload.academicYear)
  const classStart = Number(payload.classStart)
  const classEnd = Number(payload.classEnd)
  const classNumbers = []
  for (let cls = classStart; cls <= classEnd; cls += 1) classNumbers.push(cls)

  const created = await Promise.all(
    classNumbers.map((classNum) =>
      apiPost('/fees/structures', {
        name: payload.name,
        class_name: String(classNum),
        academic_year_id: academicYearId,
        components,
      }).then((res) => res.data),
    ),
  )
  return decorateGroup(payload.name, created)
}

export async function updateFeeStructureStatus(id, status) {
  const memberIds = id.split('|')
  await Promise.all(memberIds.map((memberId) => apiPatch(`/fees/structures/${memberId}/status`, { status })))
  const structures = await fetchFeeStructures()
  return structures.find((row) => row.id === id) ?? structures.find((row) => row.name && memberIds.includes(row.id.split('|')[0]))
}

// ---------------------------------------------------------------------------
// Bulk Assignment
// ---------------------------------------------------------------------------

// The backend has no "total students" endpoint suitable for this KPI's denominator, and this
// constant is imported synchronously (not fetched) by AssignFees.jsx, so it can't be swapped for
// a live value without also changing that page — kept static and flagged here.
export const TOTAL_STUDENTS = 1450

function mapAssignmentBatch(row) {
  return {
    id: row.id,
    templateId: row.fee_structure_id ?? row.feeStructureId ?? '',
    templateName: row.fee_structures?.name ?? row.templateName ?? '',
    targetDescription: row.target_description ?? `Class ${row.class_id ?? row.classId ?? ''}${row.section ? ` - Section ${row.section}` : ' - All Sections'}`,
    studentsAffected: Number(row.students_affected ?? row.studentsAffected ?? row.student_count) || 0,
    assignedDate: (row.created_at ?? row.assignedDate ?? '').slice(0, 10),
    status: row.status ?? 'completed',
  }
}

export async function fetchAssignmentBatches() {
  const { data } = await apiGet('/fees/assignment-batches')
  return (data ?? []).map(mapAssignmentBatch)
}

export async function previewAssignment({ classId, section }) {
  if (!classId) return 0
  const { data } = await apiPost('/fees/assignment-batches/preview', { classId, section })
  return Number(data?.studentCount) || 0
}

// AssignFees.jsx only passes {templateId, targetDescription, studentsAffected} through to this
// function — classId/section aren't threaded through separately, so they're recovered by parsing
// the "Class X - Section Y" / "Class X - All Sections" string the page builds. Manual/individual-
// student targeting produces free text that can't be parsed this way, and the backend's
// POST /fees/assignment-batches only accepts classId/section — that mode throws a clear error
// instead of silently faking a batch.
function parseClassSection(targetDescription) {
  const sectionMatch = /^Class\s+(\S+)\s+-\s+Section\s+(\S+)/i.exec(targetDescription)
  if (sectionMatch) return { classId: sectionMatch[1], section: sectionMatch[2] }
  const allSectionsMatch = /^Class\s+(\S+)\s+-\s+All Sections/i.exec(targetDescription)
  if (allSectionsMatch) return { classId: allSectionsMatch[1], section: undefined }
  return null
}

export async function createAssignmentBatch(payload) {
  const target = parseClassSection(payload.targetDescription)
  if (!target) {
    throw new Error('Manual/individual-student targeting isn\'t supported by the backend — choose Class / Section targeting instead.')
  }
  const memberIds = String(payload.templateId).split('|')
  let feeStructureId = memberIds[0]
  if (memberIds.length > 1) {
    const { data } = await apiGet('/fees/structures')
    const match = (data ?? []).find((row) => memberIds.includes(row.id) && String(row.class_name) === String(target.classId))
    feeStructureId = match?.id ?? memberIds[0]
  }
  const { data } = await apiPost('/fees/assignment-batches', { feeStructureId, classId: target.classId, section: target.section })
  return {
    ...mapAssignmentBatch(data ?? {}),
    templateId: payload.templateId,
    targetDescription: payload.targetDescription,
    studentsAffected: Number(data?.students_affected) || payload.studentsAffected,
  }
}

// ---------------------------------------------------------------------------
// Scholarships & Discounts
// ---------------------------------------------------------------------------

const SCHOLARSHIP_TYPE_KEYWORDS = { merit: 'merit', 'need-based': 'need', sibling: 'sibling', staff: 'staff', sports: 'sports' }

// Backend scholarship_policies have a free-text `criteria` field, not the fixed type enum this UI
// badges against — best-effort keyword match against the criteria text, defaulting to "merit".
function inferScholarshipType(criteria) {
  const text = (criteria ?? '').toLowerCase()
  const found = Object.entries(SCHOLARSHIP_TYPE_KEYWORDS).find(([, keyword]) => text.includes(keyword))
  return found?.[0] ?? 'merit'
}

export async function fetchScholarshipPrograms() {
  const [policiesRes, recipientsRes] = await Promise.all([apiGet('/fees/scholarships/policies'), apiGet('/fees/scholarships/recipients').catch(() => ({ data: [] }))])
  const policies = policiesRes.data ?? []
  const recipients = recipientsRes.data ?? []
  const recipientCounts = new Map()
  recipients.forEach((row) => {
    const key = row.policy_id ?? row.scholarship_policy_id ?? row.scholarship_policies?.id
    if (!key) return
    recipientCounts.set(key, (recipientCounts.get(key) ?? 0) + 1)
  })
  return policies.map((policy) => ({
    id: policy.id,
    name: policy.name,
    type: inferScholarshipType(policy.criteria),
    discountType: policy.discount_type === 'percent' ? 'percentage' : 'fixed',
    discountValue: Number(policy.discount_value) || 0,
    activeRecipients: recipientCounts.get(policy.id) ?? 0,
    // No budget-tracking entity exists on the backend for scholarship policies — not fabricated.
    budgetAllocated: 0,
    budgetUsed: 0,
    status: policy.active === false ? 'inactive' : 'active',
  }))
}

function mapAdjustmentRequest(row) {
  return {
    id: row.id,
    studentName: row.students?.full_name ?? '',
    className: `Class ${row.students?.class_name ?? ''}`,
    programId: row.policy_id ?? '',
    programName: row.reason ?? '',
    requestedAmount: Number(row.amount) || 0,
    status: row.status ?? row.decision ?? 'pending',
    appliedDate: (row.created_at ?? row.date ?? '').slice(0, 10),
  }
}

// The backend has no dedicated "scholarship application" entity separate from the general fee
// adjustment-request queue — approximated via GET/PATCH /fees/adjustment-requests filtered to
// type === 'scholarship'. Budget/recipient-count updates on approval aren't modeled server-side.
export async function fetchScholarshipApplications() {
  const { data } = await apiGet('/fees/adjustment-requests')
  return (data ?? []).filter((row) => (row.type ?? '').toLowerCase() === 'scholarship').map(mapAdjustmentRequest)
}

export async function approveApplication(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'approved' })
  return { application: mapAdjustmentRequest(data ?? { id }), program: null }
}

export async function rejectApplication(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'rejected' })
  return mapAdjustmentRequest(data ?? { id })
}

// ---------------------------------------------------------------------------
// Fee Adjustments (cross-student approval queue)
// ---------------------------------------------------------------------------

function mapCrossStudentAdjustment(row) {
  return {
    id: row.id,
    studentName: row.students?.full_name ?? '',
    className: `Class ${row.students?.class_name ?? ''}`,
    section: row.students?.section ?? '',
    adjustmentType: row.type,
    amount: Number(row.amount) || 0,
    reason: row.reason ?? '',
    requestedBy: row.requested_by ?? row.created_by ?? accountantName(),
    status: row.status ?? row.decision ?? 'pending',
    date: (row.created_at ?? row.date ?? '').slice(0, 10),
  }
}

export async function fetchAdjustmentRequests(filters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  const qs = params.toString()
  const { data } = await apiGet(`/fees/adjustment-requests${qs ? `?${qs}` : ''}`)
  let rows = (data ?? []).filter((row) => (row.type ?? '').toLowerCase() !== 'scholarship').map(mapCrossStudentAdjustment)
  if (filters?.adjustmentType) rows = rows.filter((row) => row.adjustmentType === filters.adjustmentType)
  return rows
}

export async function approveAdjustment(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'approved' })
  return mapCrossStudentAdjustment(data ?? { id })
}

export async function rejectAdjustment(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'rejected' })
  return mapCrossStudentAdjustment(data ?? { id })
}