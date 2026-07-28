import { apiGet, apiPost } from '../../../../services/apiClient'

// ---- roles list ----

export async function fetchRoles() {
  const [{ data: roles }, { data: users }] = await Promise.all([apiGet('/admin/users/roles'), apiGet('/admin/users')])

  const countByRoleId = new Map()
  for (const user of users) {
    if (!user.role_id) continue
    countByRoleId.set(user.role_id, (countByRoleId.get(user.role_id) ?? 0) + 1)
  }

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    userCount: countByRoleId.get(role.id) ?? 0,
  }))
}

// ---- permission matrix ----

export const PERMISSION_MODULES = ['Users', 'Students', 'Fees', 'Payments', 'Reports', 'Notifications', 'Security', 'Settings']
export const PERMISSION_ROLES = ['Super Admin', 'Admin Staff', 'Accountant', 'Parent', 'Teacher']
export const PERMISSION_LEVELS = ['none', 'view', 'edit', 'full']

// Backend roles.permissions is a flat jsonb array of capability strings
// (e.g. "fees:manage", "payments:view", or "*" for everything) rather than a
// per-module access level. This derives a best-effort level per module from
// those capability strings so the matrix UI (built for a module x role grid)
// still renders something meaningful.
const MODULE_PERMISSION_KEYS = {
  Users: 'users',
  Students: 'students',
  Fees: 'fees',
  Payments: 'payments',
  Reports: 'reports',
  Notifications: 'notifications',
  Security: 'security',
  Settings: 'settings',
}

function levelFromPermissions(permissions, moduleKey) {
  if (!Array.isArray(permissions)) return 'none'
  if (permissions.includes('*')) return 'full'
  if (permissions.includes(`${moduleKey}:manage`)) return 'full'
  if (permissions.includes(`${moduleKey}:edit`)) return 'edit'
  if (permissions.some((permission) => permission.startsWith(`${moduleKey}:`))) return 'view'
  return 'none'
}

export async function fetchPermissionMatrix() {
  const { data: roles } = await apiGet('/admin/users/roles/permission-matrix')
  const matrix = {}
  for (const moduleName of PERMISSION_MODULES) {
    matrix[moduleName] = {}
    for (const roleName of PERMISSION_ROLES) {
      const role = roles.find((r) => r.name === roleName)
      // Roles like 'Admin Staff' / 'Teacher' have no matching row in the
      // backend's roles table (only Parent, Accountant and Super Admin are
      // seeded), so they honestly show as 'none' across every module.
      matrix[moduleName][roleName] = role ? levelFromPermissions(role.permissions, MODULE_PERMISSION_KEYS[moduleName]) : 'none'
    }
  }
  return matrix
}

// ---- role assignment ----

export async function searchAssignableUsers(query) {
  if (!query) return []
  const { data } = await apiGet(`/admin/users/roles/assignable-users?query=${encodeURIComponent(query)}`)
  // The assignable-users endpoint doesn't join the roles table, so there's no
  // real "current role" name available here — shown as '—' rather than guessed.
  return data.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    currentRole: '—',
  }))
}

export async function fetchRoleChanges() {
  const { data } = await apiGet('/admin/users/roles/change-log')
  return data
    .map((row) => ({
      id: row.id,
      user: row.users?.full_name ?? '—',
      oldRole: row.previous_role ?? '—',
      newRole: row.new_role ?? '—',
      // `changed_by` is only stored as a user id on this row (no join
      // provided by the backend for it), so we surface the raw id rather
      // than guessing a display name.
      changedBy: row.changed_by ?? '—',
      date: row.created_at,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function assignRole({ user, newRole }) {
  const { data: roles } = await apiGet('/admin/users/roles')
  const roleMatch = roles.find((role) => role.name === newRole)
  await apiPost('/admin/users/roles/assign', { userId: user.id, newRoleId: roleMatch?.id })
  return fetchRoleChanges()
}
