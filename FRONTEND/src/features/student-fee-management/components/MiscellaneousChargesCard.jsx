import { useState } from 'react'
import { Plus, Receipt, Trash2 } from 'lucide-react'
import { useFeeStructureStore } from '../store/feeStructureStore'
import Skeleton from '../../../components/common/Skeleton'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const CHARGE_TYPES = ['Library Fine', 'Uniform', 'Books', 'Events', 'Educational Tour', 'Laboratory Damage', 'Custom Charge']

const EMPTY_FORM = { name: CHARGE_TYPES[0], description: '', amount: '', applicableDate: '', remarks: '' }

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function MiscellaneousChargesCard() {
  const status = useFeeStructureStore((state) => state.status)
  const miscCharges = useFeeStructureStore((state) => state.miscCharges)
  const addMiscCharge = useFeeStructureStore((state) => state.addMiscCharge)
  const removeMiscCharge = useFeeStructureStore((state) => state.removeMiscCharge)

  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await addMiscCharge({ ...form, amount: Number(form.amount) })
    setForm(EMPTY_FORM)
    setIsAdding(false)
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Miscellaneous Charges"
        description="One-off charges applied outside the standard fee structure"
        action={
          !isAdding && (
            <SecondaryButton fullWidth={false} onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Charge
            </SecondaryButton>
          )
        }
      />

      {(status === 'loading' || status === 'idle') && <Skeleton className="h-24" />}

      {status === 'success' && (
        <div className="flex flex-col gap-4">
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/[0.06]"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Charge Name</label>
                  <select value={form.name} onChange={(event) => handleChange('name', event.target.value)} className={selectClass}>
                    {CHARGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField label="Amount" type="number" min="0" value={form.amount} onChange={(event) => handleChange('amount', event.target.value)} required />
                <InputField label="Description" value={form.description} onChange={(event) => handleChange('description', event.target.value)} required />
                <InputField
                  label="Applicable Date"
                  type="date"
                  value={form.applicableDate}
                  onChange={(event) => handleChange('applicableDate', event.target.value)}
                  required
                />
                <InputField label="Remarks" value={form.remarks} onChange={(event) => handleChange('remarks', event.target.value)} className="sm:col-span-2" />
              </div>
              <div className="flex gap-3">
                <SecondaryButton type="button" fullWidth={false} onClick={() => setIsAdding(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" fullWidth={false}>
                  Add Charge
                </PrimaryButton>
              </div>
            </form>
          )}

          {miscCharges.length === 0 && !isAdding && (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No miscellaneous charges recorded.</p>
          )}

          {miscCharges.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {miscCharges.map((charge) => (
                <div key={charge.id} className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                        <Receipt className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{charge.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{charge.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMiscCharge(charge.id)}
                      aria-label={`Remove ${charge.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(charge.amount)}</span>
                    <span className="text-slate-400 dark:text-slate-500">{formatDate(charge.applicableDate)}</span>
                  </div>
                  {charge.remarks && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{charge.remarks}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
