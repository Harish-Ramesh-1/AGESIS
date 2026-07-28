import { useEffect } from 'react'
import { ShieldCheck, UserX } from 'lucide-react'
import { useSuspendedAccountsStore } from '../store/suspendedAccountsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import UserTable from '../components/UserTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatDate } from '../../../../utils/formatDate'

export default function SuspendedAccounts() {
  const status = useSuspendedAccountsStore((state) => state.status)
  const error = useSuspendedAccountsStore((state) => state.error)
  const accounts = useSuspendedAccountsStore((state) => state.accounts)
  const actionStatus = useSuspendedAccountsStore((state) => state.actionStatus)
  const actioningId = useSuspendedAccountsStore((state) => state.actioningId)
  const fetchAccounts = useSuspendedAccountsStore((state) => state.fetchAccounts)
  const reactivate = useSuspendedAccountsStore((state) => state.reactivate)

  useEffect(() => {
    fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role', render: (row) => <Badge variant="neutral">{row.role}</Badge> },
    { key: 'reason', header: 'Reason' },
    { key: 'suspendedDate', header: 'Suspended Date', render: (row) => formatDate(row.suspendedDate) },
    { key: 'suspendedBy', header: 'Suspended By' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          aria-label={`Reactivate ${row.name}`}
          disabled={actionStatus === 'loading' && actioningId === row.id}
          onClick={() => reactivate(row.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Reactivate
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Suspended Accounts" />

      <div aria-live="polite" className="sr-only">
        {accounts.length} suspended accounts.
        {actionStatus === 'success' && ' Account reactivated.'}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Suspended / Blocked Accounts</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchAccounts} />}

        {status === 'success' && (
          <UserTable
            columns={columns}
            rows={accounts}
            titleKey="name"
            subtitleKey="role"
            trailingKey="suspendedDate"
            emptyIcon={UserX}
            emptyTitle="No suspended accounts"
            emptyMessage="Accounts that get suspended will appear here."
          />
        )}
      </div>
    </div>
  )
}
