import { ChevronDown, Download, Eye, Pin, PinOff, Printer, Star, StarOff } from 'lucide-react'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import ActionDropdown from './ActionDropdown'
import { useInvoiceStore } from '../store/invoiceStore'
import { downloadPdf, printContent } from '../utils/exportUtils'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const STATUS_VARIANT = { paid: 'success', pending: 'warning', overdue: 'danger' }

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function InvoiceTable({ invoices, onPreview, selectedIds = [], onToggleSelect }) {
  const pinnedIds = useInvoiceStore((state) => state.pinnedIds)
  const favouriteIds = useInvoiceStore((state) => state.favouriteIds)
  const togglePin = useInvoiceStore((state) => state.togglePin)
  const toggleFavourite = useInvoiceStore((state) => state.toggleFavourite)
  const recordDownload = useInvoiceStore((state) => state.recordDownload)

  function handleDownload(invoice) {
    downloadPdf(`${invoice.id}.pdf`, 'Invoice', [
      `Invoice Number: ${invoice.id}`,
      `Generated: ${formatDate(invoice.generatedDate)}`,
      `Fee Type: ${invoice.feeType}`,
      `Amount: ${formatCurrency(invoice.amount)}`,
      `Due Date: ${formatDate(invoice.dueDate)}`,
      `Status: ${invoice.status}`,
    ])
    recordDownload(invoice)
  }

  function handlePrint(invoice) {
    printContent('Invoice', [
      `Invoice Number: ${invoice.id}`,
      `Fee Type: ${invoice.feeType}`,
      `Amount: ${formatCurrency(invoice.amount)}`,
      `Due Date: ${formatDate(invoice.dueDate)}`,
    ])
  }

  function buildActions(invoice) {
    const isPinned = pinnedIds.includes(invoice.id)
    const isFavourite = favouriteIds.includes(invoice.id)
    return [
      { label: 'View', icon: Eye, onClick: () => onPreview(invoice) },
      { label: 'Download PDF', icon: Download, onClick: () => handleDownload(invoice) },
      { label: 'Print', icon: Printer, onClick: () => handlePrint(invoice) },
      { label: isPinned ? 'Unpin' : 'Pin', icon: isPinned ? PinOff : Pin, onClick: () => togglePin(invoice.id) },
      {
        label: isFavourite ? 'Remove Favourite' : 'Add to Favourites',
        icon: isFavourite ? StarOff : Star,
        onClick: () => toggleFavourite(invoice.id),
      },
    ]
  }

  const columns = [
    {
      key: 'select',
      header: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => onToggleSelect?.(row.id)}
          aria-label={`Select invoice ${row.id}`}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus:ring-brand-500 dark:border-white/20"
        />
      ),
    },
    { key: 'id', header: 'Invoice Number' },
    { key: 'generatedDate', header: 'Generated Date', render: (row) => formatDate(row.generatedDate) },
    { key: 'feeType', header: 'Fee Type' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{statusLabel(row.status)}</Badge>,
    },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => <ActionDropdown actions={buildActions(row)} label={`Actions for ${row.id}`} />,
    },
  ]

  return (
    <>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={invoices} emptyMessage="No invoices found." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {invoices.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No invoices found.</p>
        )}
        {invoices.map((invoice) => (
          <details
            key={invoice.id}
            className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(invoice.id)}
                  onChange={() => onToggleSelect?.(invoice.id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select invoice ${invoice.id}`}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus:ring-brand-500 dark:border-white/20"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{invoice.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.feeType}</p>
                </div>
              </div>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(invoice.amount)}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Generated</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(invoice.generatedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Due Date</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Status</span>
                <Badge variant={STATUS_VARIANT[invoice.status]}>{statusLabel(invoice.status)}</Badge>
              </div>
              <div className="mt-1 flex justify-end">
                <ActionDropdown actions={buildActions(invoice)} label={`Actions for ${invoice.id}`} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
