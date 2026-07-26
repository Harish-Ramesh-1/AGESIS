import { Award, Percent } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatCurrency'

const TYPE_META = {
  scholarship: { icon: Award, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
  discount: { icon: Percent, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300' },
}

export default function ScholarshipCard({ item }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.scholarship
  const Icon = meta.icon

  return (
    <div className="flex items-start gap-3 rounded-clay border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
        <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
          - {formatCurrency(item.appliedAmount)}
        </p>
      </div>
    </div>
  )
}
