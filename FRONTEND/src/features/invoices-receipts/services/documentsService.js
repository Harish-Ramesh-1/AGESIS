import { apiGet, apiPost, apiDelete } from '../../../services/apiClient'
import { useAuthStore } from '../../../store/authStore'

const SCHOOL_NAME = 'AGESIS International School'

function accountantName() {
  const user = useAuthStore.getState().user
  return user?.fullName || user?.full_name || user?.name || 'Accountant'
}

// ReceiptBuilder.jsx reads this as a plain string value (not a function call), so it's resolved
// once from the logged-in accountant's session rather than hardcoded.
const ACCOUNTANT_NAME = accountantName()

function classLabel(row) {
  if (!row) return ''
  return [row.class_name, row.section].filter(Boolean).join('-')
}

export async function fetchStudentsForDocument(query) {
  if (!query) return []
  // No dedicated /documents/students/search route exists — reuses the accountant/admin student
  // search endpoint from the payments module.
  const { data } = await apiGet(`/payments/students/search?query=${encodeURIComponent(query)}`)
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name,
    registrationNumber: row.admission_no,
    admissionNumber: row.admission_no,
    className: row.class_name,
    section: row.section,
    parentName: row.guardian_name,
    parentPhone: row.guardian_phone,
    parentEmail: row.guardian_email,
    academicYear: '2025-2026',
    feeComponents: [],
    pendingAmount: 0,
    installments: [],
    avatarInitials: (row.full_name ?? '').split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
  }))
}

function mapInvoiceRow(row) {
  return {
    id: row.id,
    studentId: row.student_id ?? row.student?.id,
    studentName: row.student?.full_name ?? row.students?.full_name ?? '',
    registrationNumber: row.student?.admission_no ?? row.students?.admission_no ?? '',
    className: classLabel(row.student ?? row.students),
    academicYear: row.academic_year ?? '',
    invoiceDate: (row.invoice_date ?? row.created_at ?? '').slice(0, 10),
    dueDate: (row.due_date ?? '').slice(0, 10),
    feeComponents: row.components ?? row.fee_components ?? [],
    discount: Number(row.discount) || 0,
    scholarship: Number(row.scholarship) || 0,
    lateFee: Number(row.late_fee) || 0,
    tax: Number(row.tax) || 0,
    notes: row.notes ?? '',
    totalAmount: Number(row.total_amount ?? row.amount) || 0,
    status: row.status ?? 'generated',
    createdBy: row.created_by ?? accountantName(),
    createdDate: row.created_at,
    fileSizeKb: row.file_size_kb ?? 0,
    pdfUrl: row.pdf_url,
  }
}

function applyDocFilters(rows, filters = {}) {
  const { query, status, className, section } = filters
  return rows.filter((row) => {
    if (query) {
      const q = query.toLowerCase()
      const haystack = [row.id, row.studentName, row.registrationNumber, row.transactionId].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (status && row.status !== status) return false
    if (className && row.className && !row.className.startsWith(className)) return false
    if (section && row.className && !row.className.endsWith(section)) return false
    return true
  })
}

export async function fetchInvoices(filters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  const qs = params.toString()
  const { data } = await apiGet(`/documents/invoices${qs ? `?${qs}` : ''}`)
  return applyDocFilters((data ?? []).map(mapInvoiceRow), filters)
}

export async function generateInvoice(payload) {
  if (payload.isDraft) {
    // The backend has no invoice-draft concept — POST /documents/invoices always generates a
    // real PDF immediately from the student's assigned fee structure. A "draft" is therefore
    // kept client-side only here and is not persisted to the backend.
    return {
      id: `DRAFT-${Date.now()}`,
      studentId: payload.studentId,
      studentName: payload.studentName,
      registrationNumber: payload.registrationNumber,
      className: payload.className,
      academicYear: payload.academicYear,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      feeComponents: payload.feeComponents,
      discount: payload.discount ?? 0,
      scholarship: payload.scholarship ?? 0,
      lateFee: payload.lateFee ?? 0,
      tax: payload.tax ?? 0,
      notes: payload.notes ?? '',
      totalAmount: payload.totalAmount,
      status: 'draft',
      createdBy: accountantName(),
      createdDate: new Date().toISOString(),
      fileSizeKb: 0,
    }
  }
  // The Invoice Builder's ad-hoc components/discount/scholarship/late-fee/tax overrides have no
  // backend equivalent — POST /documents/invoices only accepts {studentId, feeStructureId} and
  // computes the invoice entirely server-side from the student's assigned fee structure.
  const feeStructureRes = await apiGet(`/students/${payload.studentId}/fee-structure`).catch(() => ({ data: null }))
  const feeStructureId = feeStructureRes.data?.fee_structures?.id ?? feeStructureRes.data?.id
  const { data } = await apiPost('/documents/invoices', { studentId: payload.studentId, feeStructureId })
  return mapInvoiceRow(data)
}

// The backend's POST /documents/invoices/bulk endpoint only targets one {classId, section} pair
// at a time, but this UI lets the accountant hand-pick individual students across mixed classes —
// so bulk generation loops the single-invoice endpoint per selected candidate to get honest
// per-student success/failure instead of one coarse aggregate result.
export async function generateBulkInvoices(payload) {
  const results = await Promise.allSettled(
    payload.candidates.map(async (candidate) => {
      const feeStructureRes = await apiGet(`/students/${candidate.studentId}/fee-structure`).catch(() => ({ data: null }))
      const feeStructureId = feeStructureRes.data?.fee_structures?.id ?? feeStructureRes.data?.id
      const { data } = await apiPost('/documents/invoices', { studentId: candidate.studentId, feeStructureId })
      return { candidateId: candidate.id, studentName: candidate.studentName, invoiceId: data.id, success: true }
    }),
  )
  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value
    const candidate = payload.candidates[index]
    return { candidateId: candidate.id, studentName: candidate.studentName, invoiceId: null, success: false }
  })
}

export async function fetchInvoiceById(id) {
  const { data } = await apiGet(`/documents/invoices/${id}`)
  return mapInvoiceRow(data)
}

function mapReceiptRow(row, payload = {}) {
  return {
    id: row?.id ?? payload.id ?? `RCT-${Date.now()}`,
    transactionId: row?.payment_id ?? payload.transactionId ?? row?.id,
    studentId: payload.studentId ?? row?.student_id,
    studentName: row?.student?.full_name ?? row?.students?.full_name ?? payload.studentName ?? '',
    registrationNumber: row?.student?.admission_no ?? row?.students?.admission_no ?? payload.registrationNumber ?? '',
    paymentDate: row?.created_at ?? payload.paymentDate,
    paymentMethod: row?.method ?? payload.paymentMethod,
    feeComponents: payload.feeComponents ?? [],
    paidAmount: Number(row?.amount ?? payload.paidAmount) || 0,
    balanceAmount: Number(payload.balanceAmount) || 0,
    remarks: row?.notes ?? payload.remarks ?? '',
    status: row?.status ?? 'generated',
    createdBy: accountantName(),
    createdDate: row?.created_at ?? new Date().toISOString(),
    fileSizeKb: row?.file_size_kb ?? 0,
    pdfUrl: row?.pdf_url,
  }
}

export async function fetchReceipts(filters) {
  const { data } = await apiGet('/documents/receipts')
  return applyDocFilters((data ?? []).map((row) => mapReceiptRow(row)), filters)
}

export async function generateReceipt(payload) {
  // POST /documents/receipts only generates a receipt for an existing Payment row (via
  // {paymentId}) — this manual entry flow has no prior payment to attach to, so it first records
  // the entered amount/method as a real manual payment (the same operation Payments > Receive
  // Payment performs), then generates the receipt for that new payment.
  const { data: payment } = await apiPost('/payments', {
    studentId: payload.studentId,
    amount: payload.paidAmount,
    method: payload.paymentMethod,
    notes: payload.remarks,
  })
  const { data } = await apiPost('/documents/receipts', { paymentId: payment.id }).catch(() => ({ data: payment }))
  return mapReceiptRow(data ?? payment, payload)
}

export async function fetchReceiptById(id) {
  const { data } = await apiGet(`/documents/receipts/${id}`)
  return mapReceiptRow(data)
}

function toDocument(row) {
  return {
    documentNumber: row.number ?? row.id,
    documentType: row.type,
    studentName: row.student?.full_name ?? '',
    registrationNumber: row.student?.admission_no ?? '',
    generatedDate: row.createdAt,
    createdBy: row.createdBy ?? accountantName(),
    status: row.status,
    fileSizeKb: row.fileSizeKb ?? 0,
    className: classLabel(row.student),
    totalAmount: Number(row.amount) || 0,
    pdfUrl: row.pdfUrl,
  }
}

export async function fetchDocuments(filters) {
  const { data } = await apiGet('/documents/archive')
  const { documentType } = filters ?? {}
  const documents = (data ?? []).map(toDocument).sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate))
  const scoped = documentType ? documents.filter((doc) => doc.documentType === documentType) : documents
  return applyDocFilters(scoped, filters)
}

export async function fetchDocumentById(id) {
  try {
    const { data } = await apiGet(`/documents/invoices/${id}`)
    return { ...mapInvoiceRow(data), documentType: 'invoice', source: data }
  } catch {
    const { data } = await apiGet(`/documents/receipts/${id}`)
    return { ...mapReceiptRow(data), documentType: 'receipt', source: data }
  }
}

async function resolveDocumentType(id) {
  try {
    await apiGet(`/documents/invoices/${id}`)
    return 'invoice'
  } catch {
    return 'receipt'
  }
}

export async function fetchDocumentActivity(id) {
  const type = await resolveDocumentType(id)
  const { data } = await apiGet(`/documents/${type}/${id}/activity`).catch(() => ({ data: [] }))
  return data ?? []
}

export async function emailDocument(id, payload) {
  const type = await resolveDocumentType(id)
  await apiPost(`/documents/${type}/${id}/email`, payload)
  return { success: true }
}

export async function shareDocument(id) {
  const type = await resolveDocumentType(id)
  const { data } = await apiPost(`/documents/${type}/${id}/share`)
  return { success: true, link: data?.link ?? data?.url ?? '' }
}

export async function markDownloaded(id) {
  const type = await resolveDocumentType(id)
  await apiPost(`/documents/${type}/${id}/downloaded`)
}

export async function markPrinted(id) {
  const type = await resolveDocumentType(id)
  await apiPost(`/documents/${type}/${id}/printed`)
}

export async function deleteDocument(id) {
  const type = await resolveDocumentType(id)
  await apiDelete(`/documents/${type}/${id}`)
  return { success: true }
}

// The bulk-generation candidates list (students with an outstanding due, eligible for bulk
// invoicing) is sourced from real /dues data — bulkGenerationStore.js previously seeded its
// `candidates` state from a static mock array import, so it now calls this on load instead.
export async function fetchBulkCandidates() {
  const { data } = await apiGet('/dues')
  return (data ?? [])
    .filter((row) => row.status !== 'paid')
    .map((row) => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.students?.full_name ?? '',
      registrationNumber: row.students?.admission_no ?? '',
      className: row.students?.class_name ?? '',
      section: row.students?.section ?? '',
      feeCategory: row.description ?? '',
      installment: row.description ?? '',
      feeStatus: row.status,
      amount: Number(row.amount_due) - Number(row.amount_paid || 0),
    }))
}

export { SCHOOL_NAME, ACCOUNTANT_NAME }
