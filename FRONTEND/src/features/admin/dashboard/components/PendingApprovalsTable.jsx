import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check, X } from 'lucide-react'
import { usePendingApprovalsStore } from '../store/pendingApprovalsStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { ADMIN_ROUTES } from '../../../../constants/routes'
import { formatDate } from '../../../../utils/formatDate'
import { STATUS_BADGE_VARIANT } from '../utils/dashboardUtils'

const STATUS_LABEL = { pending: 'Pending', urgent: 'Urgent' }

export default function PendingApprovalsTable() {
  const status = usePendingApprovalsStore((state) => state.status)
  const approvals = usePendingApprovalsStore((state) => state.approvals)
  const error = usePendingApprovalsStore((state) => state.error)
  const fetchPendingApprovals = usePendingApprovalsStore((state) => state.fetchPendingApprovals)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingApprovals()
  }, [fetchPendingApprovals])

  function RowActions() {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Approve request"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 ease-premium hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reject request"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 ease-premium hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Request Type' },
    { key: 'className', header: 'Class' },
    { key: 'requestedOn', header: 'Requested On', render: (row) => formatDate(row.requestedOn) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
    { key: 'action', header: 'Action', render: () => <RowActions /> },
  ]

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Pending Approvals"
        description="Admissions, transfers & account requests"
        action={
          <button
            type="button"
            onClick={() => navigate(ADMIN_ROUTES.usersPendingApprovals)}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            View All
          </button>
        }
      />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load pending approvals. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={approvals} emptyMessage="No approvals pending." />
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {approvals.map((row) => (
              <details
                key={row.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{row.type}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant={STATUS_BADGE_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                    <ChevronDown
                      className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Class</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.className}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Requested On</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.requestedOn)}</p>
                    </div>
                  </div>
                  <RowActions />
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
