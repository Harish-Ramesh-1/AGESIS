export const DUE_STATUS_LABEL = {
  upcoming: 'Upcoming',
  pending: 'Pending',
  'due-today': 'Due Today',
  overdue: 'Overdue',
  paid: 'Paid',
}

export const DUE_STATUS_VARIANT = {
  upcoming: 'info',
  pending: 'warning',
  'due-today': 'warning',
  overdue: 'danger',
  paid: 'success',
}

export const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

export const PRIORITY_VARIANT = { low: 'neutral', medium: 'warning', high: 'danger', critical: 'danger' }

export const PENALTY_STATUS_LABEL = {
  none: 'No Penalty',
  pending: 'Pending',
  applied: 'Penalty Applied',
  waived: 'Penalty Waived',
}

export const PENALTY_STATUS_VARIANT = {
  none: 'neutral',
  pending: 'warning',
  applied: 'danger',
  waived: 'success',
}

export const REMINDER_STATUS_VARIANT = { delivered: 'success', failed: 'danger', scheduled: 'info' }
export const REMINDER_STATUS_LABEL = { delivered: 'Delivered', failed: 'Failed', scheduled: 'Scheduled' }

export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']
export const FEE_CATEGORY_OPTIONS = ['Tuition Fee', 'Transport Fee', 'Hostel Fee', 'Library Fee', 'Laboratory Fee', 'Sports Fee', 'Examination Fee', 'Miscellaneous Fee']
