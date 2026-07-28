export const ACTION_TYPE_VARIANT = {
  'Payment Recorded': 'success',
  'Refund Approved': 'success',
  'Refund Rejected': 'danger',
  'Fee Structure Edited': 'warning',
  'Student Record Updated': 'info',
  Login: 'neutral',
  'Export Generated': 'neutral',
  'Reminder Sent': 'info',
  'Late Fee Waived': 'warning',
  'Role Changed': 'warning',
  'User Suspended': 'danger',
  'User Invited': 'info',
  'Backup Restored': 'danger',
  'Security Policy Updated': 'warning',
  'Permission Matrix Updated': 'warning',
  'Integration Configured': 'info',
  'Announcement Sent': 'neutral',
}

export function getActionTypeVariant(actionType) {
  return ACTION_TYPE_VARIANT[actionType] ?? 'neutral'
}
