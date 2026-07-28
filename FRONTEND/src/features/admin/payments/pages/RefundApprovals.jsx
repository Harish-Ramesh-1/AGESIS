import { useEffect, useMemo } from 'react'
import { Check, IndianRupee, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { useRefundApprovalsStore } from '../store/refundApprovalsStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import SummaryCard from '../components/SummaryCard'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

export default function RefundApprovals() {
  const status = useRefundApprovalsStore((state) => state.status)
  const error = useRefundApprovalsStore((state) => state.error)
  const requests = useRefundApprovalsStore((state) => state.requests)
  const actioningId = useRefundApprovalsStore((state) => state.actioningId)
  const fetchRequests = useRefundApprovalsStore((state) => state.fetchRequests)
  const decide = useRefundApprovalsStore((state) => state.decide)

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const pendingCount = useMemo(() => requests.filter((item) => item.status === 'pending').length, [requests])
  const approvedTotal = useMemo(
    () => requests.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0),
    [requests],
  )

  function Actions({ row }) {
    const isBusy = actioningId === row.id
    if (row.status !== 'pending') {
      return <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge>
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => decide(row.id, 'approve')}
          disabled={isBusy}
          aria-label={`Approve refund ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => decide(row.id, 'reject')}
          disabled={isBusy}
          aria-label={`Reject refund ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Refund ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'reason', header: 'Reason' },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'requestedDate', header: 'Requested', render: (row) => formatDate(row.requestedDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge> },
    { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Refund Approvals" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${pendingCount} refund requests awaiting admin approval.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={ShieldAlert} label="Pending Admin Approval" value={pendingCount} status={status} tone="warning" />
        <SummaryCard icon={IndianRupee} label="Approved This Month" value={status === 'success' ? formatCurrency(approvedTotal) : '—'} status={status} tone="success" />
        <SummaryCard icon={ShieldCheck} label="Total Requests" value={requests.length} status={status} tone="brand" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Refunds Awaiting Sign-off" description="Refund requests above the accountant approval threshold" />

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchRequests} />}

        {status === 'success' && requests.length === 0 && (
          <EmptyState icon={ShieldCheck} title="No refund requests" description="High-value refund requests will appear here for sign-off." />
        )}

        {status === 'success' && requests.length > 0 && <DataTable columns={columns} rows={requests} emptyMessage="No refund requests." />}
      </div>
    </div>
  )
}
