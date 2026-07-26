export const DOCUMENT_STATUS_LABEL = {
  draft: 'Draft',
  generated: 'Generated',
  sent: 'Sent',
  downloaded: 'Downloaded',
  printed: 'Printed',
  archived: 'Archived',
  cancelled: 'Cancelled',
}

export const DOCUMENT_STATUS_VARIANT = {
  draft: 'neutral',
  generated: 'info',
  sent: 'success',
  downloaded: 'success',
  printed: 'success',
  archived: 'neutral',
  cancelled: 'danger',
}

export function formatFileSize(kb) {
  if (!kb) return '—'
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
