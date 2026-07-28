export const PAYMENT_STATUS_LABEL = {
  paid: 'Paid',
  partial: 'Partially Paid',
  refunded: 'Refunded',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
  approved: 'Approved',
  resolved: 'Resolved',
  escalated: 'Escalated',
  failed: 'Failed',
}

export const PAYMENT_STATUS_VARIANT = {
  paid: 'success',
  partial: 'warning',
  refunded: 'neutral',
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
  approved: 'success',
  resolved: 'success',
  escalated: 'info',
  failed: 'danger',
}

export const GATEWAY_STATUS_LABEL = {
  captured: 'Captured',
  authorized: 'Authorized',
  failed: 'Failed',
}

export const GATEWAY_STATUS_VARIANT = {
  captured: 'success',
  authorized: 'warning',
  failed: 'danger',
}

export const RECONCILIATION_STATUS_LABEL = {
  matched: 'Matched',
  mismatch: 'Mismatch',
  missing: 'Missing',
}

export const RECONCILIATION_STATUS_VARIANT = {
  matched: 'success',
  mismatch: 'warning',
  missing: 'danger',
}
