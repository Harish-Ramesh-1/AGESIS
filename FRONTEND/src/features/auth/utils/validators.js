export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validatePortalId(portal, value) {
  if (!value) return false
  return portal.idPattern.test(value.trim())
}
