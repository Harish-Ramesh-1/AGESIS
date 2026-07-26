import { ChevronDown, Copy, Download, Eye, FileText, Share2 } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import ActionDropdown from './ActionDropdown'
import useDocumentActions from '../hooks/useDocumentActions'
import { downloadPdf } from '../utils/exportUtils'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const STATUS_VARIANT = { paid: 'success', pending: 'warning', failed: 'danger', refunded: 'info' }

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function TransactionTable({ transactions, onView }) {
  const { copyToClipboard, shareDocument } = useDocumentActions()

  function buildActions(transaction) {
    const actions = [
      { label: 'View', icon: Eye, onClick: () => onView(transaction) },
      { label: 'Copy Transaction ID', icon: Copy, onClick: () => copyToClipboard(transaction.id) },
    ]

    if (transaction.receiptNumber) {
      actions.push({
        label: 'Download Receipt',
        icon: Download,
        onClick: () =>
          downloadPdf(`${transaction.receiptNumber}.pdf`, 'Payment Receipt', [
            `Receipt Number: ${transaction.receiptNumber}`,
            `Transaction ID: ${transaction.id}`,
            `Date: ${formatDate(transaction.date)}`,
            `Fee Category: ${transaction.feeCategory}`,
            `Amount: ${formatCurrency(transaction.amount)}`,
            `Method: ${transaction.method}`,
          ]),
      })
      actions.push({
        label: 'Share Receipt',
        icon: Share2,
        onClick: () =>
          shareDocument({
            title: `Receipt ${transaction.receiptNumber}`,
            text: `Receipt ${transaction.receiptNumber} for ${formatCurrency(transaction.amount)} paid on ${formatDate(transaction.date)}.`,
          }),
      })
    }

    if (transaction.invoiceNumber) {
      actions.push({
        label: 'Download Invoice',
        icon: FileText,
        onClick: () =>
          downloadPdf(`${transaction.invoiceNumber}.pdf`, 'Invoice', [
            `Invoice Number: ${transaction.invoiceNumber}`,
            `Transaction ID: ${transaction.id}`,
            `Fee Category: ${transaction.feeCategory}`,
            `Amount: ${formatCurrency(transaction.amount)}`,
          ]),
      })
    }

    return actions
  }

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'receiptNumber', header: 'Receipt No.', render: (row) => row.receiptNumber ?? '—' },
    { key: 'date', header: 'Payment Date', render: (row) => formatDate(row.date) },
    { key: 'feeCategory', header: 'Fee Category' },
    { key: 'method', header: 'Method' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => <ActionDropdown actions={buildActions(row)} label={`Actions for ${row.id}`} />,
    },
  ]

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={transactions} emptyMessage="No transactions match your filters." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {transactions.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No transactions match your filters.
          </p>
        )}
        {transactions.map((transaction) => (
          <details
            key={transaction.id}
            className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{transaction.id}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(transaction.date)}</p>
              </div>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(transaction.amount)}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Receipt No.</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {transaction.receiptNumber ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Fee Category</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{transaction.feeCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Method</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{transaction.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Status</span>
                <Badge variant={STATUS_VARIANT[transaction.status]}>{statusLabel(transaction.status)}</Badge>
              </div>
              <div className="mt-1 flex justify-end">
                <ActionDropdown actions={buildActions(transaction)} label={`Actions for ${transaction.id}`} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
