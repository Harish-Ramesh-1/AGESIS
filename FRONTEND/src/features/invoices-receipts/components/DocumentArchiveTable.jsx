import { useState } from 'react'
import { ChevronDown, Download, Eye, FileArchive, Trash2 } from 'lucide-react'
import { useDocumentArchiveStore } from '../store/documentArchiveStore'
import { useDocumentViewerStore } from '../store/documentViewerStore'
import DataTable from '../../../components/common/DataTable'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatDate } from '../../../utils/formatDate'
import { DOCUMENT_STATUS_LABEL, DOCUMENT_STATUS_VARIANT, formatFileSize } from '../utils/documentsUtils'

export default function DocumentArchiveTable() {
  const status = useDocumentArchiveStore((state) => state.status)
  const documents = useDocumentArchiveStore((state) => state.documents)
  const error = useDocumentArchiveStore((state) => state.error)
  const deleteDocument = useDocumentArchiveStore((state) => state.deleteDocument)
  const openDocument = useDocumentViewerStore((state) => state.openDocument)
  const [confirmingId, setConfirmingId] = useState(null)

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load the archive. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return <EmptyState icon={FileArchive} title="No documents found" description="Try adjusting your search or filters." />
  }

  function handleDownload(row) {
    downloadTextFile(`${row.documentNumber}.txt`, `${row.documentType === 'invoice' ? 'Invoice' : 'Receipt'} ${row.documentNumber}\nStudent: ${row.studentName}`)
  }

  function RowActions({ row }) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => openDocument(row.documentNumber)}
          aria-label={`View ${row.documentNumber}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => handleDownload(row)}
          aria-label={`Download ${row.documentNumber}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingId(row.documentNumber)}
          aria-label={`Delete ${row.documentNumber}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const columns = [
    { key: 'documentNumber', header: 'Document No.' },
    { key: 'documentType', header: 'Type', render: (row) => <Badge variant={row.documentType === 'invoice' ? 'info' : 'success'}>{row.documentType === 'invoice' ? 'Invoice' : 'Receipt'}</Badge> },
    { key: 'studentName', header: 'Student' },
    { key: 'generatedDate', header: 'Generated Date', render: (row) => formatDate(row.generatedDate) },
    { key: 'createdBy', header: 'Created By' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={DOCUMENT_STATUS_VARIANT[row.status]}>{DOCUMENT_STATUS_LABEL[row.status]}</Badge> },
    { key: 'fileSizeKb', header: 'File Size', render: (row) => formatFileSize(row.fileSizeKb) },
    { key: 'actions', header: 'Actions', render: (row) => <RowActions row={row} /> },
  ]

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={documents} keyField="documentNumber" emptyMessage="No documents found." />
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {documents.map((row) => (
          <details key={row.documentNumber} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.documentNumber}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant={DOCUMENT_STATUS_VARIANT[row.status]}>{DOCUMENT_STATUS_LABEL[row.status]}</Badge>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Generated</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.generatedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">File Size</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatFileSize(row.fileSizeKb)}</p>
                </div>
              </div>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div aria-hidden="true" onClick={() => setConfirmingId(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Delete {confirmingId}?</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">This action is permission-based and cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="flex-1 rounded-2xl border border-white/50 bg-white/50 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(confirmingId)
                  setConfirmingId(null)
                }}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-clay-button transition-all duration-200 ease-premium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
