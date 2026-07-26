import { Bookmark } from 'lucide-react'
import { PrimaryButton, SecondaryButton, GlassButton } from '../../../components/common/Button'
import { CLASS_OPTIONS, FEE_CATEGORY_OPTIONS, SECTION_OPTIONS } from '../utils/reportsUtils'
import { PAYMENT_METHODS } from '../services/reportsService'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const STUDENT_STATUS_OPTIONS = ['Active', 'Inactive', 'Alumni']
const COLLECTION_STATUS_OPTIONS = ['Paid', 'Partial', 'Pending', 'Overdue']

export default function FilterBar({ draftFilters, onFilterChange, onApply, onReset, onSaveView }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
        <select value={draftFilters.paymentMethod} onChange={(event) => onFilterChange('paymentMethod', event.target.value)} className={selectClass} aria-label="Payment method">
          <option value="">All Payment Methods</option>
          {PAYMENT_METHODS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={draftFilters.dateFrom}
          onChange={(event) => onFilterChange('dateFrom', event.target.value)}
          className={selectClass}
          aria-label="Date from"
        />
        <input
          type="date"
          value={draftFilters.dateTo}
          onChange={(event) => onFilterChange('dateTo', event.target.value)}
          className={selectClass}
          aria-label="Date to"
        />
        <select value={draftFilters.studentStatus} onChange={(event) => onFilterChange('studentStatus', event.target.value)} className={selectClass} aria-label="Student status">
          <option value="">All Student Statuses</option>
          {STUDENT_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select value={draftFilters.collectionStatus} onChange={(event) => onFilterChange('collectionStatus', event.target.value)} className={selectClass} aria-label="Collection status">
          <option value="">All Collection Statuses</option>
          {COLLECTION_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton fullWidth={false} onClick={onApply}>
          Apply
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={onReset}>
          Reset
        </SecondaryButton>
        {onSaveView && (
          <GlassButton onClick={onSaveView}>
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Save Report View
          </GlassButton>
        )}
      </div>
    </div>
  )
}
