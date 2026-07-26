import { useEffect, useMemo, useState } from 'react'
import { Check, Coins, HandCoins, Hourglass, ReceiptText, X } from 'lucide-react'
import { useAdjustmentQueueStore } from '../store/adjustmentQueueStore'
import FeeConfigPageHeader from '../components/FeeConfigPageHeader'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { downloadCsv } from '../utils/exportUtils'
import {
  ADJUSTMENT_STATUS_LABEL,
  ADJUSTMENT_STATUS_VARIANT,
  ADJUSTMENT_TYPE_LABEL,
  ADJUSTMENT_TYPE_OPTIONS,
  ADJUSTMENT_TYPE_VARIANT,
} from '../utils/feeConfigUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function FeeAdjustments() {
  const status = useAdjustmentQueueStore((state) => state.status)
  const error = useAdjustmentQueueStore((state) => state.error)
  const requests = useAdjustmentQueueStore((state) => state.requests)
  const fetchRequests = useAdjustmentQueueStore((state) => state.fetchRequests)
  const actioningId = useAdjustmentQueueStore((state) => state.actioningId)
  const approve = useAdjustmentQueueStore((state) => state.approve)
  const reject = useAdjustmentQueueStore((state) => state.reject)

  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filteredRequests = useMemo(
    () => requests.filter((row) => (!statusFilter || row.status === statusFilter) && (!typeFilter || row.adjustmentType === typeFilter)),
    [requests, statusFilter, typeFilter],
  )

  const summary = useMemo(() => {
    const now = new Date()
    const pendingRequests = requests.filter((row) => row.status === 'pending').length
    const approvedThisMonth = requests.filter((row) => {
      if (row.status !== 'approved') return false
      const rowDate = new Date(row.date)
      return rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()
    }).length
    const totalWaivedAmount = requests.filter((row) => row.adjustmentType === 'waiver' && row.status === 'approved').reduce((sum, row) => sum + row.amount, 0)
    const totalAdditionalCharges = requests.filter((row) => row.adjustmentType === 'charge' && row.status === 'approved').reduce((sum, row) => sum + row.amount, 0)
    return { pendingRequests, approvedThisMonth, totalWaivedAmount, totalAdditionalCharges }
  }, [requests])

  function handleExport() {
    downloadCsv(
      'fee-adjustments.csv',
      ['Student', 'Class', 'Type', 'Amount', 'Reason', 'Requested By', 'Status', 'Date'],
      filteredRequests.map((row) => [
        row.studentName,
        `${row.className} - ${row.section}`,
        ADJUSTMENT_TYPE_LABEL[row.adjustmentType],
        row.amount,
        row.reason,
        row.requestedBy,
        ADJUSTMENT_STATUS_LABEL[row.status],
        formatDate(row.date),
      ]),
    )
  }

  const columns = [
    { key: 'studentName', header: 'Student', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</span> },
    { key: 'className', header: 'Class', render: (row) => `${row.className} - ${row.section}` },
    { key: 'adjustmentType', header: 'Type', render: (row) => <Badge variant={ADJUSTMENT_TYPE_VARIANT[row.adjustmentType]}>{ADJUSTMENT_TYPE_LABEL[row.adjustmentType]}</Badge> },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'reason', header: 'Reason' },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={ADJUSTMENT_STATUS_VARIANT[row.status]}>{ADJUSTMENT_STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => approve(row.id)}
              disabled={actioningId === row.id}
              aria-label={`Approve adjustment for ${row.studentName}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-emerald-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => reject(row.id)}
              disabled={actioningId === row.id}
              aria-label={`Reject adjustment for ${row.studentName}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">No action needed</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <FeeConfigPageHeader pageTitle="Fee Adjustments" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Hourglass} label="Pending Requests" value={summary.pendingRequests} status={status} />
        <SummaryCard icon={Check} label="Approved This Month" value={summary.approvedThisMonth} status={status} />
        <SummaryCard icon={HandCoins} label="Total Waived Amount" value={formatCurrency(summary.totalWaivedAmount)} status={status} />
        <SummaryCard icon={Coins} label="Total Additional Charges" value={formatCurrency(summary.totalAdditionalCharges)} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="mb-4 flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Cross-Student Adjustment Queue</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClass} aria-label="Filter by status">
            <option value="">All Statuses</option>
            {Object.entries(ADJUSTMENT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={selectClass} aria-label="Filter by adjustment type">
            <option value="">All Types</option>
            {ADJUSTMENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {ADJUSTMENT_TYPE_LABEL[option]}
              </option>
            ))}
          </select>
        </div>

        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchRequests} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={filteredRequests}
            keyField="id"
            titleKey="studentName"
            subtitleKey="reason"
            trailingKey="amount"
            emptyMessage="No adjustment requests match the selected filters."
          />
        )}
      </div>
    </div>
  )
}
