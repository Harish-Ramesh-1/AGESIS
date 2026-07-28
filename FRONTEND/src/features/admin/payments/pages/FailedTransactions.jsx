import { useEffect, useMemo } from 'react'
import { AlertTriangle, ArrowUpCircle, CheckCircle2, RotateCcw, TrendingDown } from 'lucide-react'
import { useFailedTransactionsStore } from '../store/failedTransactionsStore'
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

export default function FailedTransactions() {
  const status = useFailedTransactionsStore((state) => state.status)
  const error = useFailedTransactionsStore((state) => state.error)
  const items = useFailedTransactionsStore((state) => state.items)
  const actioningId = useFailedTransactionsStore((state) => state.actioningId)
  const fetchFailed = useFailedTransactionsStore((state) => state.fetchFailed)
  const retry = useFailedTransactionsStore((state) => state.retry)
  const escalate = useFailedTransactionsStore((state) => state.escalate)

  useEffect(() => {
    fetchFailed()
  }, [fetchFailed])

  const todayKey = new Date().toISOString().slice(0, 10)
  const stats = useMemo(() => {
    if (items.length === 0) return { failedToday: 0, retryRequired: 0, failureRate: 0 }
    const failedToday = items.filter((item) => item.date.slice(0, 10) === todayKey).length
    const retryRequired = items.filter((item) => item.status === 'failed').length
    const failureRate = Math.round((retryRequired / items.length) * 100)
    return { failedToday, retryRequired, failureRate }
  }, [items, todayKey])

  function Actions({ row }) {
    const isBusy = actioningId === row.id
    if (row.status === 'resolved' || row.status === 'escalated') {
      return <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge>
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => retry(row.id)}
          disabled={isBusy}
          aria-label={`Retry ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <RotateCcw className={isBusy ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => escalate(row.id)}
          disabled={isBusy}
          aria-label={`Escalate ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 transition-colors duration-200 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
        >
          <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    { key: 'failureReason', header: 'Failure Reason' },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge> },
    { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Failed Transactions" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${stats.retryRequired} failed transactions require retry.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={AlertTriangle} label="Failed Today" value={stats.failedToday} status={status} tone="danger" />
        <SummaryCard icon={RotateCcw} label="Retry Required" value={stats.retryRequired} status={status} tone="warning" />
        <SummaryCard icon={TrendingDown} label="Failure Rate" value={`${stats.failureRate}%`} status={status} tone="danger" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Institution-wide Failed Transaction Log" description="Track and resolve unsuccessful payment attempts across all accountants" />

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchFailed} />}

        {status === 'success' && items.length === 0 && (
          <EmptyState icon={CheckCircle2} title="No failed transactions" description="Every payment attempt has gone through." />
        )}

        {status === 'success' && items.length > 0 && <DataTable columns={columns} rows={items} emptyMessage="No failed transactions." />}
      </div>
    </div>
  )
}
