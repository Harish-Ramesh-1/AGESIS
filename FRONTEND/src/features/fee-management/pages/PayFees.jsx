import { useEffect } from 'react'
import { BadgeCheck, CreditCard, Lock, ShieldCheck, SlidersHorizontal, Wallet } from 'lucide-react'
import { useFeeStore } from '../../../store/feeStore'
import { usePaymentStore } from '../../../store/paymentStore'
import { useStudentStore } from '../../../store/studentStore'
import usePaymentSummary from '../hooks/usePaymentSummary'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { PrimaryButton } from '../../../components/common/Button'
import PaymentTypeCard from '../components/PaymentTypeCard'
import FeeComponentCheckbox from '../components/FeeComponentCheckbox'
import PaymentSummaryCard from '../components/PaymentSummaryCard'
import PaymentMethodSelector from '../components/PaymentMethodSelector'
import ConfirmPaymentModal from '../components/ConfirmPaymentModal'
import PaymentSuccessScreen from '../components/PaymentSuccessScreen'
import PaymentFailureScreen from '../components/PaymentFailureScreen'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'

const PAYMENT_TYPES = [
  { key: 'full', title: 'Full Payment', description: 'Pay your entire pending balance', icon: Wallet },
  { key: 'installment', title: 'Installment', description: 'Pay the next scheduled installment', icon: CreditCard },
  { key: 'custom', title: 'Custom Amount', description: 'Choose specific fee components', icon: SlidersHorizontal },
]

export default function PayFees() {
  const feeStatus = useFeeStore((state) => state.status)
  const feeDetails = useFeeStore((state) => state.details)
  const fetchFeeDetails = useFeeStore((state) => state.fetchFeeDetails)

  const profile = useStudentStore((state) => state.profile)
  const fetchProfile = useStudentStore((state) => state.fetchProfile)

  const {
    step,
    paymentType,
    selectedComponentKeys,
    selectedMethod,
    isSubmitting,
    error,
    transaction,
    setPaymentType,
    toggleComponent,
    setMethod,
    openConfirm,
    closeConfirm,
    submitPayment,
    retry,
    reset,
  } = usePaymentStore()

  const { subtotal, discount, lateFee, finalAmount } = usePaymentSummary()

  useEffect(() => {
    fetchFeeDetails()
    fetchProfile()
  }, [fetchFeeDetails, fetchProfile])

  useEffect(() => () => reset(), [reset])

  if (feeStatus === 'error') {
    return (
      <div>
        <PageHeader title="Pay Fees" description="Make a secure online payment towards your child's fees." />
        <ErrorState message="Couldn't load your fee details." onRetry={fetchFeeDetails} />
      </div>
    )
  }

  if (feeStatus !== 'success' || !feeDetails) {
    return (
      <div>
        <PageHeader title="Pay Fees" description="Make a secure online payment towards your child's fees." />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (step === 'success' && transaction) {
    return (
      <div>
        <PageHeader title="Pay Fees" description="Make a secure online payment towards your child's fees." />
        <PaymentSuccessScreen transaction={transaction} onDone={reset} />
      </div>
    )
  }

  if (step === 'failure') {
    return (
      <div>
        <PageHeader title="Pay Fees" description="Make a secure online payment towards your child's fees." />
        <PaymentFailureScreen reason={error} onRetry={retry} />
      </div>
    )
  }

  const canContinue =
    finalAmount > 0 && Boolean(selectedMethod) && (paymentType !== 'custom' || selectedComponentKeys.length > 0)

  return (
    <div>
      <PageHeader title="Pay Fees" description="Make a secure online payment towards your child's fees." />

      <div className="flex flex-col gap-8">
        <GlassCard title="Outstanding Balance" hover={false}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Pending Amount</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(feeDetails.pendingAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Due Date</p>
              <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(feeDetails.upcomingDue.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Late Fee</p>
              <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                {formatCurrency(feeDetails.upcomingDue.lateFeePerDay)}/day after due date
              </p>
            </div>
          </div>
        </GlassCard>

        <section>
          <SectionHeader title="Payment Type" />
          <div role="radiogroup" aria-label="Payment type" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PAYMENT_TYPES.map((type) => (
              <PaymentTypeCard
                key={type.key}
                icon={type.icon}
                title={type.title}
                description={type.description}
                isSelected={paymentType === type.key}
                onSelect={() => setPaymentType(type.key)}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Fee Components"
            description={paymentType === 'custom' ? 'Select the components you want to pay for' : undefined}
          />
          <GlassCard hover={false}>
            {paymentType === 'custom' ? (
              <>
                <div className="flex flex-col gap-2">
                  {feeDetails.components
                    .filter((component) => component.pending > 0)
                    .map((component) => (
                      <FeeComponentCheckbox
                        key={component.key}
                        label={component.label}
                        pending={component.pending}
                        isChecked={selectedComponentKeys.includes(component.key)}
                        onToggle={() => toggleComponent(component.key)}
                      />
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm font-semibold text-slate-900 dark:border-white/10 dark:text-white">
                  <span>Dynamic Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {paymentType === 'full'
                  ? `This will settle your entire pending balance of ${formatCurrency(feeDetails.pendingAmount)} across all fee components.`
                  : `This will pay ${formatCurrency(subtotal)} towards your next scheduled installment.`}
              </p>
            )}
          </GlassCard>
        </section>

        <PaymentSummaryCard subtotal={subtotal} discount={discount} lateFee={lateFee} finalAmount={finalAmount} />

        <section>
          <SectionHeader title="Payment Method" />
          <PaymentMethodSelector selectedMethod={selectedMethod} onSelect={setMethod} />
        </section>

        <div className="flex flex-wrap items-center gap-4 rounded-clay border border-white/40 bg-white/30 px-5 py-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            SSL Protected
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            256-bit Encryption
          </span>
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            Secure Payment
          </span>
        </div>

        <PrimaryButton onClick={openConfirm} disabled={!canContinue}>
          Continue to Pay {formatCurrency(finalAmount)}
        </PrimaryButton>
      </div>

      {step === 'confirm' && (
        <ConfirmPaymentModal
          studentName={profile?.studentName ?? 'Student'}
          amount={finalAmount}
          method={selectedMethod}
          isSubmitting={isSubmitting}
          onConfirm={() => submitPayment(finalAmount)}
          onClose={closeConfirm}
        />
      )}
    </div>
  )
}
