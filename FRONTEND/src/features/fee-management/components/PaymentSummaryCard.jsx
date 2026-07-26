import GlassCard from '../../../components/common/GlassCard'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function PaymentSummaryCard({ subtotal, discount, lateFee, finalAmount }) {
  const rows = [
    { label: 'Subtotal', value: subtotal },
    { label: 'Discount', value: -discount },
    { label: 'Late Fee', value: lateFee },
  ]

  return (
    <GlassCard title="Payment Summary" hover={false}>
      <div className="flex flex-col gap-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>{row.label}</span>
            <span className={row.value < 0 ? 'text-emerald-600 dark:text-emerald-300' : undefined}>
              {row.value < 0 ? '- ' : ''}
              {formatCurrency(Math.abs(row.value))}
            </span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-slate-200/70 pt-3 text-base font-bold text-slate-900 dark:border-white/10 dark:text-white">
          <span>Final Amount</span>
          <span>{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </GlassCard>
  )
}
