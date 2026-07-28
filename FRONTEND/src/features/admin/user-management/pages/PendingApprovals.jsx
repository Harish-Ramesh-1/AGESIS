import { useEffect } from 'react'
import { AlertTriangle, Check, CheckCircle2, UserCheck, X } from 'lucide-react'
import { usePendingApprovalsStore } from '../store/pendingApprovalsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import UserTable from '../components/UserTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatDate } from '../../../../utils/formatDate'

export default function PendingApprovals() {
  const status = usePendingApprovalsStore((state) => state.status)
  const error = usePendingApprovalsStore((state) => state.error)
  const approvals = usePendingApprovalsStore((state) => state.approvals)
  const approvedToday = usePendingApprovalsStore((state) => state.approvedToday)
  const actionStatus = usePendingApprovalsStore((state) => state.actionStatus)
  const actioningId = usePendingApprovalsStore((state) => state.actioningId)
  const fetchApprovals = usePendingApprovalsStore((state) => state.fetchApprovals)
  const approve = usePendingApprovalsStore((state) => state.approve)
  const reject = usePendingApprovalsStore((state) => state.reject)

  useEffect(() => {
    fetchApprovals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const urgentCount = approvals.filter((row) => row.urgency === 'urgent').length

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Requested Role' },
    { key: 'email', header: 'Email' },
    { key: 'requestedOn', header: 'Requested On', render: (row) => formatDate(row.requestedOn) },
    {
      key: 'urgency',
      header: 'Priority',
      render: (row) => <Badge variant={row.urgency === 'urgent' ? 'danger' : 'neutral'}>{row.urgency === 'urgent' ? 'Urgent' : 'Normal'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const isBusy = actionStatus === 'loading' && actioningId === row.id
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Approve ${row.name}`}
              disabled={isBusy}
              onClick={() => approve(row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Reject ${row.name}`}
              disabled={isBusy}
              onClick={() => reject(row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Pending Approvals" />

      <div aria-live="polite" className="sr-only">
        {approvals.length} pending approval requests.
        {actionStatus === 'success' && ' Request updated.'}
      </div>

      {status === 'loading' && approvals.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard icon={UserCheck} label="Total Pending" value={approvals.length} tone="brand" />
          <SummaryCard icon={AlertTriangle} label="Urgent" value={urgentCount} tone="danger" />
          <SummaryCard icon={CheckCircle2} label="Approved Today" value={approvedToday} tone="success" />
        </div>
      )}

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Registration Requests</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchApprovals} />}

        {status === 'success' && (
          <UserTable
            columns={columns}
            rows={approvals}
            titleKey="name"
            subtitleKey="role"
            trailingKey="urgency"
            emptyIcon={UserCheck}
            emptyTitle="No pending approvals"
            emptyMessage="New registration requests will show up here."
          />
        )}
      </div>
    </div>
  )
}
