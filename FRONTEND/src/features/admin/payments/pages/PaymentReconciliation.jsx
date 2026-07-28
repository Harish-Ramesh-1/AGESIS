import { useEffect } from 'react'
import { CheckCircle2, GitCompare, IndianRupee } from 'lucide-react'
import { useReconciliationStore } from '../store/reconciliationStore'
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
import { RECONCILIATION_STATUS_LABEL, RECONCILIATION_STATUS_VARIANT } from '../utils/paymentsUtils'

const COLUMNS = [
  { key: 'transactionId', header: 'Transaction ID', render: (row) => row.transactionId ?? '—' },
  { key: 'studentName', header: 'Student / Entry' },
  { key: 'bankAmount', header: 'Bank Statement', render: (row) => formatCurrency(row.bankAmount) },
  { key: 'recordedAmount', header: 'Recorded Payment', render: (row) => formatCurrency(row.recordedAmount) },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  {
    key: 'matchStatus',
    header: 'Status',
    render: (row) => <Badge variant={RECONCILIATION_STATUS_VARIANT[row.matchStatus]}>{RECONCILIATION_STATUS_LABEL[row.matchStatus]}</Badge>,
  },
]

export default function PaymentReconciliation() {
  const status = useReconciliationStore((state) => state.status)
  const error = useReconciliationStore((state) => state.error)
  const summary = useReconciliationStore((state) => state.summary)
  const rows = useReconciliationStore((state) => state.rows)
  const fetchReconciliation = useReconciliationStore((state) => state.fetchReconciliation)

  useEffect(() => {
    fetchReconciliation()
  }, [fetchReconciliation])

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Payment Reconciliation" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${summary?.matched ?? 0} matched, ${summary?.mismatched ?? 0} mismatched entries.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={CheckCircle2} label="Matched" value={summary?.matched ?? '—'} status={status} tone="success" />
        <SummaryCard icon={GitCompare} label="Mismatched" value={summary?.mismatched ?? '—'} status={status} tone="warning" />
        <SummaryCard
          icon={IndianRupee}
          label="Unreconciled Amount"
          value={summary ? formatCurrency(summary.unreconciledAmount) : '—'}
          status={status}
          tone="danger"
        />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Bank Statement vs. Recorded Payments" description="Institution-wide comparison flagging mismatched or missing entries" />

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchReconciliation} />}

        {status === 'success' && rows.length === 0 && (
          <EmptyState icon={CheckCircle2} title="Fully reconciled" description="Every bank entry matches a recorded payment." />
        )}

        {status === 'success' && rows.length > 0 && <DataTable columns={COLUMNS} rows={rows} emptyMessage="No records to reconcile." />}
      </div>
    </div>
  )
}
