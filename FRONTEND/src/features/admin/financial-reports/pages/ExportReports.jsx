import { useEffect, useState } from 'react'
import { Download, FileOutput } from 'lucide-react'
import { useExportStore } from '../store/exportStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ReportsNav from '../components/ReportsNav'
import SectionHeader from '../components/SectionHeader'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import EmptyState from '../../../../components/common/EmptyState'
import DataTable from '../../../../components/common/DataTable'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import { downloadCsv, downloadPdf } from '../utils/exportUtils'
import { EXPORT_STATUS_LABEL, EXPORT_STATUS_VARIANT, formatFileSize } from '../utils/reportsUtils'

const REPORT_OPTIONS = [
  'Daily Collection',
  'Monthly Revenue',
  'Outstanding Dues',
  'Collection Analytics',
  'Payment Analytics',
  'Consolidated Institution Report',
]

const FORMATS = ['PDF', 'CSV']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function ExportReports() {
  const history = useExportStore((state) => state.history)
  const historyStatus = useExportStore((state) => state.historyStatus)
  const historyError = useExportStore((state) => state.historyError)
  const isExporting = useExportStore((state) => state.isExporting)
  const fetchHistory = useExportStore((state) => state.fetchHistory)
  const requestExport = useExportStore((state) => state.requestExport)

  const [reportType, setReportType] = useState(REPORT_OPTIONS[0])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState('PDF')

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  async function handleGenerate() {
    const record = await requestExport({ reportName: reportType, format })
    if (!record) return
    triggerDownload(record.reportName, format, dateFrom, dateTo)
  }

  async function triggerDownload(reportName, exportFormat, from, to) {
    const summaryLines = [
      `Report: ${reportName}`,
      `Date Range: ${from || '—'} to ${to || '—'}`,
      `Generated: ${new Date().toLocaleString()} · AGESIS Admin Portal`,
    ]
    if (exportFormat === 'CSV') {
      downloadCsv(`${reportName.replace(/\s+/g, '-').toLowerCase()}.csv`, ['Field', 'Value'], summaryLines.map((line) => line.split(': ')))
    } else {
      await downloadPdf(`${reportName.replace(/\s+/g, '-').toLowerCase()}.pdf`, reportName, summaryLines)
    }
  }

  function handleRedownload(record) {
    triggerDownload(record.reportName, record.format, '', '')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Export Reports" />
      <ReportsNav />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Generate a Report" description="Pick a report type, date range and format to export" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="export-report-type" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Report Type
            </label>
            <select id="export-report-type" value={reportType} onChange={(event) => setReportType(event.target.value)} className={selectClass}>
              {REPORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="export-date-from" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                From
              </label>
              <input id="export-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={selectClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="export-date-to" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                To
              </label>
              <input id="export-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={selectClass} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Format</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Export format">
              {FORMATS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormat(item)}
                  aria-pressed={format === item}
                  className={
                    format === item
                      ? 'rounded-full bg-brand-600 px-4 py-2 text-xs font-medium text-white shadow-clay-button transition-all duration-200 ease-premium'
                      : 'rounded-full border border-white/40 bg-white/40 px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-200 ease-premium hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]'
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <PrimaryButton fullWidth={false} onClick={handleGenerate} isLoading={isExporting}>
            <FileOutput className="h-4 w-4" aria-hidden="true" />
            Generate Export
          </PrimaryButton>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Export History" description="Reports generated across the admin portal" />

        {historyStatus === 'loading' && (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        )}

        {historyStatus === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load export history. {historyError}</p>}

        {historyStatus === 'success' && history.length === 0 && (
          <EmptyState icon={FileOutput} title="No exports yet" description="Reports you generate will appear here." />
        )}

        {historyStatus === 'success' && history.length > 0 && (
          <DataTable
            columns={[
              { key: 'reportName', header: 'Report Name' },
              { key: 'generatedBy', header: 'Generated By' },
              { key: 'requestedAt', header: 'Date', render: (row) => formatDate(row.requestedAt) },
              { key: 'format', header: 'Format' },
              { key: 'fileSizeKb', header: 'Size', render: (row) => formatFileSize(row.fileSizeKb) },
              { key: 'status', header: 'Status', render: (row) => <Badge variant={EXPORT_STATUS_VARIANT[row.status]}>{EXPORT_STATUS_LABEL[row.status]}</Badge> },
              {
                key: 'actions',
                header: 'Download',
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => handleRedownload(row)}
                    disabled={row.status !== 'completed'}
                    aria-label={`Download ${row.reportName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </button>
                ),
              },
            ]}
            rows={history}
            keyField="id"
          />
        )}
      </div>
    </div>
  )
}
