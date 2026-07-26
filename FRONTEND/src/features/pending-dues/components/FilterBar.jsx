import { Search } from 'lucide-react'
import { SecondaryButton, PrimaryButton } from '../../../components/common/Button'
import { CLASS_OPTIONS, FEE_CATEGORY_OPTIONS, SECTION_OPTIONS } from '../utils/pendingDuesUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'pending', label: 'Pending' },
  { value: 'due-today', label: 'Due Today' },
  { value: 'overdue', label: 'Overdue' },
]

export default function FilterBar({ query, onQueryChange, draftFilters, onFilterChange, onApply, onReset, showStatus = true }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <label htmlFor="due-search" className="sr-only">
          Search students
        </label>
        <input
          id="due-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by student name, registration no., admission no., parent name, mobile, class or section"
          className="w-full rounded-clay border border-white/50 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
        <select value={draftFilters.feeCategory} onChange={(event) => onFilterChange('feeCategory', event.target.value)} className={selectClass} aria-label="Fee category">
          <option value="">All Fee Categories</option>
          {FEE_CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {showStatus && (
          <select value={draftFilters.status} onChange={(event) => onFilterChange('status', event.target.value)} className={selectClass} aria-label="Status">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          min="0"
          value={draftFilters.minAmount}
          onChange={(event) => onFilterChange('minAmount', event.target.value)}
          placeholder="Min Amount"
          className={selectClass}
          aria-label="Minimum outstanding amount"
        />
        <input
          type="number"
          min="0"
          value={draftFilters.maxAmount}
          onChange={(event) => onFilterChange('maxAmount', event.target.value)}
          placeholder="Max Amount"
          className={selectClass}
          aria-label="Maximum outstanding amount"
        />
      </div>

      <div className="flex gap-3">
        <PrimaryButton fullWidth={false} onClick={onApply}>
          Search
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={onReset}>
          Reset
        </SecondaryButton>
      </div>
    </div>
  )
}
