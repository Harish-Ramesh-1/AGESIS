import { useEffect, useState } from 'react'
import { FileStack, Play, Users } from 'lucide-react'
import { useBulkGenerationStore } from '../store/bulkGenerationStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'
import SummaryCard from '../components/SummaryCard'
import { CLASS_OPTIONS, SECTION_OPTIONS, TERM_OPTIONS } from '../services/invoicesService'
import { BULK_RUN_STATUS_LABEL, BULK_RUN_STATUS_VARIANT } from '../utils/invoicesUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const COLUMNS = [
  { key: 'id', header: 'Run ID' },
  { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  { key: 'scope', header: 'Scope' },
  { key: 'term', header: 'Term' },
  { key: 'count', header: 'Generated' },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={BULK_RUN_STATUS_VARIANT[row.status]}>{BULK_RUN_STATUS_LABEL[row.status]}</Badge> },
  { key: 'triggeredBy', header: 'Triggered By' },
]

export default function BulkInvoiceGeneration() {
  const previewStatus = useBulkGenerationStore((state) => state.previewStatus)
  const previewCount = useBulkGenerationStore((state) => state.previewCount)
  const isGenerating = useBulkGenerationStore((state) => state.isGenerating)
  const lastRun = useBulkGenerationStore((state) => state.lastRun)
  const historyStatus = useBulkGenerationStore((state) => state.historyStatus)
  const historyError = useBulkGenerationStore((state) => state.historyError)
  const history = useBulkGenerationStore((state) => state.history)
  const fetchPreview = useBulkGenerationStore((state) => state.fetchPreview)
  const fetchHistory = useBulkGenerationStore((state) => state.fetchHistory)
  const generate = useBulkGenerationStore((state) => state.generate)

  const [classId, setClassId] = useState('')
  const [section, setSection] = useState('')
  const [term, setTerm] = useState(TERM_OPTIONS[0])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    fetchPreview({ classId, section })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, section])

  async function handleGenerate() {
    await generate({ classId, section, term, studentCount: previewCount })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Bulk Invoice Generation" />

      <div aria-live="polite" className="sr-only">
        {lastRun && `Bulk run ${lastRun.id} generated ${lastRun.count} invoices.`}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard icon={Users} label="Students in Scope" value={previewCount} status={previewStatus === 'loading' ? 'loading' : 'success'} tone="brand" />
        <SummaryCard icon={FileStack} label="Total Bulk Runs" value={history.length} status={historyStatus} tone="brand" />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Trigger Institution-wide Bulk Run" description="Select scope and term, then generate invoices for every affected student" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bulk-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Class
            </label>
            <select id="bulk-class" value={classId} onChange={(event) => setClassId(event.target.value)} className={selectClass}>
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Class {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bulk-section" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Section
            </label>
            <select id="bulk-section" value={section} onChange={(event) => setSection(event.target.value)} disabled={!classId} className={selectClass}>
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Section {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bulk-term" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Term
            </label>
            <select id="bulk-term" value={term} onChange={(event) => setTerm(event.target.value)} className={selectClass}>
              {TERM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          This run will affect{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {previewStatus === 'loading' ? '…' : previewCount} student{previewCount === 1 ? '' : 's'}
          </span>
          .
        </p>

        <div className="mt-4">
          <PrimaryButton fullWidth={false} isLoading={isGenerating} disabled={previewCount === 0} onClick={handleGenerate}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Generate Invoices ({previewCount})
          </PrimaryButton>
        </div>

        {lastRun && (
          <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-300">
            Run {lastRun.id} completed — {lastRun.count} invoices generated for {lastRun.scope}.
          </p>
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Bulk Run History" description="Past institution-wide bulk generation runs" />

        {historyStatus === 'loading' && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        )}

        {historyStatus === 'error' && <ErrorState message={historyError} onRetry={fetchHistory} />}

        {historyStatus === 'success' && history.length === 0 && (
          <EmptyState icon={FileStack} title="No bulk runs yet" description="Bulk generation runs will be logged here." />
        )}

        {historyStatus === 'success' && history.length > 0 && <DataTable columns={COLUMNS} rows={history} emptyMessage="No bulk runs yet." />}
      </div>
    </div>
  )
}
