import { useEffect, useState } from 'react'
import { CheckCircle2, ClockAlert } from 'lucide-react'
import { useFeeStructureStore } from '../store/feeStructureStore'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import Skeleton from '../../../components/common/Skeleton'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function PenaltyWaiverCard() {
  const studentId = useStudentDirectoryStore((state) => state.selectedStudentId)
  const status = useFeeStructureStore((state) => state.status)
  const penalty = useFeeStructureStore((state) => state.penalty)
  const isSaving = useFeeStructureStore((state) => state.isSaving)
  const fetchFeeStructure = useFeeStructureStore((state) => state.fetchFeeStructure)
  const waivePenalty = useFeeStructureStore((state) => state.waivePenalty)

  const [mode, setMode] = useState(null)
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (studentId) fetchFeeStructure(studentId)
  }, [studentId, fetchFeeStructure])

  function startMode(nextMode) {
    setMode(nextMode)
    setReason('')
    setAmount('')
    setConfirmed(false)
  }

  async function handleWaive() {
    const success = await waivePenalty({
      mode,
      amount: mode === 'partial' ? Number(amount) : undefined,
      reason,
    })
    if (success) {
      setMode(null)
      setConfirmed(true)
    }
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!penalty) return null

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Waive Penalties" description="Review and waive late fee penalties" />

      {penalty.penaltyAmount === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {confirmed ? 'Penalty waived successfully.' : 'No outstanding penalties for this student.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
              <ClockAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(penalty.penaltyAmount)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current late fee · {penalty.reason}</p>
            </div>
          </div>

          {mode ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {mode === 'full' ? 'Waive full penalty' : 'Waive partial amount'}
              </p>
              {mode === 'partial' && (
                <InputField
                  label="Waiver Amount"
                  type="number"
                  min="0"
                  max={penalty.penaltyAmount}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              )}
              <InputField label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} required />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This action requires approval and will be recorded in the fee adjustment history.
              </p>
              <div className="flex gap-3">
                <SecondaryButton fullWidth={false} onClick={() => setMode(null)} disabled={isSaving}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  fullWidth={false}
                  onClick={handleWaive}
                  isLoading={isSaving}
                  disabled={!reason || (mode === 'partial' && !amount)}
                >
                  Confirm Waiver
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-3">
              <PrimaryButton fullWidth={false} onClick={() => startMode('full')}>
                Waive Penalty
              </PrimaryButton>
              <SecondaryButton fullWidth={false} onClick={() => startMode('partial')}>
                Partial Waiver
              </SecondaryButton>
            </div>
          )}
        </>
      )}
    </div>
  )
}
