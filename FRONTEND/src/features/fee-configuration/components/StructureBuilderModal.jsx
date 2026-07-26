import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { useFeeStructureConfigStore } from '../store/feeStructureConfigStore'
import { ACADEMIC_YEAR_OPTIONS, CLASS_OPTIONS, FREQUENCY_LABEL, FREQUENCY_OPTIONS, computeAnnualTotal } from '../utils/feeConfigUtils'
import { formatCurrency } from '../../../utils/formatCurrency'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

function makeRowId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `row-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEmptyRow() {
  return { rowId: makeRowId(), label: '', amount: '', frequency: 'one-time' }
}

export default function StructureBuilderModal({ onClose }) {
  const addStructure = useFeeStructureConfigStore((state) => state.addStructure)
  const isSaving = useFeeStructureConfigStore((state) => state.isSaving)

  const [name, setName] = useState('')
  const [classStart, setClassStart] = useState(CLASS_OPTIONS[0])
  const [classEnd, setClassEnd] = useState(CLASS_OPTIONS[2])
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEAR_OPTIONS[0])
  const [components, setComponents] = useState(() => [createEmptyRow()])
  const [formError, setFormError] = useState('')

  const annualTotal = computeAnnualTotal(components.filter((row) => row.label && row.amount))

  function updateRow(rowId, field, value) {
    setComponents((rows) => rows.map((row) => (row.rowId === rowId ? { ...row, [field]: value } : row)))
  }

  function addRow() {
    setComponents((rows) => [...rows, createEmptyRow()])
  }

  function removeRow(rowId) {
    setComponents((rows) => (rows.length > 1 ? rows.filter((row) => row.rowId !== rowId) : rows))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Please enter a fee structure name.')
      return
    }
    if (Number(classStart) > Number(classEnd)) {
      setFormError('The starting class must not be after the ending class.')
      return
    }
    const validComponents = components.filter((row) => row.label.trim() && Number(row.amount) > 0)
    if (validComponents.length === 0) {
      setFormError('Add at least one fee component with a label and amount.')
      return
    }

    await addStructure({ name: name.trim(), classStart, classEnd, academicYear, components: validComponents })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create fee structure"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Create Fee Structure</h2>
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
                <label htmlFor="structure-class-start" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Applicable From
                </label>
                <select id="structure-class-start" value={classStart} onChange={(event) => setClassStart(event.target.value)} className={inputClass}>
                  {CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Class {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="structure-class-end" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Applicable To
                </label>
                <select id="structure-class-end" value={classEnd} onChange={(event) => setClassEnd(event.target.value)} className={inputClass}>
                  {CLASS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Class {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
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
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Components</h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/40 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors duration-200 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-brand-300 dark:hover:bg-white/[0.07]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add Component
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {components.map((row, index) => (
                  <div key={row.rowId} className="grid grid-cols-12 items-center gap-2 rounded-xl border border-white/40 bg-white/40 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(event) => updateRow(row.rowId, 'label', event.target.value)}
                      placeholder="Component label"
                      aria-label={`Component ${index + 1} label`}
                      className="col-span-5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      min="0"
                      value={row.amount}
                      onChange={(event) => updateRow(row.rowId, 'amount', event.target.value)}
                      placeholder="Amount"
                      aria-label={`Component ${index + 1} amount`}
                      className="col-span-3 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                    <select
                      value={row.frequency}
                      onChange={(event) => updateRow(row.rowId, 'frequency', event.target.value)}
                      aria-label={`Component ${index + 1} frequency`}
                      className="col-span-3 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {FREQUENCY_LABEL[option]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeRow(row.rowId)}
                      disabled={components.length === 1}
                      aria-label={`Remove component ${index + 1}`}
                      className="col-span-1 flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                Estimated Annual Total: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(annualTotal)}</span>
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
