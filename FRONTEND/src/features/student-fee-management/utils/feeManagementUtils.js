export const FEE_STATUS_LABEL = { paid: 'Paid', partial: 'Partial', pending: 'Pending', overdue: 'Overdue' }

export const FEE_STATUS_VARIANT = { paid: 'success', partial: 'warning', pending: 'info', overdue: 'danger' }

export const RECORD_STATUS_VARIANT = { active: 'success', expired: 'neutral', inactive: 'neutral' }

export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))

export const SECTION_OPTIONS = ['A', 'B', 'C']

export function formatCompactCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}
