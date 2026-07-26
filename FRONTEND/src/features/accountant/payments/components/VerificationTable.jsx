import { useState } from 'react'
import { Check, ChevronDown, Eye, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { useVerificationStore } from '../store/verificationStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatRelativeTime } from '../../../../utils/formatDate'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

const GATEWAY_STATUS_VARIANT = { success: 'success', pending: 'warning', flagged: 'danger' }
const GATEWAY_STATUS_LABEL = { success: 'Success', pending: 'Pending Sync', flagged: 'Flagged' }

export default function VerificationTable() {
  const status = useVerificationStore((state) => state.status)
  const items = useVerificationStore((state) => state.items)
  const error = useVerificationStore((state) => state.error)
  const actioningId = useVerificationStore((state) => state.actioningId)
  const verify = useVerificationStore((state) => state.verify)
  const retrySync = useVerificationStore((state) => state.retrySync)
  const [expandedId, setExpandedId] = useState(null)

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load verification queue. {error}</p>

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
    return <EmptyState icon={ShieldCheck} title="Nothing to verify" description="All transactions have been verified." />
  }

  function Actions({ row }) {
    const isBusy = actioningId === row.id
    if (row.verificationStatus !== 'pending') {
      return <Badge variant={PAYMENT_STATUS_VARIANT[row.verificationStatus]}>{PAYMENT_STATUS_LABEL[row.verificationStatus]}</Badge>
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
          aria-label={`View details for ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        {row.gatewayStatus !== 'success' && (
          <button
            type="button"
            onClick={() => retrySync(row.id)}
            disabled={isBusy}
            aria-label={`Retry gateway sync for ${row.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <RefreshCw className={isBusy ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => verify(row.id, 'approve')}
          disabled={isBusy}
          aria-label={`Approve ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => verify(row.id, 'reject')}
          disabled={isBusy}
          aria-label={`Reject ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'gatewayReferenceId', header: 'Gateway Ref. ID' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    {
      key: 'gatewayStatus',
      header: 'Gateway Status',
      render: (row) => <Badge variant={GATEWAY_STATUS_VARIANT[row.gatewayStatus]}>{GATEWAY_STATUS_LABEL[row.gatewayStatus]}</Badge>,
    },
    {
      key: 'verificationDate',
      header: 'Verification Date',
      render: (row) => (row.verificationDate ? formatRelativeTime(row.verificationDate) : '—'),
    },
    { key: 'actions', header: 'Actions', render: (row) => <Actions row={row} /> },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={items} emptyMessage="Nothing to verify." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {items.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.id}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.amount)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Method</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.method}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Gateway Status</p>
                  <Badge variant={GATEWAY_STATUS_VARIANT[row.gatewayStatus]} className="mt-0.5">
                    {GATEWAY_STATUS_LABEL[row.gatewayStatus]}
                  </Badge>
                </div>
              </div>
              <Actions row={row} />
            </div>
          </details>
        ))}
      </div>

      {expandedId && (
        <TransactionDetail item={items.find((item) => item.id === expandedId)} onClose={() => setExpandedId(null)} />
      )}
    </div>
  )
}

function TransactionDetail({ item, onClose }) {
  if (!item) return null
  return (
    <div className="mt-4 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/[0.06]">
      <div className="flex items-center justify-between">
        <SectionHeader title={`Transaction Details · ${item.id}`} />
        <button type="button" onClick={onClose} aria-label="Close details" className="text-slate-500 dark:text-slate-400">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Gateway Reference</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{item.gatewayReferenceId}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Student</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{item.studentName}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 dark:text-slate-500">Amount</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(item.amount)}</dd>
        </div>
      </dl>
    </div>
  )
}
