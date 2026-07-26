import { useMemo, useState } from 'react'
import { useBulkGenerationStore } from '../store/bulkGenerationStore'
import Badge from '../../../components/common/Badge'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
const SECTION_OPTIONS = ['A', 'B', 'C']
const FEE_CATEGORY_OPTIONS = ['Tuition Fee', 'Transport Fee', 'Hostel Fee']
const FEE_STATUS_VARIANT = { pending: 'warning', overdue: 'danger' }

export default function BulkGenerationCard() {
  const candidates = useBulkGenerationStore((state) => state.candidates)
  const selectedIds = useBulkGenerationStore((state) => state.selectedIds)
  const toggleSelect = useBulkGenerationStore((state) => state.toggleSelect)
  const selectAll = useBulkGenerationStore((state) => state.selectAll)
  const clearSelection = useBulkGenerationStore((state) => state.clearSelection)

  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [feeCategory, setFeeCategory] = useState('')
  const [feeStatus, setFeeStatus] = useState('')

  const filtered = useMemo(
    () =>
      candidates.filter((row) => {
        if (className && row.className !== className) return false
        if (section && row.section !== section) return false
        if (feeCategory && row.feeCategory !== feeCategory) return false
        if (feeStatus && row.feeStatus !== feeStatus) return false
        return true
      }),
    [candidates, className, section, feeCategory, feeStatus],
  )

  const allSelected = filtered.length > 0 && filtered.every((row) => selectedIds.has(row.id))

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Selection Filters" description="Narrow down students before selecting them for bulk generation" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <select value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)} className={selectClass} aria-label="Fee status">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <SectionHeader title="Student Selection" description={`${selectedIds.size} of ${filtered.length} selected`} />
        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => selectAll(filtered.map((row) => row.id))} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
            Select All
          </button>
          <button type="button" onClick={clearSelection} className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400">
            Clear
          </button>
        </div>
      </div>

      <div className="thin-scrollbar max-h-80 overflow-y-auto rounded-xl border border-white/40 dark:border-white/10">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-white/90 backdrop-blur dark:bg-slate-900/90">
            <tr className="border-b border-slate-200/70 dark:border-white/10">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => (allSelected ? clearSelection() : selectAll(filtered.map((row) => row.id)))}
                  aria-label="Select all filtered students"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                />
              </th>
              {['Student', 'Class', 'Fee Category', 'Installment', 'Amount', 'Status'].map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-slate-100/80 last:border-0 hover:bg-white/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={`Select ${row.studentName}`}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                  />
                </td>
                <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{row.studentName}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.className}-{row.section}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.feeCategory}</td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.installment}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{formatCurrency(row.amount)}</td>
                <td className="px-3 py-2.5">
                  <Badge variant={FEE_STATUS_VARIANT[row.feeStatus]}>{row.feeStatus === 'overdue' ? 'Overdue' : 'Pending'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
