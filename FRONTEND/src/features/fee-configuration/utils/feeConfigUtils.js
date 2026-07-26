export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']
export const ACADEMIC_YEAR_OPTIONS = ['2025-2026', '2024-2025']

export const FREQUENCY_OPTIONS = ['one-time', 'term-wise', 'monthly']
export const FREQUENCY_LABEL = {
  'one-time': 'One-Time',
  'term-wise': 'Term-wise',
  monthly: 'Monthly',
}
export const FREQUENCY_MULTIPLIER = {
  'one-time': 1,
  'term-wise': 3,
  monthly: 12,
}

export const STRUCTURE_STATUS_LABEL = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
}
export const STRUCTURE_STATUS_VARIANT = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
}

export const ASSIGNMENT_STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  failed: 'Failed',
}
export const ASSIGNMENT_STATUS_VARIANT = {
  completed: 'success',
  'in-progress': 'warning',
  failed: 'danger',
}

export const SCHOLARSHIP_TYPE_OPTIONS = ['merit', 'need-based', 'sibling', 'staff', 'sports']
export const SCHOLARSHIP_TYPE_LABEL = {
  merit: 'Merit',
  'need-based': 'Need-Based',
  sibling: 'Sibling',
  staff: 'Staff',
  sports: 'Sports',
}
export const SCHOLARSHIP_TYPE_VARIANT = {
  merit: 'info',
  'need-based': 'success',
  sibling: 'neutral',
  staff: 'warning',
  sports: 'danger',
}

export const DISCOUNT_TYPE_LABEL = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
}

export const APPLICATION_STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}
export const APPLICATION_STATUS_VARIANT = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export const ADJUSTMENT_TYPE_OPTIONS = ['waiver', 'charge', 'correction']
export const ADJUSTMENT_TYPE_LABEL = {
  waiver: 'Waiver',
  charge: 'Charge',
  correction: 'Correction',
}
export const ADJUSTMENT_TYPE_VARIANT = {
  waiver: 'info',
  charge: 'warning',
  correction: 'neutral',
}

export const ADJUSTMENT_STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}
export const ADJUSTMENT_STATUS_VARIANT = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export function computeAnnualTotal(components) {
  return components.reduce((sum, component) => sum + Number(component.amount || 0) * (FREQUENCY_MULTIPLIER[component.frequency] ?? 1), 0)
}
