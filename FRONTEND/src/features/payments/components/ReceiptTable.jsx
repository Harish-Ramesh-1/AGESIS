import { ChevronDown, Download, Eye, Pin, PinOff, Printer, Share2, Star, StarOff } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import ActionDropdown from './ActionDropdown'
import { useReceiptStore } from '../store/receiptStore'
import useDocumentActions from '../hooks/useDocumentActions'
import { downloadPdf, printContent } from '../utils/exportUtils'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

export default function ReceiptTable({ receipts, onPreview }) {
  const pinnedIds = useReceiptStore((state) => state.pinnedIds)
  const favouriteIds = useReceiptStore((state) => state.favouriteIds)
  const togglePin = useReceiptStore((state) => state.togglePin)
  const toggleFavourite = useReceiptStore((state) => state.toggleFavourite)
  const recordDownload = useReceiptStore((state) => state.recordDownload)
  const { shareDocument } = useDocumentActions()

  function handleDownload(receipt) {
    downloadPdf(`${receipt.id}.pdf`, 'Payment Receipt', [
      `Receipt Number: ${receipt.id}`,
      `Transaction ID: ${receipt.transactionId}`,
      `Date: ${formatDate(receipt.paymentDate)}`,
      `Amount: ${formatCurrency(receipt.amount)}`,
      `Method: ${receipt.method}`,
    ])
    recordDownload(receipt)
  }

  function handlePrint(receipt) {
    printContent('Payment Receipt', [
      `Receipt Number: ${receipt.id}`,
      `Amount: ${formatCurrency(receipt.amount)}`,
      `Method: ${receipt.method}`,
    ])
  }

  function buildActions(receipt) {
    const isPinned = pinnedIds.includes(receipt.id)
    const isFavourite = favouriteIds.includes(receipt.id)
    return [
      { label: 'Preview', icon: Eye, onClick: () => onPreview(receipt) },
      { label: 'Download', icon: Download, onClick: () => handleDownload(receipt) },
      {
        label: 'Share',
        icon: Share2,
        onClick: () =>
          shareDocument({
            title: `Receipt ${receipt.id}`,
            text: `Receipt ${receipt.id} for ${formatCurrency(receipt.amount)}.`,
          }),
      },
      { label: 'Print', icon: Printer, onClick: () => handlePrint(receipt) },
      { label: isPinned ? 'Unpin' : 'Pin', icon: isPinned ? PinOff : Pin, onClick: () => togglePin(receipt.id) },
      {
        label: isFavourite ? 'Remove Favourite' : 'Add to Favourites',
        icon: isFavourite ? StarOff : Star,
        onClick: () => toggleFavourite(receipt.id),
      },
    ]
  }

  const columns = [
    { key: 'id', header: 'Receipt Number' },
    { key: 'transactionId', header: 'Transaction ID' },
    { key: 'paymentDate', header: 'Payment Date', render: (row) => formatDate(row.paymentDate) },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'method', header: 'Method' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => <ActionDropdown actions={buildActions(row)} label={`Actions for ${row.id}`} />,
    },
  ]

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={receipts} emptyMessage="No receipts found." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {receipts.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No receipts found.</p>
        )}
        {receipts.map((receipt) => (
          <details
            key={receipt.id}
            className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{receipt.id}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(receipt.paymentDate)}</p>
              </div>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(receipt.amount)}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Transaction ID</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Method</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{receipt.method}</span>
              </div>
              <div className="mt-1 flex justify-end">
                <ActionDropdown actions={buildActions(receipt)} label={`Actions for ${receipt.id}`} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
