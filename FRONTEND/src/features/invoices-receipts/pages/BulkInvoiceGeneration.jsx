import { useState } from 'react'
import { CheckCircle2, Download, FileStack, Mail, Play, XCircle } from 'lucide-react'
import { useBulkGenerationStore } from '../store/bulkGenerationStore'
import { PrimaryButton, GlassButton } from '../../../components/common/Button'
import DocumentsPageHeader from '../components/DocumentsPageHeader'
import SummaryCard from '../components/SummaryCard'
import BulkGenerationCard from '../components/BulkGenerationCard'
import ProgressTracker from '../components/ProgressTracker'
import { downloadTextFile } from '../../../utils/downloadTextFile'

export default function BulkInvoiceGeneration() {
  const candidates = useBulkGenerationStore((state) => state.candidates)
  const selectedIds = useBulkGenerationStore((state) => state.selectedIds)
  const isGenerating = useBulkGenerationStore((state) => state.isGenerating)
  const progress = useBulkGenerationStore((state) => state.progress)
  const results = useBulkGenerationStore((state) => state.results)
  const generatedToday = useBulkGenerationStore((state) => state.generatedToday)
  const generate = useBulkGenerationStore((state) => state.generate)
  const retryFailed = useBulkGenerationStore((state) => state.retryFailed)

  const [emailedAll, setEmailedAll] = useState(false)

  const failedCount = results.filter((item) => !item.success).length
  const successCount = results.filter((item) => item.success).length

  function handleDownloadZip() {
    const lines = results.filter((item) => item.success).map((item) => `${item.invoiceId} — ${item.studentName}`)
    downloadTextFile('bulk-invoices-report.txt', ['Bulk Invoice Generation — Report', `Generated: ${new Date().toLocaleString()}`, '', ...lines].join('\n'))
  }

  function handleExportReport() {
    const header = 'Student,Invoice ID,Result'
    const rows = results.map((item) => [item.studentName, item.invoiceId ?? '—', item.success ? 'Success' : 'Failed'].join(','))
    downloadTextFile('bulk-generation-report.csv', [header, ...rows].join('\n'))
  }

  return (
    <div className="flex flex-col gap-6">
      <DocumentsPageHeader pageTitle="Bulk Invoice Generation" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={FileStack} label="Students Selected" value={selectedIds.size} />
        <SummaryCard icon={CheckCircle2} label="Invoices Ready" value={candidates.length} meta="Awaiting invoice generation" />
        <SummaryCard icon={Play} label="Generated Today" value={generatedToday} />
        <SummaryCard icon={XCircle} label="Failed Generation" value={failedCount} />
      </div>

      <BulkGenerationCard />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="flex flex-wrap gap-3">
          <PrimaryButton fullWidth={false} isLoading={isGenerating} disabled={selectedIds.size === 0} onClick={generate}>
            <Play className="h-4 w-4" aria-hidden="true" />
            Generate Bulk Invoices ({selectedIds.size})
          </PrimaryButton>
          <GlassButton onClick={handleDownloadZip} disabled={successCount === 0}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download ZIP
          </GlassButton>
          <GlassButton onClick={() => setEmailedAll(true)} disabled={successCount === 0 || emailedAll}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {emailedAll ? 'Emailed All' : 'Email All'}
          </GlassButton>
          <GlassButton onClick={handleExportReport} disabled={results.length === 0}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Report
          </GlassButton>
        </div>
      </div>

      <ProgressTracker isGenerating={isGenerating} progress={progress} results={results} total={selectedIds.size || results.length} onRetryFailed={retryFailed} />
    </div>
  )
}
