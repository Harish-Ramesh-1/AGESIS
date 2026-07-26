import { useState } from 'react'
import { ChevronDown, Download, RotateCcw, ShieldCheck, X } from 'lucide-react'
import clsx from 'clsx'
import { useRefundStore } from '../store/refundStore'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import Timeline from '../../../../components/common/Timeline'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { formatDate } from '../../../../utils/formatDate'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

export default function RefundTable({ statusFilter }) {
  const status = useRefundStore((state) => state.status)
  const allRequests = useRefundStore((state) => state.requests)
  const requests = statusFilter ? allRequests.filter((item) => statusFilter.includes(item.approvalStatus)) : allRequests
  const error = useRefundStore((state) => state.error)
  const actioningId = useRefundStore((state) => state.actioningId)
  const actOnRefund = useRefundStore((state) => state.actOnRefund)
  const [expandedId, setExpandedId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load refund requests. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No refund requests" description="Refund requests will appear here." />
  }

  function handleGenerateReceipt(item) {
    downloadTextFile(
      `${item.id}-refund-receipt.txt`,
      [
        'AGESIS International School',
        'Refund Receipt',
        '',
        `Refund ID: ${item.id}`,
        `Original Transaction: ${item.originalTransactionId}`,
        `Student: ${item.studentName}`,
        `Amount Refunded: ${formatCurrency(item.amount)}`,
        `Refund Method: ${item.refundMethod}`,
        `Processed By: ${item.processedBy ?? '—'}`,
      ].join('\n'),
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((item) => {
        const isBusy = actioningId === item.id
        const isExpanded = expandedId === item.id
        const isRejecting = rejectingId === item.id
        return (
          <li key={item.id} className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.id}</p>
                  <Badge variant={PAYMENT_STATUS_VARIANT[item.approvalStatus]}>{PAYMENT_STATUS_LABEL[item.approvalStatus]}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.studentName} · Original {item.originalTransactionId}
                </p>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.reason}</p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div>
                <p className="text-slate-400 dark:text-slate-500">Refund Method</p>
                <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{item.refundMethod}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500">Processed By</p>
                <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{item.processedBy ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500">Requested</p>
                <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(item.timeline[0]?.date)}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')} aria-hidden="true" />
                {isExpanded ? 'Hide' : 'View'} Approval Timeline
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                <Timeline
                  items={item.timeline.map((step) => ({
                    id: step.id,
                    icon: ShieldCheck,
                    tone: 'brand',
                    title: step.title,
                    description: step.description,
                    meta: formatDate(step.date),
                  }))}
                />
              </div>
            )}

            {item.approvalStatus === 'pending' && !isRejecting && (
              <div className="mt-3 flex flex-wrap gap-2">
                <PrimaryButton fullWidth={false} isLoading={isBusy} onClick={() => actOnRefund(item.id, 'approve')}>
                  Approve
                </PrimaryButton>
                <SecondaryButton fullWidth={false} disabled={isBusy} onClick={() => setRejectingId(item.id)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Reject
                </SecondaryButton>
              </div>
            )}

            {isRejecting && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-red-200/70 bg-red-50/60 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                <label htmlFor={`reject-reason-${item.id}`} className="text-xs font-medium text-red-700 dark:text-red-300">
                  Rejection reason
                </label>
                <input
                  id={`reject-reason-${item.id}`}
                  type="text"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  className="rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-clay-inset focus:border-red-400 focus:outline-none dark:border-red-500/30 dark:bg-slate-900/60 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  <SecondaryButton fullWidth={false} onClick={() => setRejectingId(null)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    fullWidth={false}
                    className="bg-red-600 hover:bg-red-700"
                    isLoading={isBusy}
                    onClick={async () => {
                      await actOnRefund(item.id, 'reject', { reason: rejectReason })
                      setRejectingId(null)
                      setRejectReason('')
                    }}
                  >
                    Confirm Reject
                  </PrimaryButton>
                </div>
              </div>
            )}

            {item.approvalStatus === 'approved' && (
              <div className="mt-3">
                <PrimaryButton fullWidth={false} isLoading={isBusy} onClick={() => actOnRefund(item.id, 'process')}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Process Refund
                </PrimaryButton>
              </div>
            )}

            {item.approvalStatus === 'processed' && (
              <div className="mt-3">
                <SecondaryButton fullWidth={false} onClick={() => handleGenerateReceipt(item)}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Generate Refund Receipt
                </SecondaryButton>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
