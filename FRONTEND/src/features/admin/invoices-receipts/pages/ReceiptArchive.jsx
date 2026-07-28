import { useEffect, useState } from 'react'
import { Download, FileArchive, Search } from 'lucide-react'
import { useArchiveStore } from '../store/archiveStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { SecondaryButton } from '../../../../components/common/Button'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import { DOCUMENT_TYPE_LABEL, DOCUMENT_TYPE_VARIANT } from '../utils/invoicesUtils'

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

function handleDownload(row) {
  downloadTextFile(
    `${row.receiptNumber}.txt`,
    [
      'AGESIS International School',
      row.type === 'invoice' ? 'Invoice' : 'Fee Payment Receipt',
      '',
      `Document No.: ${row.receiptNumber}`,
      `Student: ${row.studentName}`,
      `Class: ${row.className}`,
      `Amount: ${formatCurrency(row.amount)}`,
      `Date: ${formatDate(row.date)}`,
    ].join('\n'),
  )
}

export default function ReceiptArchive() {
  const status = useArchiveStore((state) => state.status)
  const error = useArchiveStore((state) => state.error)
  const documents = useArchiveStore((state) => state.documents)
  const fetchDocuments = useArchiveStore((state) => state.fetchDocuments)

  const [query, setQuery] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDocuments({ query, type })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type])

  const columns = [
    { key: 'receiptNumber', header: 'Receipt / Invoice No.' },
    { key: 'studentName', header: 'Student' },
    { key: 'className', header: 'Class' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={DOCUMENT_TYPE_VARIANT[row.type]}>{DOCUMENT_TYPE_LABEL[row.type]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleDownload(row)}
          aria-label={`Download ${row.receiptNumber}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Receipt Archive" />

      <div aria-live="polite" className="sr-only">
        {status === 'success' && `${documents.length} documents matching current filters.`}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Institution-wide Document Archive" description="All invoices and receipts issued across the school" />

        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by receipt number, student or class"
              aria-label="Search receipt archive"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="archive-type" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Document Type
              </label>
              <select id="archive-type" value={type} onChange={(event) => setType(event.target.value)} className={selectClass}>
                <option value="">All Types</option>
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
              </select>
            </div>
            <SecondaryButton fullWidth={false} onClick={() => { setQuery(''); setType('') }}>
              Reset
            </SecondaryButton>
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={() => fetchDocuments({ query, type })} />}

        {status === 'success' && documents.length === 0 && (
          <EmptyState icon={FileArchive} title="No documents found" description="Try adjusting your search or filters." />
        )}

        {status === 'success' && documents.length > 0 && <DataTable columns={columns} rows={documents} keyField="id" emptyMessage="No documents found." />}
      </div>
    </div>
  )
}
