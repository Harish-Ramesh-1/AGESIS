import GlassCard from '../../../components/common/GlassCard'
import ProgressRing from '../../../components/common/ProgressRing'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function PaymentProgress({ percent, remainingBalance }) {
  return (
    <GlassCard title="Payment Progress" description="Your annual fee payment progress">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <ProgressRing percent={percent} label="Annual Progress" size={160} />
        <div className="text-center sm:text-left">
          <p className="text-xs text-slate-400 dark:text-slate-500">Remaining Balance</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(remainingBalance)}</p>
        </div>
      </div>
    </GlassCard>
  )
}
