import { ChevronDown, Download, Eye, Receipt } from 'lucide-react'
import { useHistoryStore } from '../store/historyStore'
import { usePaymentReceiptStore } from '../store/receiptStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '../utils/paymentsUtils'

function downloadReceiptFor(row) {
  downloadTextFile(
    `${row.receiptNumber}.txt`,
    [
      'AGESIS International School',
      'Fee Payment Receipt',
      '',
      `Receipt No.: ${row.receiptNumber}`,
      `Transaction ID: ${row.id}`,
      `Date: ${formatDate(row.date)}`,
      `Student: ${row.studentName}`,
      `Payment Method: ${row.method}`,
      `Amount: ${formatCurrency(row.amount)}`,
      `Collected By: ${row.collectedBy}`,
    ].join('\n'),
  )
}

export default function TransactionTable() {
  const status = useHistoryStore((state) => state.status)
  const transactions = useHistoryStore((state) => state.transactions)
  const error = useHistoryStore((state) => state.error)
  const openReceipt = usePaymentReceiptStore((state) => state.openReceipt)

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load payment history. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return <EmptyState icon={Receipt} title="No transactions found" description="Try adjusting your search or filters." />
  }

  function RowActions({ row }) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => openReceipt(row.id)}
          aria-label={`View receipt for ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => downloadReceiptFor(row)}
          aria-label={`Download receipt for ${row.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'receiptNumber', header: 'Receipt No.' },
    { key: 'studentName', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={PAYMENT_STATUS_VARIANT[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge> },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'collectedBy', header: 'Collected By' },
    { key: 'actions', header: 'Actions', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={transactions} emptyMessage="No transactions found." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {transactions.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.receiptNumber}</p>
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
                  <p className="text-slate-400 dark:text-slate-500">Date</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Status</p>
                  <Badge variant={PAYMENT_STATUS_VARIANT[row.status]} className="mt-0.5">
                    {PAYMENT_STATUS_LABEL[row.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Collected By</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.collectedBy}</p>
                </div>
              </div>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
