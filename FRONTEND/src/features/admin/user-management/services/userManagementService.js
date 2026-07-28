import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

export const USER_ROLES = ['Parent', 'Accountant', 'Admin Staff', 'Teacher']

// The backend only has three real portals/roles seeded (Parent, Accountant,
// Super Admin) — 'Admin Staff' and 'Teacher' are UI-only role labels with no
// matching row in the `roles` table yet. This map is a best-effort fallback
// used only when a role name typed/selected in the UI can't be resolved
// against the live `roles` list.
const ROLE_NAME_TO_PORTAL = {
  Parent: 'parent',
  Accountant: 'accountant',
  'Admin Staff': 'admin',
  Teacher: 'admin',
}

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.full_name,
    role: row.roles?.name ?? '—',
    email: row.email,
    phone: row.phone,
    status: row.status,
    joinedDate: row.created_at,
    lastLogin: row.last_login_at,
  }
}

// ---- all users ----

export async function fetchAllUsers(filters = {}) {
  const { data } = await apiGet('/admin/users')
  const allUsers = data.map(mapUserRow)

  const { query, role, status } = filters
  const users = allUsers
    .filter((row) => {
      if (role && row.role !== role) return false
      if (status && row.status !== status) return false
      if (query) {
        const q = query.toLowerCase()
        if (![row.name, row.email, row.phone, row.role].join(' ').toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))

  const summary = {
    total: allUsers.length,
    active: allUsers.filter((u) => u.status === 'active').length,
    suspended: allUsers.filter((u) => u.status === 'suspended').length,
    newThisMonth: allUsers.filter((u) => new Date(u.joinedDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  }

  return { users, summary }
}

export async function suspendUser(id) {
  const { data } = await apiGet('/admin/users')
  const user = data.find((row) => row.id === id)
  const path = user?.status === 'suspended' ? `/admin/users/${id}/reactivate` : `/admin/users/${id}/suspend`
  await apiPatch(path)
  const { data: refreshed } = await apiGet('/admin/users')
  return refreshed.map(mapUserRow)
}

// ---- invite user ----

function mapInvite(row) {
  return {
    id: row.id,
    // The backend's user_invites table has no name column — only email,
    // portal and role are stored. Falling back to the email's local part so
    // the table still reads sensibly rather than showing a blank name.
    name: row.email ? row.email.split('@')[0] : 'Invitee',
    role: row.roles?.name ?? '—',
    email: row.email,
    sentDate: row.invited_at,
    status: row.status,
  }
}

export async function fetchInvites() {
  const { data } = await apiGet('/admin/users/invites')
  return data.map(mapInvite).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
}

export async function inviteUser(payload) {
  const { data: roles } = await apiGet('/admin/users/roles')
  const roleMatch = roles.find((role) => role.name === payload.role)
  const portal = roleMatch?.portal ?? ROLE_NAME_TO_PORTAL[payload.role] ?? 'admin'
  await apiPost('/admin/users/invites', { email: payload.email, portal, roleId: roleMatch?.id })
  return fetchInvites()
}

export async function resendInvite(id) {
  await apiPost(`/admin/users/invites/${id}/resend`)
  return fetchInvites()
}

// ---- pending approvals ----

async function roleNameById() {
  const { data: roles } = await apiGet('/admin/users/roles')
  return new Map(roles.map((role) => [role.id, role.name]))
}

async function countApprovedToday() {
  const todayStr = new Date().toISOString().slice(0, 10)
  try {
    const { data } = await apiGet(`/audit-logs?actionType=${encodeURIComponent('User Approved')}&dateFrom=${todayStr}&dateTo=${todayStr}`)
    return data.length
  } catch {
    return 0
  }
}

export async function fetchPendingApprovals() {
  const [{ data: rows }, roleById, approvedToday] = await Promise.all([
    apiGet('/admin/users/pending-approvals'),
    roleNameById(),
    countApprovedToday(),
  ])

  const approvals = rows
    .map((row) => ({
      id: row.id,
      name: row.full_name,
      role: roleById.get(row.role_id) ?? '—',
      email: row.email,
      requestedOn: row.created_at,
      // The users table has no urgency/priority column — the backend has no
      // concept of "urgent" registrations, so every request is normalized to
      // 'normal' rather than inventing a fake urgency signal.
      urgency: 'normal',
    }))
    .sort((a, b) => new Date(b.requestedOn) - new Date(a.requestedOn))

  return { approvals, approvedToday }
}

export async function approveUser(id) {
  await apiPatch(`/admin/users/${id}/approve`)
  return fetchPendingApprovals()
}

export async function rejectUser(id) {
  await apiPatch(`/admin/users/${id}/reject`)
  return fetchPendingApprovals()
}

// ---- suspended accounts ----

export async function fetchSuspendedAccounts() {
  const [{ data: rows }, roleById] = await Promise.all([apiGet('/admin/users/suspended'), roleNameById()])

  return rows
    .map((row) => ({
      id: row.id,
      name: row.full_name,
      role: roleById.get(row.role_id) ?? '—',
      // The backend doesn't persist a suspension reason or who performed the
      // suspension — those columns don't exist on `users`, so we're honest
      // about not having them rather than inventing a plausible-looking one.
      reason: 'Not recorded by the backend',
      suspendedDate: row.updated_at,
      suspendedBy: '—',
    }))
    .sort((a, b) => new Date(b.suspendedDate) - new Date(a.suspendedDate))
}

export async function reactivateAccount(id) {
  await apiPatch(`/admin/users/${id}/reactivate`)
  return fetchSuspendedAccounts()
}
