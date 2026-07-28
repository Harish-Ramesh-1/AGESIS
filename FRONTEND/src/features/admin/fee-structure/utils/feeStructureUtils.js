export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']
export const ACADEMIC_YEAR_OPTIONS = ['2026-2027', '2025-2026']

export const FEE_HEAD_KEYS = ['tuition', 'transport', 'lab', 'library', 'sports', 'misc']

export const FEE_HEAD_LABEL = {
  tuition: 'Tuition',
  transport: 'Transport',
  lab: 'Lab',
  library: 'Library',
  sports: 'Sports',
  misc: 'Misc',
}

export function computeStructureTotal(amounts) {
  return FEE_HEAD_KEYS.reduce((sum, key) => sum + Number(amounts[key] || 0), 0)
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
  pending: 'Pending Admin Approval',
  approved: 'Approved',
  rejected: 'Rejected',
}
export const ADJUSTMENT_STATUS_VARIANT = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export const CATEGORY_TAXABLE_LABEL = {
  true: 'Taxable',
  false: 'Not Taxable',
}
export const CATEGORY_TAXABLE_VARIANT = {
  true: 'info',
  false: 'neutral',
}
