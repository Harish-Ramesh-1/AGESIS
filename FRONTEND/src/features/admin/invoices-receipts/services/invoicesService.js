import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'
import { useAuthStore } from '../../../../store/authStore'

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function mapTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    // document_templates has no dedicated description column — we stash it in `config`.
    description: row.config?.description || '',
    type: row.type,
    isDefault: Boolean(row.is_default),
    lastModified: row.created_at,
  }
}

export async function fetchTemplates() {
  const { data } = await apiGet('/documents/templates')
  return (data || []).map(mapTemplate)
}

export async function setDefaultTemplate(id) {
  await apiPatch(`/documents/templates/${id}/default`)
  // The backend clears is_default on sibling templates of the same type as a side effect,
  // so refetch the whole list rather than trusting only the single updated row.
  const { data } = await apiGet('/documents/templates')
  return (data || []).map(mapTemplate)
}

export async function duplicateTemplate(id) {
  const { data } = await apiPost(`/documents/templates/${id}/duplicate`)
  return mapTemplate(data)
}

export async function createTemplate(payload) {
  const { data } = await apiPost('/documents/templates', {
    name: payload.name || 'Untitled Template',
    type: payload.type || 'invoice',
    config: { description: payload.description || '' },
  })
  return mapTemplate(data)
}

// ---------------------------------------------------------------------------
// Bulk generation
// ---------------------------------------------------------------------------

export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']
export const TERM_OPTIONS = ['Term 1 (Apr - Sep)', 'Term 2 (Oct - Mar)', 'Full Academic Year']

export async function fetchBulkPreviewCount({ classId, section }) {
  const params = new URLSearchParams({ status: 'active' })
  if (classId) params.set('className', classId)
  if (section) params.set('section', section)
  const { data } = await apiGet(`/students?${params.toString()}`)
  return (data || []).length
}

function mapBulkRunStatus(row) {
  const success = Number(row.success_count) || 0
  const failed = Number(row.failed_count) || 0
  if (failed > 0 && success === 0) return 'failed'
  if (failed > 0) return 'partial'
  return row.status === 'failed' ? 'failed' : 'completed'
}

function mapBulkRun(row) {
  return {
    id: row.id,
    date: row.created_at,
    scope: row.class_name ? `Class ${row.class_name}${row.section ? `-${row.section}` : ''}` : 'All Classes',
    // bulk_generation_runs has a `term` column, but the /documents/invoices/bulk route never
    // writes to it — it always comes back null from the backend regardless of what's sent.
    term: row.term || '—',
    count: Number(row.total_count) || 0,
    status: mapBulkRunStatus(row),
    // created_by is a user ID with no join on this endpoint — no real staff name to show.
    triggeredBy: row.created_by ? 'Accountant/Admin Staff' : 'System',
  }
}

export async function fetchBulkRunHistory() {
  const { data } = await apiGet('/documents/invoices/bulk/history')
  return (data || []).map(mapBulkRun)
}

export async function triggerBulkGeneration(payload) {
  const { data } = await apiPost('/documents/invoices/bulk', {
    classId: payload.classId || undefined,
    section: payload.section || undefined,
  })
  const currentUser = useAuthStore.getState().user
  return {
    ...mapBulkRun(data),
    // The backend drops `term` and doesn't join a staff name — show what we know locally for
    // this just-completed run; a future refetch of history will show term as "—" again.
    term: payload.term || '—',
    triggeredBy: currentUser?.fullName ? `${currentUser.fullName} (Admin)` : 'Admin',
  }
}

// ---------------------------------------------------------------------------
// Receipt / invoice archive
// ---------------------------------------------------------------------------

function mapArchiveDocument(row) {
  return {
    id: row.id,
    receiptNumber: row.number,
    studentName: row.student?.full_name || '—',
    // /documents/archive doesn't join class_name/section — no source for this column.
    className: '—',
    amount: Number(row.amount) || 0,
    date: row.createdAt,
    type: row.type,
  }
}

export async function fetchReceiptArchive(filters = {}) {
  const { query, type } = filters
  const { data } = await apiGet('/documents/archive')
  let rows = (data || []).map(mapArchiveDocument)
  if (type) rows = rows.filter((row) => row.type === type)
  if (query) {
    const q = query.toLowerCase()
    rows = rows.filter((row) => [row.receiptNumber, row.studentName, row.className].join(' ').toLowerCase().includes(q))
  }
  return rows
}

// ---------------------------------------------------------------------------
// Document settings
// ---------------------------------------------------------------------------

function mapDocumentSettings(data, fallback = {}) {
  return {
    invoicePrefix: data?.invoicePrefix ?? fallback.invoicePrefix ?? 'INV-',
    invoiceStartNumber: Number(data?.invoiceStartNumber ?? fallback.invoiceStartNumber) || 0,
    receiptPrefix: data?.receiptPrefix ?? fallback.receiptPrefix ?? 'RCT-',
    receiptStartNumber: Number(data?.receiptStartNumber ?? fallback.receiptStartNumber) || 0,
    taxEnabled: Boolean(data?.taxEnabled ?? fallback.taxEnabled),
    taxId: data?.taxId ?? fallback.taxId ?? '',
    footerText: data?.footerText ?? fallback.footerText ?? '',
    showSchoolLogo: data?.showSchoolLogo ?? fallback.showSchoolLogo ?? true,
  }
}

// Document-related fields (invoice/receipt numbering, tax ID, footer text) have no dedicated
// backend module, so they're merged into the shared /admin/settings/general jsonb bucket
// alongside general school settings (schoolName, timezone, etc.) — PATCH there merges keys
// rather than overwriting, so this is safe to share with other admin settings screens.
export async function fetchDocumentSettings() {
  const { data } = await apiGet('/admin/settings/general')
  return mapDocumentSettings(data)
}

export async function saveDocumentSettings(payload) {
  const { data } = await apiPatch('/admin/settings/general', {
    invoicePrefix: payload.invoicePrefix,
    invoiceStartNumber: Number(payload.invoiceStartNumber) || 0,
    receiptPrefix: payload.receiptPrefix,
    receiptStartNumber: Number(payload.receiptStartNumber) || 0,
    taxEnabled: Boolean(payload.taxEnabled),
    taxId: payload.taxId,
    footerText: payload.footerText,
    showSchoolLogo: Boolean(payload.showSchoolLogo),
  })
  return mapDocumentSettings(data, payload)
}
