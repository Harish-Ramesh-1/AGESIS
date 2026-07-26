import { useState } from 'react'
import { FileOutput } from 'lucide-react'
import clsx from 'clsx'
import { useExportStore } from '../store/exportStore'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { downloadCsv, downloadPdf, printContent } from '../utils/exportUtils'
import { CAMPUS_OPTIONS, CLASS_OPTIONS, FEE_CATEGORY_OPTIONS, SECTION_OPTIONS } from '../utils/reportsUtils'
import { PAYMENT_METHODS } from '../services/reportsService'

const REPORT_OPTIONS = [
  'Daily Collection',
  'Weekly Collection',
  'Monthly Revenue',
  'Outstanding Dues',
  'Payment Analytics',
  'Collection Analytics',
  'Refund Report',
  'Late Fee Report',
]

const COLUMN_OPTIONS = ['Student', 'Class & Section', 'Fee Category', 'Amount', 'Payment Method', 'Status', 'Date']
const SORT_OPTIONS = ['Date (Newest First)', 'Date (Oldest First)', 'Amount (High to Low)', 'Amount (Low to High)', 'Student Name (A–Z)']
const GROUP_OPTIONS = ['None', 'By Class', 'By Fee Category', 'By Payment Method', 'By Month']
const FORMATS = ['PDF', 'Excel', 'CSV', 'Print Ready']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function ReportBuilder() {
  const requestExport = useExportStore((state) => state.requestExport)
  const isExporting = useExportStore((state) => state.isExporting)

  const [reportType, setReportType] = useState(REPORT_OPTIONS[0])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [campus, setCampus] = useState(CAMPUS_OPTIONS[0])
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [feeCategory, setFeeCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [columns, setColumns] = useState(() => new Set(COLUMN_OPTIONS))
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])
  const [groupBy, setGroupBy] = useState(GROUP_OPTIONS[0])
  const [format, setFormat] = useState('PDF')

  function toggleColumn(column) {
    setColumns((prev) => {
      const next = new Set(prev)
      if (next.has(column)) next.delete(column)
      else next.add(column)
      return next
    })
  }

  async function handleGenerate() {
    await requestExport({ reportName: reportType, format })

    const summaryLines = [
      `Report: ${reportType}`,
      `Academic Year: ${academicYear} · Campus: ${campus}`,
      `Class: ${className || 'All'}-${section || 'All'} · Fee Category: ${feeCategory || 'All'} · Method: ${paymentMethod || 'All'}`,
      `Date Range: ${dateFrom || '—'} to ${dateTo || '—'}`,
      `Columns: ${[...columns].join(', ')}`,
      `Sorted by: ${sortBy} · Grouped by: ${groupBy}`,
    ]

    if (format === 'CSV' || format === 'Excel') {
      downloadCsv(`${reportType.replace(/\s+/g, '-').toLowerCase()}.csv`, ['Field', 'Value'], summaryLines.map((line) => line.split(': ')))
    } else if (format === 'PDF') {
      await downloadPdf(`${reportType.replace(/\s+/g, '-').toLowerCase()}.pdf`, reportType, summaryLines)
    } else {
      printContent(reportType, summaryLines)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Custom Report Builder" description="Configure a report to your exact requirements" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Select Report</label>
          <select value={reportType} onChange={(event) => setReportType(event.target.value)} className={selectClass}>
            {REPORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={selectClass} aria-label="Date from" />
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={selectClass} aria-label="Date to" />
          <select value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={selectClass} aria-label="Academic year">
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
          <select value={campus} onChange={(event) => setCampus(event.target.value)} className={selectClass} aria-label="Campus">
            {CAMPUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={className} onChange={(event) => setClassName(event.target.value)} className={selectClass} aria-label="Class">
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Class {option}
              </option>
            ))}
          </select>
          <select value={section} onChange={(event) => setSection(event.target.value)} className={selectClass} aria-label="Section">
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Section {option}
              </option>
            ))}
          </select>
          <select value={feeCategory} onChange={(event) => setFeeCategory(event.target.value)} className={selectClass} aria-label="Fee category">
            <option value="">All Fee Categories</option>
            {FEE_CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={selectClass} aria-label="Payment method">
            <option value="">All Payment Methods</option>
            {PAYMENT_METHODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Columns</p>
          <div className="flex flex-wrap gap-2">
            {COLUMN_OPTIONS.map((column) => (
              <button
                key={column}
                type="button"
                onClick={() => toggleColumn(column)}
                aria-pressed={columns.has(column)}
                className={clsx(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
                  columns.has(column)
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                )}
              >
                {column}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Sorting</label>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={selectClass}>
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Grouping</label>
            <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)} className={selectClass}>
              {GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Format</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormat(item)}
                aria-pressed={format === item}
                className={clsx(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
                  format === item
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <PrimaryButton fullWidth={false} onClick={handleGenerate} isLoading={isExporting}>
          <FileOutput className="h-4 w-4" aria-hidden="true" />
          Generate Report
        </PrimaryButton>
      </div>
    </div>
  )
}
