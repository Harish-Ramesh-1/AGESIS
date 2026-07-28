export const PRIORITY_BADGE_VARIANT = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
}

export const STATUS_BADGE_VARIANT = {
  overdue: 'danger',
  'due-soon': 'warning',
  pending: 'info',
  urgent: 'danger',
  success: 'success',
  failed: 'danger',
}

export const SEVERITY_BADGE_VARIANT = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
}

export function formatGrowth(value) {
  if (typeof value !== 'number') return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
