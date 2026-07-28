import { apiGet } from '../../../../services/apiClient'

export const ACTORS = [
  'Rahul Mehta (Admin)',
  'Priya Nair (Admin)',
  'Kavita Sharma (Accountant)',
  'Rohit Verma (Accountant)',
  'Ananya Iyer (Accountant)',
  'System',
]

export const ACTION_TYPES = [
  'Payment Recorded',
  'Refund Approved',
  'Refund Rejected',
  'Fee Structure Edited',
  'Student Record Updated',
  'Login',
  'Export Generated',
  'Reminder Sent',
  'Late Fee Waived',
  'Role Changed',
  'User Invited',
  'User Suspended',
  'Backup Restored',
  'Security Policy Updated',
  'Permission Matrix Updated',
  'Integration Configured',
  'Announcement Sent',
]

export const CRITICAL_ACTION_TYPES = new Set([
  'Refund Approved',
  'Refund Rejected',
  'Fee Structure Edited',
  'Late Fee Waived',
  'Role Changed',
  'User Suspended',
  'Backup Restored',
  'Security Policy Updated',
  'Permission Matrix Updated',
])

// Note: ACTORS/ACTION_TYPES are fixed UI vocabulary used to populate the filter dropdowns.
// The real backend writes actor names and action-type strings organically via logAudit() calls
// scattered across modules, so some real rows may carry actor/actionType values outside these
// curated lists (e.g. "Payment Verified", "Document Deleted") — those rows simply won't be
// selectable via the dropdown filters, though they'll still appear with no filter applied.
export async function fetchAuditLogs(filters = {}) {
  const { query, actor, actionType, dateFrom, dateTo } = filters
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (actor) params.set('actor', actor)
  if (actionType) params.set('actionType', actionType)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  const qs = params.toString()
  const { data } = await apiGet(`/audit-logs${qs ? `?${qs}` : ''}`)
  return data || []
}
