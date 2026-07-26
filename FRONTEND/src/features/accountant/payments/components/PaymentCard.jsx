import { useState } from 'react'
import { CircleDollarSign } from 'lucide-react'
import clsx from 'clsx'
import { useReceivePaymentStore } from '../store/receivePaymentStore'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import SectionHeader from './SectionHeader'
import PaymentMethodSelector from './PaymentMethodSelector'
import { PAYMENT_METHODS } from '../services/paymentsService'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'

const AMOUNT_TYPES = [
  { key: 'full', label: 'Full Payment' },
  { key: 'installment', label: 'Installment' },
  { key: 'partial', label: 'Partial Payment' },
]

export default function PaymentCard() {
  const student = useReceivePaymentStore((state) => state.selectedStudent)
  const isSubmitting = useReceivePaymentStore((state) => state.isSubmitting)
  const submitError = useReceivePaymentStore((state) => state.submitError)
  const submitPayment = useReceivePaymentStore((state) => state.submitPayment)

  const [method, setMethod] = useState(PAYMENT_METHODS[0])
  const [amountType, setAmountType] = useState('full')
  const [installmentId, setInstallmentId] = useState(student?.outstanding.installments[0]?.id ?? '')
  const [customAmount, setCustomAmount] = useState('')
  const [remarks, setRemarks] = useState('')

  const outstanding = student.outstanding
  const selectedInstallment = outstanding.installments.find((item) => item.id === installmentId)

  const amount =
    amountType === 'full'
      ? outstanding.totalDue
      : amountType === 'installment'
        ? (selectedInstallment?.amount ?? 0)
        : Number(customAmount || 0)

  const remainingAfter = Math.max(0, outstanding.totalDue - amount)
  const isValid = amount > 0 && amount <= outstanding.totalDue

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValid) return
    await submitPayment({
      studentId: student.id,
      method,
      amount,
      installmentId: amountType === 'installment' ? installmentId : undefined,
      remarks,
    })
  }

  if (outstanding.totalDue === 0) {
    return (
      <div className="rounded-clay border border-emerald-100 bg-emerald-50/60 p-6 text-center text-sm text-emerald-700 shadow-clay dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        {student.name} has no outstanding balance for this academic year.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Payment Information" description="Select a method and amount to collect" />

      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Payment Method</p>
          <PaymentMethodSelector methods={PAYMENT_METHODS} value={method} onChange={setMethod} />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Amount Collection</p>
          <div className="flex flex-wrap gap-2">
            {AMOUNT_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setAmountType(type.key)}
                aria-pressed={amountType === type.key}
                className={clsx(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium',
                  amountType === type.key
                    ? 'bg-brand-600 text-white shadow-clay-button'
                    : 'border border-white/40 bg-white/40 text-slate-600 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]',
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {amountType === 'installment' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="installment-select" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Installment Selection
            </label>
            <select
              id="installment-select"
              value={installmentId}
              onChange={(event) => setInstallmentId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
            >
              {outstanding.installments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {formatCurrency(item.amount)} · Due {formatDate(item.dueDate)}
                </option>
              ))}
            </select>
          </div>
        )}

        {amountType === 'partial' && (
          <InputField
            label="Amount to Collect"
            type="number"
            min="1"
            max={outstanding.totalDue}
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            required
          />
        )}

        <InputField label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Optional notes for this payment" />

        <div className="rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
            Payment Summary
          </p>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">Outstanding Balance</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-slate-100">{formatCurrency(outstanding.totalDue)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Amount to Collect</dt>
            <dd className="text-right font-semibold text-brand-700 dark:text-brand-300">{formatCurrency(amount)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Remaining After Payment</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-slate-100">{formatCurrency(remainingAfter)}</dd>
          </dl>
        </div>

        {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <PrimaryButton type="submit" isLoading={isSubmitting} disabled={!isValid}>
          Confirm Payment of {formatCurrency(amount)}
        </PrimaryButton>
      </div>
    </form>
  )
}
