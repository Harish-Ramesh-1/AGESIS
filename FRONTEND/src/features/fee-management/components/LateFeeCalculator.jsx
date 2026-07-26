import GlassCard from '../../../components/common/GlassCard'
import { formatCurrency } from '../../../utils/formatCurrency'
import { calculateCurrentLateFee, calculateProjectedPenalty } from '../utils/feeCalculations'

export default function LateFeeCalculator({ originalAmount, dueDate, lateFeePerDay, graceDays }) {
  const currentLateFee = calculateCurrentLateFee({ dueDate, lateFeePerDay, graceDays })
  const projectedPenalty = calculateProjectedPenalty({ lateFeePerDay })
  const totalPayable = originalAmount + currentLateFee

  const rows = [
    { label: 'Original Amount', value: originalAmount },
    { label: 'Late Fee (as of today)', value: currentLateFee },
    { label: 'Projected Penalty (if 30 days late)', value: projectedPenalty },
  ]

  return (
    <GlassCard
      title="Late Fee Calculator"
      description={`₹${lateFeePerDay}/day after a ${graceDays}-day grace period`}
    >
      <div className="flex flex-col gap-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>{row.label}</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(row.value)}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-slate-200/70 pt-3 text-base font-bold text-slate-900 dark:border-white/10 dark:text-white">
          <span>Total Payable</span>
          <span>{formatCurrency(totalPayable)}</span>
        </div>
      </div>
    </GlassCard>
  )
}
