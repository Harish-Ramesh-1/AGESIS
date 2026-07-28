import { useState } from 'react'
import { X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { useScholarshipsStore } from '../store/scholarshipsStore'
import { SCHOLARSHIP_TYPE_LABEL, SCHOLARSHIP_TYPE_OPTIONS } from '../utils/feeStructureUtils'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function ScholarshipFormModal({ onClose }) {
  const addPolicy = useScholarshipsStore((state) => state.addPolicy)
  const isSaving = useScholarshipsStore((state) => state.isSaving)

  const [name, setName] = useState('')
  const [type, setType] = useState(SCHOLARSHIP_TYPE_OPTIONS[0])
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [eligibility, setEligibility] = useState('')
  const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Please enter a scholarship policy name.')
      return
    }
    if (!Number(discountValue) || Number(discountValue) <= 0) {
      setFormError('Enter a discount value greater than zero.')
      return
    }
    if (!eligibility.trim()) {
      setFormError('Describe the eligibility criteria for this policy.')
      return
    }

    await addPolicy({ name: name.trim(), type, discountType, discountValue, eligibility: eligibility.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add scholarship policy"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-clay border border-white/50 bg-white/95 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Add Scholarship Policy</h2>
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
                <label htmlFor="policy-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Policy Name
                </label>
                <input
                  id="policy-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Merit Scholarship - Academic Excellence"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="policy-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Type
                </label>
                <select id="policy-type" value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
                  {SCHOLARSHIP_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {SCHOLARSHIP_TYPE_LABEL[option]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="policy-discount-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Discount Type
                </label>
                <select id="policy-discount-type" value={discountType} onChange={(event) => setDiscountType(event.target.value)} className={inputClass}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="policy-discount-value" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (Rs.)'}
                </label>
                <input
                  id="policy-discount-value"
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  placeholder={discountType === 'percentage' ? 'e.g. 25' : 'e.g. 8000'}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="policy-eligibility" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Eligibility Criteria
                </label>
                <textarea
                  id="policy-eligibility"
                  rows={3}
                  value={eligibility}
                  onChange={(event) => setEligibility(event.target.value)}
                  placeholder="Describe who qualifies for this scholarship or discount"
                  className={inputClass}
                />
              </div>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{formError}</p>}
          </div>

          <div className="flex gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">
            <SecondaryButton fullWidth={false} type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton fullWidth={false} type="submit" isLoading={isSaving}>
              Save Policy
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
