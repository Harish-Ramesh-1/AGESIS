import clsx from 'clsx'
import { useSearchStore } from '../store/searchStore'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../utils/feeManagementUtils'

const FEE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const ACADEMIC_YEAR_OPTIONS = ['2025-2026', '2024-2025']

const TOGGLE_FILTERS = [
  { key: 'scholarship', label: 'Scholarship' },
  { key: 'discount', label: 'Discount' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'transport', label: 'Transport' },
]

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AdvancedFilters() {
  const draftFilters = useSearchStore((state) => state.draftFilters)
  const setDraftFilter = useSearchStore((state) => state.setDraftFilter)
  const applyFilters = useSearchStore((state) => state.applyFilters)
  const resetFilters = useSearchStore((state) => state.resetFilters)

  return (
    <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-academic-year" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Academic Year
          </label>
          <select
            id="filter-academic-year"
            value={draftFilters.academicYear}
            onChange={(event) => setDraftFilter('academicYear', event.target.value)}
            className={selectClass}
          >
            {ACADEMIC_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-class" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Class
          </label>
          <select
            id="filter-class"
            value={draftFilters.className}
            onChange={(event) => setDraftFilter('className', event.target.value)}
            className={selectClass}
          >
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Class {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-section" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Section
          </label>
          <select
            id="filter-section"
            value={draftFilters.section}
            onChange={(event) => setDraftFilter('section', event.target.value)}
            className={selectClass}
          >
            <option value="">All Sections</option>
            {SECTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Section {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-fee-status" className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Fee Status
          </label>
          <select
            id="filter-fee-status"
            value={draftFilters.feeStatus}
            onChange={(event) => setDraftFilter('feeStatus', event.target.value)}
            className={selectClass}
          >
            {FEE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Additional filters">
        {TOGGLE_FILTERS.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            onClick={() => setDraftFilter(toggle.key, !draftFilters[toggle.key])}
            aria-pressed={draftFilters[toggle.key]}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
              draftFilters[toggle.key]
                ? 'bg-brand-600 text-white shadow-clay-button'
                : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
            )}
          >
            {toggle.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <PrimaryButton fullWidth={false} onClick={applyFilters}>
          Search
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={resetFilters}>
          Reset
        </SecondaryButton>
      </div>
    </div>
  )
}
