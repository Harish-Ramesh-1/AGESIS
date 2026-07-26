import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import clsx from 'clsx'
import { GlassButton } from '../../../components/common/Button'

const FIELD_CLASSES =
  'rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200'

function Select({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD_CLASSES}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function FilterBar({ filters, onFilterChange, onReset, isFiltered, options }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Select
          label="Academic Year"
          value={filters.academicYear}
          onChange={(value) => onFilterChange('academicYear', value)}
          options={options.academicYears}
        />
        <Select
          label="Month"
          value={filters.month}
          onChange={(value) => onFilterChange('month', value)}
          options={options.months}
        />
        <Select
          label="Payment Method"
          value={filters.method}
          onChange={(value) => onFilterChange('method', value)}
          options={options.methods}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={options.statuses}
        />
        <Select
          label="Fee Category"
          value={filters.feeCategory}
          onChange={(value) => onFilterChange('feeCategory', value)}
          options={options.categories}
        />

        <GlassButton icon={SlidersHorizontal} onClick={() => setShowMore((prev) => !prev)}>
          {showMore ? 'Hide' : 'More'} Filters
        </GlassButton>

        {isFiltered && (
          <GlassButton icon={X} onClick={onReset}>
            Clear
          </GlassButton>
        )}
      </div>

      {showMore && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/40 bg-white/30 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            From Date
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onFilterChange('dateFrom', event.target.value)}
              className={FIELD_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            To Date
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onFilterChange('dateTo', event.target.value)}
              className={FIELD_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            Min Amount
            <input
              type="number"
              min="0"
              value={filters.amountMin}
              onChange={(event) => onFilterChange('amountMin', event.target.value)}
              className={clsx(FIELD_CLASSES, 'w-28')}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            Max Amount
            <input
              type="number"
              min="0"
              value={filters.amountMax}
              onChange={(event) => onFilterChange('amountMax', event.target.value)}
              className={clsx(FIELD_CLASSES, 'w-28')}
            />
          </label>
        </div>
      )}
    </div>
  )
}
