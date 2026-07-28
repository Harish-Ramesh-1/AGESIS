import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { useFeeStructureStore } from '../store/feeStructureStore'
import { ACADEMIC_YEAR_OPTIONS, FEE_HEAD_KEYS, FEE_HEAD_LABEL, computeStructureTotal } from '../utils/feeStructureUtils'
import { formatCurrency } from '../../../../utils/formatCurrency'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function StructureFormModal({ onClose }) {
  const addStructure = useFeeStructureStore((state) => state.addStructure)
  const isSaving = useFeeStructureStore((state) => state.isSaving)

  const [name, setName] = useState('')
  const [classRange, setClassRange] = useState('')
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR_OPTIONS[0])
  const [amounts, setAmounts] = useState(() => Object.fromEntries(FEE_HEAD_KEYS.map((key) => [key, ''])))
  const [formError, setFormError] = useState('')

  const total = computeStructureTotal(amounts)

  function updateAmount(key, value) {
    setAmounts((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Please enter a fee structure name.')
      return
    }
    if (!classRange.trim()) {
      setFormError('Please specify the applicable class range, e.g. Class 1-5.')
      return
    }
    if (total <= 0) {
      setFormError('Enter at least one fee head amount greater than zero.')
      return
    }

    await addStructure({
      name: name.trim(),
      classRange: classRange.trim(),
      academicYear,
      amounts: Object.fromEntries(FEE_HEAD_KEYS.map((key) => [key, Number(amounts[key]) || 0])),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add new fee structure"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add New Fee Structure</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="structure-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fee Structure Name
                </label>
                <input
                  id="structure-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Middle School Standard Plan"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="structure-class-range" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Applicable Class Range
                </label>
                <input
                  id="structure-class-range"
                  type="text"
                  value={classRange}
                  onChange={(event) => setClassRange(event.target.value)}
                  placeholder="e.g. Class 6-8"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="structure-year" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Academic Year
                </label>
                <select id="structure-year" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={inputClass}>
                  {ACADEMIC_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Heads</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEE_HEAD_KEYS.map((key) => (
                  <div key={key}>
                    <label htmlFor={`structure-head-${key}`} className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                      {FEE_HEAD_LABEL[key]}
                    </label>
                    <input
                      id={`structure-head-${key}`}
                      type="number"
                      min="0"
                      value={amounts[key]}
                      onChange={(event) => updateAmount(key, event.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Annual Fee: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</span>
              </p>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{formError}</p>}
          </div>

          <div className="flex gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">
            <SecondaryButton fullWidth={false} type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton fullWidth={false} type="submit" isLoading={isSaving}>
              Save as Draft
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
