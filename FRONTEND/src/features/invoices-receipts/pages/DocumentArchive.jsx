import { useEffect, useMemo, useRef, useState } from 'react'
import { FileArchive, FileText, HardDrive, Receipt } from 'lucide-react'
import { useDocumentArchiveStore } from '../store/documentArchiveStore'
import { useDocumentViewerStore } from '../store/documentViewerStore'
import DocumentsPageHeader from '../components/DocumentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import SummaryCard from '../components/SummaryCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import DocumentArchiveTable from '../components/DocumentArchiveTable'
import DocumentViewer from '../components/DocumentViewer'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatDate } from '../../../utils/formatDate'
import { DOCUMENT_STATUS_LABEL, formatFileSize } from '../utils/documentsUtils'

const DEFAULT_FILTERS = { documentType: '', className: '', section: '', status: '', date: '' }

export default function DocumentArchive() {
  const status = useDocumentArchiveStore((state) => state.status)
  const documents = useDocumentArchiveStore((state) => state.documents)
  const fetchDocuments = useDocumentArchiveStore((state) => state.fetchDocuments)
  const viewerStatus = useDocumentViewerStore((state) => state.status)

  const [query, setQuery] = useState('')
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDocuments({ query, ...appliedFilters })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, appliedFilters])

  // The viewer's email/print/download actions mutate the underlying invoice/receipt
  // records, but this page's `documents` list holds snapshotted copies from the last
  // fetch — refetch once the viewer closes so status badges (e.g. Sent, Downloaded)
  // reflect what actually happened while it was open.
  const wasViewerOpen = useRef(false)
  useEffect(() => {
    if (viewerStatus !== 'idle') {
      wasViewerOpen.current = true
    } else if (wasViewerOpen.current) {
      wasViewerOpen.current = false
      fetchDocuments({ query, ...appliedFilters })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerStatus])

  const summary = useMemo(() => {
    const invoiceCount = documents.filter((doc) => doc.documentType === 'invoice').length
    const receiptCount = documents.filter((doc) => doc.documentType === 'receipt').length
    const totalKb = documents.reduce((sum, doc) => sum + (doc.fileSizeKb || 0), 0)
    return { total: documents.length, invoiceCount, receiptCount, archiveSize: formatFileSize(totalKb) }
  }, [documents])

  function handleExport() {
    const header = 'Document No.,Type,Student,Generated Date,Created By,Status,File Size'
    const rows = documents.map((row) => [row.documentNumber, row.documentType, row.studentName, formatDate(row.generatedDate), row.createdBy, DOCUMENT_STATUS_LABEL[row.status], formatFileSize(row.fileSizeKb)].join(','))
    downloadTextFile('document-archive.csv', [header, ...rows].join('\n'))
  }

  return (
    <div className="flex flex-col gap-6">
      <DocumentsPageHeader pageTitle="Document Archive" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={FileArchive} label="Total Documents" value={summary.total} status={status} />
        <SummaryCard icon={FileText} label="Invoices" value={summary.invoiceCount} status={status} />
        <SummaryCard icon={Receipt} label="Receipts" value={summary.receiptCount} status={status} />
        <SummaryCard icon={HardDrive} label="Archive Size" value={summary.archiveSize} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Search & Filters" />
        <div className="flex flex-col gap-4">
          <SearchBar
            id="archive-search"
            value={query}
            onChange={setQuery}
            placeholder="Search by document number, receipt number, student or transaction ID"
          />
          <FilterBar
            draftFilters={draftFilters}
            onFilterChange={(key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }))}
            onApply={() => setAppliedFilters(draftFilters)}
            onReset={() => {
              setDraftFilters(DEFAULT_FILTERS)
              setAppliedFilters(DEFAULT_FILTERS)
              setQuery('')
            }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Archived Documents" />
        <DocumentArchiveTable />
      </div>

      {viewerStatus !== 'idle' && <DocumentViewer />}
    </div>
  )
}
