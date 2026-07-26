import { useState } from 'react'
import { CheckCircle2, ChevronDown, CircleX, Phone, RotateCcw } from 'lucide-react'
import { useFailedTransactionsStore } from '../store/failedTransactionsStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

export default function FailedTransactionTable() {
  const status = useFailedTransactionsStore((state) => state.status)
  const items = useFailedTransactionsStore((state) => state.items)
  const error = useFailedTransactionsStore((state) => state.error)
  const actioningId = useFailedTransactionsStore((state) => state.actioningId)
  const retry = useFailedTransactionsStore((state) => state.retry)
  const resolve = useFailedTransactionsStore((state) => state.resolve)
  const [expandedId, setExpandedId] = useState(null)

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load failed transactions. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState icon={CheckCircle2} title="No failed transactions" description="Every payment attempt has gone through." />
  }

  function Actions({ row }) {
    const isBusy = actioningId === row.id
    if (row.status === 'resolved') {
      return <Badge variant={PAYMENT_STATUS_VARIANT.resolved}>{PAYMENT_STATUS_LABEL.resolved}</Badge>
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
          onClick={() => resolve(row.id)}
          disabled={isBusy}
          aria-label={`Mark ${row.id} resolved`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <a
          href={`tel:${row.parentPhone.replace(/\s+/g, '')}`}
          aria-label={`Call parent of ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
          aria-label={`View logs for ${row.id}`}
          className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          Logs
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'gateway', header: 'Gateway' },
    { key: 'failureReason', header: 'Failure Reason' },
    { key: 'retryCount', header: 'Retries' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge> },
    { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} /> },
  ]

  const expandedItem = items.find((item) => item.id === expandedId)

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={items} emptyMessage="No failed transactions." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {items.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.failureReason}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.amount)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Gateway</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.gateway}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Retries</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.retryCount}</p>
                </div>
              </div>
              <Actions row={row} />
            </div>
          </details>
        ))}
      </div>

      {expandedItem && (
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 text-xs dark:border-white/10 dark:bg-white/[0.03]">
          <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <CircleX className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
            Gateway Response Log · {expandedItem.id}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-emerald-300">
            {`[${formatDate(expandedItem.date)}] ${expandedItem.gateway} → ${expandedItem.gatewayResponse}\nReason: ${expandedItem.failureReason}\nRetry attempts: ${expandedItem.retryCount}`}
          </pre>
        </div>
      )}
    </div>
  )
}
