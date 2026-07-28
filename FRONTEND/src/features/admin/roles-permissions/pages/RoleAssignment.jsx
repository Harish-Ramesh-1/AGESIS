import { useEffect, useState } from 'react'
import { CheckCircle2, Search, UserCog } from 'lucide-react'
import { useRoleAssignmentStore } from '../store/roleAssignmentStore'
import { PERMISSION_ROLES } from '../services/rolesPermissionsService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import RoleTable from '../components/RoleTable'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function RoleAssignment() {
  const status = useRoleAssignmentStore((state) => state.status)
  const error = useRoleAssignmentStore((state) => state.error)
  const changes = useRoleAssignmentStore((state) => state.changes)
  const searchStatus = useRoleAssignmentStore((state) => state.searchStatus)
  const searchResults = useRoleAssignmentStore((state) => state.searchResults)
  const assignStatus = useRoleAssignmentStore((state) => state.assignStatus)
  const assignError = useRoleAssignmentStore((state) => state.assignError)
  const fetchChanges = useRoleAssignmentStore((state) => state.fetchChanges)
  const searchUsers = useRoleAssignmentStore((state) => state.searchUsers)
  const clearSearch = useRoleAssignmentStore((state) => state.clearSearch)
  const assign = useRoleAssignmentStore((state) => state.assign)
  const resetAssignStatus = useRoleAssignmentStore((state) => state.resetAssignStatus)

  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchChanges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!query || selectedUser) {
      clearSearch()
      return
    }
    const timeout = setTimeout(() => searchUsers(query), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedUser])

  useEffect(() => {
    if (assignStatus === 'success') {
      setQuery('')
      setSelectedUser(null)
      setNewRole('')
      const timeout = setTimeout(() => resetAssignStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [assignStatus, resetAssignStatus])

  function handleSelectUser(user) {
    setSelectedUser(user)
    setQuery(user.name)
    clearSearch()
  }

  function handleQueryChange(value) {
    setQuery(value)
    if (selectedUser) setSelectedUser(null)
  }

  async function handleAssign(event) {
    event.preventDefault()
    if (!selectedUser || !newRole) return
    await assign({ user: selectedUser, newRole })
  }

  const columns = [
    { key: 'user', header: 'User' },
    { key: 'oldRole', header: 'Old Role' },
    { key: 'newRole', header: 'New Role' },
    { key: 'changedBy', header: 'Changed By' },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Role Assignment" />

      <div aria-live="polite" className="sr-only">
        {assignStatus === 'success' && 'Role assigned successfully.'}
        {assignStatus === 'error' && `Failed to assign role. ${assignError ?? ''}`}
      </div>

      <GlassCard title="Assign a Role" description="Search for a user, choose a new role and confirm the assignment.">
        <form onSubmit={handleAssign} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
            <div className="relative flex flex-col gap-1">
              <label htmlFor="assignment-user-search" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Find User
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="assignment-user-search"
                  type="text"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Search by name or email"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
              {query && !selectedUser && (
                <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-xl border border-white/50 bg-white/95 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
                  {searchStatus === 'loading' && <li className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">Searching…</li>}
                  {searchStatus === 'success' && searchResults.length === 0 && (
                    <li className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">No matching users found.</li>
                  )}
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full flex-col items-start px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors duration-200 hover:bg-brand-50/80 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {user.email} &middot; Currently {user.currentRole}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="assignment-new-role" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                New Role
              </label>
              <select id="assignment-new-role" value={newRole} onChange={(event) => setNewRole(event.target.value)} className={selectClass}>
                <option value="">Select role</option>
                {PERMISSION_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <PrimaryButton type="submit" fullWidth={false} disabled={!selectedUser || !newRole} isLoading={assignStatus === 'loading'}>
              <UserCog className="h-4 w-4" aria-hidden="true" />
              Assign
            </PrimaryButton>
          </div>

          {assignStatus === 'success' && (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Role assigned successfully.
            </p>
          )}
          {assignStatus === 'error' && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {assignError}
            </p>
          )}
        </form>
      </GlassCard>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recent Role Changes</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchChanges} />}

        {status === 'success' && (
          <RoleTable
            columns={columns}
            rows={changes}
            titleKey="user"
            subtitleKey="newRole"
            trailingKey="date"
            emptyIcon={UserCog}
            emptyTitle="No role changes yet"
            emptyMessage="Role assignment history will appear here."
          />
        )}
      </div>
    </div>
  )
}
