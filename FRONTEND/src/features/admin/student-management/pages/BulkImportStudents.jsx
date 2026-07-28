import { useEffect, useRef, useState } from 'react'
import { Download, FileSpreadsheet, FileUp, UploadCloud } from 'lucide-react'
import { useBulkImportStore } from '../store/bulkImportStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import Badge from '../../../../components/common/Badge'
import { GlassButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ResponsiveTable from '../components/ResponsiveTable'

const STATUS_VARIANT = { success: 'success', partial: 'warning', failed: 'danger' }
const STATUS_LABEL = { success: 'Success', partial: 'Partial', failed: 'Failed' }

const COLUMNS = [
  { key: 'fileName', header: 'File Name' },
  { key: 'uploadedBy', header: 'Uploaded By' },
  { key: 'rowsImported', header: 'Rows Imported' },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
]

export default function BulkImportStudents() {
  const status = useBulkImportStore((state) => state.status)
  const error = useBulkImportStore((state) => state.error)
  const history = useBulkImportStore((state) => state.history)
  const fetchHistory = useBulkImportStore((state) => state.fetchHistory)

  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  function handleDragOver(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setSelectedFileName(file.name)
  }

  function handleBrowseClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (file) setSelectedFileName(file.name)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Bulk Import Students"
        extraControls={<GlassButton icon={Download}>Download Template</GlassButton>}
      />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Upload Student Records</h2>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ease-premium ${
            isDragging
              ? 'border-brand-500 bg-brand-50/60 dark:border-brand-400 dark:bg-brand-500/10'
              : 'border-slate-300/70 bg-white/20 dark:border-white/15 dark:bg-white/[0.02]'
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <UploadCloud className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Drag &amp; drop your student records file here</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Supports .csv, .xlsx up to 10MB</p>
          </div>
          <SecondaryButton fullWidth={false} onClick={handleBrowseClick} className="px-6">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Browse Files
          </SecondaryButton>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} aria-hidden="true" tabIndex={-1} />
          {selectedFileName && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-brand-300" role="status">
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              Selected: {selectedFileName} (mock — import not wired up)
            </p>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Import History</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchHistory} />}

        {status === 'success' && (
          <ResponsiveTable
            columns={COLUMNS}
            rows={history}
            titleKey="fileName"
            subtitleKey="uploadedBy"
            trailingKey="status"
            emptyIcon={FileSpreadsheet}
            emptyTitle="No import history"
          />
        )}
      </div>
    </div>
  )
}
