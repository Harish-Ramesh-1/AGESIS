export const DUE_STATUS_LABEL = {
  upcoming: 'Upcoming',
  pending: 'Pending',
  'due-today': 'Due Today',
  overdue: 'Overdue',
}
export const DUE_STATUS_VARIANT = {
  upcoming: 'info',
  pending: 'warning',
  'due-today': 'warning',
  overdue: 'danger',
}

export const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
export const PRIORITY_VARIANT = { low: 'neutral', medium: 'warning', high: 'danger', critical: 'danger' }

export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
export const SECTION_OPTIONS = ['A', 'B', 'C']

export const CAMPAIGN_STATUS_LABEL = {
  scheduled: 'Scheduled',
  sent: 'Sent',
  failed: 'Failed',
}
export const CAMPAIGN_STATUS_VARIANT = {
  scheduled: 'info',
  sent: 'success',
  failed: 'danger',
}

export const CHANNEL_OPTIONS = ['SMS', 'Email']

export const AUDIENCE_OPTIONS = [
  'All Overdue Accounts',
  'Class 1-5 Pending',
  'Class 6-8 Pending',
  'Class 9-10 Pending',
  'Class 11-12 Pending',
  'Critical Priority Accounts',
]

export const LATE_FEE_TYPE_LABEL = {
  flat: 'Flat Amount',
  percentage: 'Percentage of Outstanding',
}
