import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'
import { FEE_HEAD_KEYS, FEE_HEAD_LABEL, SCHOLARSHIP_TYPE_OPTIONS } from '../utils/feeStructureUtils'

const FEE_HEAD_LABEL_TO_KEY = Object.fromEntries(
  Object.entries(FEE_HEAD_LABEL).map(([key, label]) => [label.toLowerCase(), key]),
)

// ---------------------------------------------------------------------------
// Fee Structure Templates (institution-wide policy — defines what accountants assign)
// ---------------------------------------------------------------------------

function componentsToAmounts(components) {
  const amounts = Object.fromEntries(FEE_HEAD_KEYS.map((key) => [key, 0]))
  ;(components || []).forEach((component) => {
    const key = FEE_HEAD_LABEL_TO_KEY[String(component.category || '').toLowerCase()]
    if (key) amounts[key] = Number(component.amount) || 0
  })
  return amounts
}

function amountsToComponents(amounts = {}) {
  return FEE_HEAD_KEYS.filter((key) => Number(amounts[key]) > 0).map((key) => ({
    category: FEE_HEAD_LABEL[key],
    amount: Number(amounts[key]) || 0,
  }))
}

function mapStructure(row) {
  return {
    id: row.id,
    name: row.name,
    classRange: row.class_name ? `Class ${row.class_name}` : 'All Classes',
    academicYear: row.academic_year_id || '—',
    status: row.status,
    amounts: componentsToAmounts(row.components),
    totalAnnualFee: Number(row.total_amount) || 0,
  }
}

export async function fetchFeeStructures() {
  const { data } = await apiGet('/fees/structures')
  return (data || []).map(mapStructure)
}

export async function createFeeStructure(payload) {
  const { data } = await apiPost('/fees/structures', {
    name: payload.name,
    class_name: payload.classRange,
    academic_year_id: null,
    components: amountsToComponents(payload.amounts),
  })
  return mapStructure(data)
}

export async function updateFeeStructure(id, payload) {
  const patch = {}
  if (payload.name !== undefined) patch.name = payload.name
  if (payload.classRange !== undefined) patch.class_name = payload.classRange
  if (payload.amounts !== undefined) patch.components = amountsToComponents(payload.amounts)
  const { data } = await apiPatch(`/fees/structures/${id}`, patch)
  return mapStructure(data)
}

export async function setFeeStructureStatus(id, status) {
  const { data } = await apiPatch(`/fees/structures/${id}/status`, { status })
  return mapStructure(data)
}

// ---------------------------------------------------------------------------
// Bulk Assignment
// ---------------------------------------------------------------------------

/**
 * Live-updated student count used for the "% of students covered" summary tile
 * on the Assign Fees page. That page imports this as a plain (synchronous)
 * constant rather than reading from a store, so it can only be refreshed
 * asynchronously after this module loads — it starts at a safe non-zero
 * fallback and is corrected from `/dashboard/summary` shortly after.
 */
export let TOTAL_STUDENTS = 1000

apiGet('/dashboard/summary')
  .then(({ data }) => {
    TOTAL_STUDENTS = Number(data?.studentCount) || TOTAL_STUDENTS
  })
  .catch(() => {
    // best-effort only — keep the fallback value if this fails
  })

async function getStructureMap() {
  const { data } = await apiGet('/fees/structures')
  const map = {}
  ;(data || []).forEach((row) => {
    map[row.id] = { name: row.name, academicYear: row.academic_year_id || '—' }
  })
  return map
}

function parseTargetDescription(targetDescription) {
  const match = /^Class\s+(.+?)\s+-\s+(?:Section\s+(.+)|All Sections)$/.exec(targetDescription || '')
  if (!match) return { classId: undefined, section: undefined }
  return { classId: match[1], section: match[2] }
}

function mapAssignmentBatch(row, structureMap = {}) {
  const structure = structureMap[row.fee_structure_id]
  const targetDescription = `Class ${row.class_name} - ${row.section ? `Section ${row.section}` : 'All Sections'}`
  return {
    id: row.id,
    structureId: row.fee_structure_id,
    structureName: structure?.name ?? 'Unknown Structure',
    targetDescription,
    academicYear: structure?.academicYear ?? '—',
    studentsAffected: Number(row.student_count) || 0,
    assignedDate: row.created_at ? row.created_at.slice(0, 10) : '',
    status: row.status === 'processing' ? 'in-progress' : row.status,
  }
}

export async function fetchAssignmentBatches() {
  const [{ data: batches }, structureMap] = await Promise.all([apiGet('/fees/assignment-batches'), getStructureMap()])
  return (batches || []).map((row) => mapAssignmentBatch(row, structureMap))
}

export async function previewAssignment({ classId, section }) {
  if (!classId) return 0
  const { data } = await apiPost('/fees/assignment-batches/preview', { classId, section: section || undefined })
  return Number(data?.studentCount) || 0
}

export async function createAssignmentBatch(payload) {
  const { classId, section } = parseTargetDescription(payload.targetDescription)
  const [{ data }, structureMap] = await Promise.all([
    apiPost('/fees/assignment-batches', { feeStructureId: payload.structureId, classId, section }),
    getStructureMap(),
  ])
  return mapAssignmentBatch(data, structureMap)
}

// ---------------------------------------------------------------------------
// Scholarships & Discount Policies
// ---------------------------------------------------------------------------

function encodeCriteria(type, eligibility) {
  return `[${type}] ${eligibility || ''}`.trim()
}

function decodeCriteria(criteria) {
  const match = /^\[(\S+)\]\s*(.*)$/.exec(criteria || '')
  if (match && SCHOLARSHIP_TYPE_OPTIONS.includes(match[1])) {
    return { type: match[1], eligibility: match[2] }
  }
  return { type: SCHOLARSHIP_TYPE_OPTIONS[0], eligibility: criteria || '' }
}

function mapDiscountType(discountType) {
  return discountType === 'percent' ? 'percentage' : 'fixed'
}

function mapDiscountTypeToBackend(discountType) {
  return discountType === 'percentage' ? 'percent' : 'flat'
}

async function getRecipientCounts() {
  const { data } = await apiGet('/fees/scholarships/recipients')
  const counts = {}
  ;(data || []).forEach((row) => {
    if (row.status === 'approved') counts[row.policy_id] = (counts[row.policy_id] || 0) + 1
  })
  return counts
}

function mapPolicy(row, recipientCounts = {}) {
  const { type, eligibility } = decodeCriteria(row.criteria)
  return {
    id: row.id,
    name: row.name,
    type,
    discountType: mapDiscountType(row.discount_type),
    discountValue: Number(row.discount_value) || 0,
    eligibility,
    activeRecipients: recipientCounts[row.id] || 0,
    active: row.status === 'active',
  }
}

export async function fetchScholarshipPolicies() {
  const [{ data: policies }, recipientCounts] = await Promise.all([
    apiGet('/fees/scholarships/policies'),
    getRecipientCounts(),
  ])
  return (policies || []).map((row) => mapPolicy(row, recipientCounts))
}

export async function createScholarshipPolicy(payload) {
  const { data } = await apiPost('/fees/scholarships/policies', {
    name: payload.name,
    criteria: encodeCriteria(payload.type, payload.eligibility),
    discount_type: mapDiscountTypeToBackend(payload.discountType),
    discount_value: Number(payload.discountValue) || 0,
  })
  return mapPolicy(data, {})
}

export async function toggleScholarshipPolicy(id) {
  const [{ data }, recipientCounts] = await Promise.all([
    apiPatch(`/fees/scholarships/policies/${id}/toggle`),
    getRecipientCounts(),
  ])
  return mapPolicy(data, recipientCounts)
}

export async function fetchScholarshipRecipients() {
  const { data } = await apiGet('/fees/scholarships/recipients')
  return (data || []).map((row) => ({
    id: row.id,
    studentName: row.students?.full_name || '—',
    className: row.students?.class_name ? `Class ${row.students.class_name}` : '—',
    section: '—',
    scholarshipName: row.scholarship_policies?.name || row.name || '—',
    discountAmount: Number(row.amount) || 0,
  }))
}

// ---------------------------------------------------------------------------
// Fee Adjustments (cross-student, awaiting admin sign-off)
// ---------------------------------------------------------------------------

function mapAdjustmentRequest(row) {
  return {
    id: row.id,
    studentName: row.students?.full_name || '—',
    className: '—',
    section: '—',
    adjustmentType: row.type,
    amount: Number(row.amount) || 0,
    reason: row.reason || '',
    requestedBy: row.requested_by || '—',
    status: row.status,
    date: row.created_at,
  }
}

export async function fetchAdjustmentRequests(filters = {}) {
  const query = filters.status ? `?status=${encodeURIComponent(filters.status)}` : ''
  const { data } = await apiGet(`/fees/adjustment-requests${query}`)
  const rows = (data || []).map(mapAdjustmentRequest)
  if (!filters.adjustmentType) return rows
  return rows.filter((row) => row.adjustmentType === filters.adjustmentType)
}

export async function approveAdjustment(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'approved' })
  return mapAdjustmentRequest(data)
}

export async function rejectAdjustment(id) {
  const { data } = await apiPatch(`/fees/adjustment-requests/${id}/decision`, { decision: 'rejected' })
  return mapAdjustmentRequest(data)
}

// ---------------------------------------------------------------------------
// Fee Categories (master list of fee heads)
// ---------------------------------------------------------------------------

function mapCategory(row, fallback = {}) {
  return {
    id: row.id,
    name: row.name,
    description: fallback.description ?? '',
    defaultAmount: fallback.defaultAmount ?? 0,
    taxable: Boolean(row.taxable),
  }
}

export async function fetchFeeCategories() {
  const { data } = await apiGet('/fees/categories')
  return (data || []).map((row) => mapCategory(row))
}

export async function createFeeCategory(payload) {
  const { data } = await apiPost('/fees/categories', {
    name: payload.name,
    taxable: Boolean(payload.taxable),
    tax_rate: 0,
  })
  // fee_categories has no description/defaultAmount columns on the backend — echo back
  // what was submitted so the new row reads correctly until the next refetch.
  return mapCategory(data, { description: payload.description, defaultAmount: Number(payload.defaultAmount) || 0 })
}

export async function toggleFeeCategoryTaxable(id) {
  const { data: categories } = await apiGet('/fees/categories')
  const current = (categories || []).find((item) => item.id === id)
  const { data } = await apiPatch(`/fees/categories/${id}`, { taxable: !(current?.taxable) })
  return mapCategory(data)
}
