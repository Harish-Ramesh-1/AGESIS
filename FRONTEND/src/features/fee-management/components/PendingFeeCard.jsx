import { useNavigate } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import Badge from '../../../components/common/Badge'
import { GlassButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'
import { daysUntil, formatDate } from '../../../utils/formatDate'
import { PARENT_ROUTES } from '../../../constants/routes'
import { usePaymentStore } from '../../../store/paymentStore'

export default function PendingFeeCard({ component, dueDate, isSelected, onToggleSelect }) {
  const navigate = useNavigate()
  const prefill = usePaymentStore((state) => state.prefill)
  const remaining = daysUntil(dueDate)
  const isUrgent = remaining <= 7

  function handlePay() {
    prefill({ paymentType: 'custom', selectedComponentKeys: [component.key] })
    navigate(PARENT_ROUTES.payFees)
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.05]">
      <div>
        <div className="flex items-start justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              aria-label={`Select ${component.label} for payment`}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-none focus:ring-brand-500 dark:border-white/20"
            />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{component.label}</span>
          </label>
          <Badge variant={isUrgent ? 'danger' : 'warning'}>{isUrgent ? 'Due Soon' : 'Pending'}</Badge>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(component.pending)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          Due {formatDate(dueDate)}
        </p>
      </div>
      <GlassButton onClick={handlePay} className="w-full justify-center">
        Pay Now
      </GlassButton>
    </div>
  )
}
