import { useNavigate } from 'react-router-dom'
import { Gem } from 'lucide-react'
import { PrimaryButton } from '../../../components/common/Button'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function MotivationBanner({ message }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center gap-4 rounded-clay border border-brand-200/60 bg-gradient-to-br from-brand-50/80 to-white/40 p-8 text-center shadow-glass backdrop-blur-2xl dark:border-brand-500/20 dark:from-brand-500/10 dark:to-white/[0.03] sm:flex-row sm:text-left">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
        <Gem className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="flex-1 text-base font-semibold text-slate-900 dark:text-white">{message}</p>
      <PrimaryButton fullWidth={false} onClick={() => navigate(PARENT_ROUTES.payFees)}>
        Pay Upcoming Fee
      </PrimaryButton>
    </div>
  )
}
