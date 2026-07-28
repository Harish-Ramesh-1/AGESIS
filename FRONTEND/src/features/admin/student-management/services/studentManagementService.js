import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

export const SECTIONS = ['A', 'B', 'C']
export const CLASS_NUMBERS = Array.from({ length: 12 }, (_, index) => String(index + 1))

// Fallback term-start date used only if the "current" academic year can't be
// read from the backend (see fetchStudentDirectory below, which prefers the
// real academic year's start date when available).
const CURRENT_TERM_START = '2026-04-01'

const STUDENT_STATUS_MAP = { active: 'active', inactive: 'inactive', transferred: 'inactive', alumni: 'alumnus' }

function mapStudentStatus(status) {
  return STUDENT_STATUS_MAP[status] ?? 'inactive'
}

function mapStudent(row) {
  return {
    id: row.id,
    name: row.full_name,
    className: row.class_name,
    section: row.section,
    // The students table has no roll-number column — there's no honest way
    // to source this, so it's shown as unavailable rather than invented.
    rollNo: '—',
    parentName: row.guardian_name,
    admissionDate: row.admitted_at,
    status: mapStudentStatus(row.status),
  }
}

// ---------------------------------------------------------------------------
// Student Directory
// ---------------------------------------------------------------------------

export async function fetchStudentDirectory() {
  const { data } = await apiGet('/students')
  const students = data.map(mapStudent)

  let termStart = CURRENT_TERM_START
  try {
    const { data: years } = await apiGet('/admin/school/academic-years')
    const current = years.find((year) => year.is_current)
    if (current?.start_date) termStart = current.start_date
  } catch {
    // fall back to the default term-start constant if academic years can't be read
  }

  const totalStudents = students.length
  const activeCount = students.filter((student) => student.status === 'active').length
  const newAdmissionsThisTerm = students.filter((student) => student.admissionDate && student.admissionDate >= termStart).length
  const sectionKeys = new Set(students.map((student) => `${student.className}-${student.section}`))
  const avgClassSize = sectionKeys.size ? Math.round(totalStudents / sectionKeys.size) : 0

  return {
    students,
    kpis: { totalStudents, activeCount, newAdmissionsThisTerm, avgClassSize },
  }
}

// ---------------------------------------------------------------------------
// Admissions Pipeline
// ---------------------------------------------------------------------------
// The admissions table's status check constraint only allows
// pending/approved/rejected/waitlisted, while this UI models a 4-stage
// pipeline of submitted/under-review/approved/rejected. 'waitlisted' is
// reused to represent "under review" so every real DB state maps to (and
// back from) a distinct UI state, instead of collapsing two UI states into
// one DB value.
const STATUS_TO_DB = { submitted: 'pending', 'under-review': 'waitlisted', approved: 'approved', rejected: 'rejected' }
const DB_TO_STATUS = { pending: 'submitted', waitlisted: 'under-review', approved: 'approved', rejected: 'rejected' }

function mapAdmission(row) {
  return {
    id: row.id,
    applicantName: row.applicant_name,
    applyingForClass: row.applying_for_class,
    submittedDate: row.submitted_at,
    status: DB_TO_STATUS[row.status] ?? row.status,
    parentContact: row.guardian_phone,
  }
}

export async function fetchAdmissions() {
  const { data } = await apiGet('/students/admissions/list')
  return data.map(mapAdmission).sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
}

export async function createAdmission(application) {
  await apiPost('/students/admissions/list', {
    applicant_name: application.applicantName,
    applying_for_class: application.applyingForClass,
    guardian_phone: application.parentContact,
  })
  return fetchAdmissions()
}

export async function updateAdmissionStatus(id, status) {
  await apiPatch(`/students/admissions/${id}/status`, { status: STATUS_TO_DB[status] ?? status })
  return fetchAdmissions()
}

// ---------------------------------------------------------------------------
// Promotion & Transfer
// ---------------------------------------------------------------------------

export async function fetchPromotionCandidates(currentClass) {
  const { data } = await apiGet(`/students/promotion/candidates${currentClass ? `?currentClass=${encodeURIComponent(currentClass)}` : ''}`)
  return data.map(mapStudent)
}

export async function fetchTransferRequests() {
  const { data } = await apiGet('/students/transfer-requests/list')
  return data
    .map((row) => ({
      id: row.id,
      studentName: row.students?.full_name ?? '—',
      fromClass: row.from_class,
      // The transfer_requests table models transfers to another internal
      // class (`to_class`) with a free-text `reason`, not a named external
      // school — `reason` is the closest honest analog available.
      requestedSchool: row.reason || '—',
      status: row.status,
      date: row.requested_at,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ---------------------------------------------------------------------------
// Bulk Import
// ---------------------------------------------------------------------------

function mapImportStatus(row) {
  if (row.status === 'failed') return 'failed'
  if (row.status === 'processing') return 'partial'
  return row.failed_rows > 0 ? 'partial' : 'success'
}

export async function fetchImportHistory() {
  const { data } = await apiGet('/students/import/history')
  return data
    .map((row) => ({
      id: row.id,
      fileName: row.file_name,
      // import_jobs.created_by is only a user id — no join available here to
      // resolve a display name, so it's surfaced as-is rather than guessed.
      uploadedBy: row.created_by ?? 'Unknown',
      rowsImported: row.success_rows ?? row.total_rows ?? 0,
      status: mapImportStatus(row),
      date: row.created_at,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}
