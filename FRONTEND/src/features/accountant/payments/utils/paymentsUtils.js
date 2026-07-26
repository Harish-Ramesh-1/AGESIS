export const PAYMENT_STATUS_LABEL = {
  paid: 'Paid',
  pending: 'Pending',
  processing: 'Processing',
  verified: 'Verified',
  failed: 'Failed',
  refunded: 'Refunded',
  partial: 'Partially Paid',
  cancelled: 'Cancelled',
  resolved: 'Resolved',
  approved: 'Approved',
  rejected: 'Rejected',
  processed: 'Processed',
}

export const PAYMENT_STATUS_VARIANT = {
  paid: 'success',
  pending: 'warning',
  processing: 'info',
  verified: 'success',
  failed: 'danger',
  refunded: 'neutral',
  partial: 'warning',
  cancelled: 'neutral',
  resolved: 'success',
  approved: 'success',
  rejected: 'danger',
  processed: 'success',
}

export function formatGrowth(value) {
  if (typeof value !== 'number') return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
