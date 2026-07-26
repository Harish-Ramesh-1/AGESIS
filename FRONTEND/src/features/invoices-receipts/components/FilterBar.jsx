import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { DOCUMENT_STATUS_LABEL } from '../utils/documentsUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const DOCUMENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'receipt', label: 'Receipts' },
]

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))
const SECTION_OPTIONS = ['A', 'B', 'C']

export default function FilterBar({ draftFilters, onFilterChange, onApply, onReset }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <select value={draftFilters.documentType} onChange={(event) => onFilterChange('documentType', event.target.value)} className={selectClass} aria-label="Document type">
          {DOCUMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select value={draftFilters.className} onChange={(event) => onFilterChange('className', event.target.value)} className={selectClass} aria-label="Class">
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Class {option}
            </option>
          ))}
        </select>
        <select value={draftFilters.section} onChange={(event) => onFilterChange('section', event.target.value)} className={selectClass} aria-label="Section">
          <option value="">All Sections</option>
          {SECTION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Section {option}
            </option>
          ))}
        </select>
        <select value={draftFilters.status} onChange={(event) => onFilterChange('status', event.target.value)} className={selectClass} aria-label="Status">
          <option value="">All Statuses</option>
          {Object.entries(DOCUMENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={draftFilters.date}
          onChange={(event) => onFilterChange('date', event.target.value)}
          className={selectClass}
          aria-label="Generated date"
        />
      </div>

      <div className="flex gap-3">
        <PrimaryButton fullWidth={false} onClick={onApply}>
          Apply Filters
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={onReset}>
          Reset
        </SecondaryButton>
      </div>
    </div>
  )
}
