import { useEffect, useMemo } from 'react'
import { Check, ClipboardCheck, ShieldCheck, X } from 'lucide-react'
import { useVerificationStore } from '../store/verificationStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatRelativeTime } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import SummaryCard from '../components/SummaryCard'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

export default function PaymentVerification() {
  const status = useVerificationStore((state) => state.status)
  const error = useVerificationStore((state) => state.error)
  const items = useVerificationStore((state) => state.items)
  const actioningId = useVerificationStore((state) => state.actioningId)
  const fetchQueue = useVerificationStore((state) => state.fetchQueue)
  const decide = useVerificationStore((state) => state.decide)

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'pending').length, [items])
  const todayKey = new Date().toISOString().slice(0, 10)
  const verifiedToday = useMemo(
    () => items.filter((item) => item.status === 'verified' && (item.decidedDate ?? item.submittedDate)?.slice(0, 10) === todayKey).length,
    [items, todayKey],
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
          aria-label={`Approve verification ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => decide(row.id, 'reject')}
          disabled={isBusy}
          aria-label={`Reject verification ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Reference ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    { key: 'referenceNumber', header: 'Reference No.' },
    { key: 'submittedBy', header: 'Submitted By' },
    { key: 'submittedDate', header: 'Submitted', render: (row) => formatRelativeTime(row.submittedDate) },
    { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Payment Verification" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${pendingCount} payments awaiting verification.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard icon={ClipboardCheck} label="Pending Verification" value={pendingCount} status={status} tone="warning" />
        <SummaryCard icon={ShieldCheck} label="Verified Today" value={verifiedToday} status={status} tone="success" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Institution-wide Verification Queue" description="Bank transfer and UPI payments awaiting reference verification" />

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchQueue} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={ShieldCheck} title="Nothing to verify" description="All submitted payments have been verified." />
        )}

        {status === 'success' && items.length > 0 && <DataTable columns={columns} rows={items} emptyMessage="Nothing to verify." />}
      </div>
    </div>
  )
}
