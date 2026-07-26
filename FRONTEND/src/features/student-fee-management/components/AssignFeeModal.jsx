import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useFeeStructureStore } from '../store/feeStructureStore'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'

const TEMPLATES = ['Standard Template', 'Premium Template', 'Scholarship Template']
const ACADEMIC_YEARS = ['2025-2026', '2024-2025']
const INSTALLMENT_PLANS = ['Full Payment', '2 Installments', '4 Installments', 'Monthly']
const OPTIONAL_FEES = ['Music Class', 'Art Class', 'Swimming']

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function AssignFeeModal({ onClose }) {
  const assignFeeStructure = useFeeStructureStore((state) => state.assignFeeStructure)
  const isSaving = useFeeStructureStore((state) => state.isSaving)
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({
    template: TEMPLATES[0],
    academicYear: ACADEMIC_YEARS[0],
    installmentPlan: INSTALLMENT_PLANS[0],
    transport: false,
    hostel: false,
    optionalFees: [],
  })

  function toggleOptionalFee(label) {
    setForm((prev) => ({
      ...prev,
      optionalFees: prev.optionalFees.includes(label)
        ? prev.optionalFees.filter((item) => item !== label)
        : [...prev.optionalFees, label],
    }))
  }

  async function handleConfirm() {
    const success = await assignFeeStructure(form)
    if (success) setStep('done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign Fee Structure"
        className="relative z-10 w-full max-w-lg rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Fee structure assigned successfully</p>
            <SecondaryButton onClick={onClose} fullWidth={false}>
              Close
            </SecondaryButton>
          </div>
        ) : step === 'confirm' ? (
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Confirm Assignment</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review the details before assigning.</p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-white/40 bg-white/40 p-4 text-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Template</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{form.template}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Academic Year</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{form.academicYear}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Installment Plan</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{form.installmentPlan}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Transport / Hostel</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {form.transport ? 'Transport' : ''}{form.transport && form.hostel ? ', ' : ''}{form.hostel ? 'Hostel' : ''}
                  {!form.transport && !form.hostel && '—'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-400 dark:text-slate-500">Optional Fees</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {form.optionalFees.length > 0 ? form.optionalFees.join(', ') : 'None'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex gap-3">
              <SecondaryButton type="button" onClick={() => setStep('form')} disabled={isSaving}>
                Back
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleConfirm} isLoading={isSaving}>
                Assign
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setStep('confirm')
            }}
            noValidate
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Assign Fee Structure</h2>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="assign-template" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Select Fee Template
                </label>
                <select
                  id="assign-template"
                  value={form.template}
                  onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))}
                  className={selectClass}
                >
                  {TEMPLATES.map((template) => (
                    <option key={template} value={template}>
                      {template}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="assign-year" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Academic Year
                  </label>
                  <select
                    id="assign-year"
                    value={form.academicYear}
                    onChange={(event) => setForm((prev) => ({ ...prev, academicYear: event.target.value }))}
                    className={selectClass}
                  >
                    {ACADEMIC_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="assign-installments" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Installment Plan
                  </label>
                  <select
                    id="assign-installments"
                    value={form.installmentPlan}
                    onChange={(event) => setForm((prev) => ({ ...prev, installmentPlan: event.target.value }))}
                    className={selectClass}
                  >
                    {INSTALLMENT_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['transport', 'hostel'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, [key]: !prev[key] }))}
                    aria-pressed={form[key]}
                    className={
                      form[key]
                        ? 'rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-clay-button'
                        : 'rounded-full border border-slate-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300'
                    }
                  >
                    {key === 'transport' ? 'Transport' : 'Hostel'}
                  </button>
                ))}
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">Optional Fees</p>
                <div className="flex flex-wrap gap-2">
                  {OPTIONAL_FEES.map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => toggleOptionalFee(fee)}
                      aria-pressed={form.optionalFees.includes(fee)}
                      className={
                        form.optionalFees.includes(fee)
                          ? 'rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-clay-button'
                          : 'rounded-full border border-slate-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300'
                      }
                    >
                      {fee}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <SecondaryButton type="button" onClick={onClose}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">Preview</PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
