import { apiGet, apiPost } from '../../../../services/apiClient'

export async function fetchProfile() {
  const { data } = await apiGet('/settings/profile')
  return data
}

export async function changePassword({ currentPassword, newPassword }) {
  await apiPost('/settings/security/change-password', { currentPassword, newPassword })
}
