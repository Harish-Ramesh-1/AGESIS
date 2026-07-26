export const TRANSACTION_STATUS_LABEL = { success: 'Success', partial: 'Partial', failed: 'Failed' }
export const TRANSACTION_STATUS_VARIANT = { success: 'success', partial: 'warning', failed: 'danger' }

export const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
export const PRIORITY_VARIANT = { low: 'neutral', medium: 'warning', high: 'danger', critical: 'danger' }

export const EXPORT_STATUS_LABEL = { completed: 'Completed', processing: 'Processing', failed: 'Failed' }
export const EXPORT_STATUS_VARIANT = { completed: 'success', processing: 'info', failed: 'danger' }

export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']
export const FEE_CATEGORY_OPTIONS = ['Tuition Fee', 'Transport Fee', 'Hostel Fee', 'Library Fee', 'Examination Fee']
export const CAMPUS_OPTIONS = ['Whitefield Campus', 'Electronic City Campus']

export function formatGrowth(value) {
  if (typeof value !== 'number') return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatFileSize(kb) {
  if (!kb) return '—'
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
