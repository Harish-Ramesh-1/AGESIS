import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, FileClock, FileText, UserRound, UserPlus, Wallet2, X } from 'lucide-react'
import clsx from 'clsx'
import { useInvoiceGeneratorStore } from '../store/invoiceGeneratorStore'
import DocumentsPageHeader from '../components/DocumentsPageHeader'
import SummaryCard from '../components/SummaryCard'
import StudentSearchCard from '../components/StudentSearchCard'
import ManualEntryCard from '../components/ManualEntryCard'
import InvoiceBuilder from '../components/InvoiceBuilder'
import { formatCurrency } from '../../../utils/formatCurrency'

const MODES = [
  { key: 'search', label: 'Find Existing Student', icon: UserRound },
  { key: 'manual', label: 'Manual Entry', icon: UserPlus },
]

export default function GenerateInvoice() {
  const listStatus = useInvoiceGeneratorStore((state) => state.listStatus)
  const invoices = useInvoiceGeneratorStore((state) => state.invoices)
  const fetchInvoices = useInvoiceGeneratorStore((state) => state.fetchInvoices)
  const searchStatus = useInvoiceGeneratorStore((state) => state.searchStatus)
  const searchResults = useInvoiceGeneratorStore((state) => state.searchResults)
  const searchStudents = useInvoiceGeneratorStore((state) => state.searchStudents)
  const selectedStudent = useInvoiceGeneratorStore((state) => state.selectedStudent)
  const selectStudent = useInvoiceGeneratorStore((state) => state.selectStudent)
  const clearStudent = useInvoiceGeneratorStore((state) => state.clearStudent)

  const [mode, setMode] = useState('search')

  useEffect(() => {
    fetchInvoices({})
  }, [fetchInvoices])

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const month = today.slice(0, 7)
    const generatedToday = invoices.filter((row) => row.createdDate.slice(0, 10) === today).length
    const pending = invoices.filter((row) => row.status === 'draft').length
    const monthly = invoices.filter((row) => row.createdDate.slice(0, 7) === month)
    const outstanding = invoices.filter((row) => !['archived', 'cancelled'].includes(row.status)).reduce((sum, row) => sum + row.totalAmount, 0)
    return { generatedToday, pending, monthlyCount: monthly.length, outstanding }
  }, [invoices])

  return (
    <div className="flex flex-col gap-6">
      <DocumentsPageHeader pageTitle="Generate Invoice" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={FileText} label="Invoices Generated Today" value={summary.generatedToday} status={listStatus} />
        <SummaryCard icon={FileClock} label="Pending Invoice Generation" value={summary.pending} status={listStatus} />
        <SummaryCard icon={CalendarDays} label="This Month Invoices" value={summary.monthlyCount} status={listStatus} />
        <SummaryCard icon={Wallet2} label="Outstanding Invoice Amount" value={formatCurrency(summary.outstanding)} status={listStatus} />
      </div>

      {!selectedStudent && (
        <>
          <div className="flex gap-2" role="tablist" aria-label="Student lookup mode">
            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={mode === item.key}
                onClick={() => setMode(item.key)}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
                  mode === item.key
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          {mode === 'search' ? (
            <StudentSearchCard
              title="Student Search"
              description="Find a student to generate an invoice for"
              searchStatus={searchStatus}
              searchResults={searchResults}
              onSearch={searchStudents}
              onSelect={selectStudent}
            />
          ) : (
            <ManualEntryCard
              title="Manual Entry"
              description="Enter the registration number and student details directly, then set the exact fee amount on the invoice"
              onSubmit={selectStudent}
            />
          )}
        </>
      )}

      {selectedStudent && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Generating invoice for <span className="font-semibold text-slate-900 dark:text-white">{selectedStudent.name}</span>
              {selectedStudent.isManual && <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(manually entered)</span>}
            </p>
            <button
              type="button"
              onClick={clearStudent}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Change Student
            </button>
          </div>
          <InvoiceBuilder key={selectedStudent.id} student={selectedStudent} />
        </div>
      )}
    </div>
  )
}
