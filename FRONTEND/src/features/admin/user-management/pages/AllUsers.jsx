import { useEffect, useState } from 'react'
import { Eye, Pencil, ShieldOff, ShieldCheck, UserCheck, UserPlus, UsersRound, UserX } from 'lucide-react'
import { useAllUsersStore } from '../store/allUsersStore'
import { USER_ROLES } from '../services/userManagementService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import UserTable from '../components/UserTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatDate, formatRelativeTime } from '../../../../utils/formatDate'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const ROLE_BADGE_VARIANT = {
  Parent: 'info',
  Accountant: 'success',
  'Admin Staff': 'warning',
  Teacher: 'neutral',
}

export default function AllUsers() {
  const status = useAllUsersStore((state) => state.status)
  const error = useAllUsersStore((state) => state.error)
  const users = useAllUsersStore((state) => state.users)
  const summary = useAllUsersStore((state) => state.summary)
  const actionStatus = useAllUsersStore((state) => state.actionStatus)
  const actionError = useAllUsersStore((state) => state.actionError)
  const fetchUsers = useAllUsersStore((state) => state.fetchUsers)
  const toggleSuspend = useAllUsersStore((state) => state.toggleSuspend)

  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [userStatus, setUserStatus] = useState('')

  const filters = { query, role, status: userStatus }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(filters)
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role, userStatus])

  function handleReset() {
    setQuery('')
    setRole('')
    setUserStatus('')
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role', render: (row) => <Badge variant={ROLE_BADGE_VARIANT[row.role] ?? 'neutral'}>{row.role}</Badge> },
    {
      key: 'contact',
      header: 'Email / Phone',
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.email}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{row.phone}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'danger'}>{row.status === 'active' ? 'Active' : 'Suspended'}</Badge>,
    },
    { key: 'joinedDate', header: 'Joined Date', render: (row) => formatDate(row.joinedDate) },
    { key: 'lastLogin', header: 'Last Login', render: (row) => formatRelativeTime(row.lastLogin) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`View ${row.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={row.status === 'active' ? `Suspend ${row.name}` : `Reactivate ${row.name}`}
            disabled={actionStatus === 'loading'}
            onClick={() => toggleSuspend(row.id, filters)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            {row.status === 'active' ? <ShieldOff className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="All Users" />

      <div aria-live="polite" className="sr-only">
        {users.length} users matching current filters.
        {actionStatus === 'success' && ' User status updated.'}
        {actionStatus === 'error' && ` Failed to update user status. ${actionError ?? ''}`}
      </div>

      {status === 'loading' && !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={UsersRound} label="Total Users" value={summary.total} tone="brand" />
            <SummaryCard icon={UserCheck} label="Active" value={summary.active} tone="success" />
            <SummaryCard icon={UserX} label="Suspended" value={summary.suspended} tone="danger" />
            <SummaryCard icon={UserPlus} label="New This Month" value={summary.newThisMonth} tone="warning" />
          </div>
        )
      )}

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />

        <div className="mb-5 flex flex-col gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, phone or role"
            aria-label="Search users"
            className="w-full rounded-clay border border-white/50 bg-white/50 px-4 py-3 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-role-filter" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Role
              </label>
              <select id="user-role-filter" value={role} onChange={(event) => setRole(event.target.value)} className={selectClass}>
                <option value="">All Roles</option>
                {USER_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-status-filter" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Status
              </label>
              <select id="user-status-filter" value={userStatus} onChange={(event) => setUserStatus(event.target.value)} className={selectClass}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchUsers(filters)} />}

        {status === 'success' && (
          <UserTable
            columns={columns}
            rows={users}
            titleKey="name"
            subtitleKey="role"
            trailingKey="status"
            emptyIcon={UsersRound}
            emptyTitle="No users found"
            emptyMessage="Try adjusting your search or filters."
          />
        )}
      </div>
    </div>
  )
}
