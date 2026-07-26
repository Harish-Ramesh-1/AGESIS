import { useEffect, useState } from 'react'
import { Calculator } from 'lucide-react'
import { useLateFeeStore } from '../store/lateFeeStore'
import InputField from '../../../components/common/Input'
import Skeleton from '../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

const RULE_OPTIONS = [
  { key: 'perDay', label: 'Per Day' },
  { key: 'flat', label: 'Flat Amount' },
  { key: 'percentage', label: 'Percentage' },
]

export default function LateFeeCalculator() {
  const calculate = useLateFeeStore((state) => state.calculate)
  const isCalculating = useLateFeeStore((state) => state.isCalculating)
  const result = useLateFeeStore((state) => state.result)
  const rules = useLateFeeStore((state) => state.rules)

  const [originalAmount, setOriginalAmount] = useState('30000')
  const [daysOverdue, setDaysOverdue] = useState('15')
  const [rule, setRule] = useState('perDay')

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (originalAmount && daysOverdue) {
        calculate({ originalAmount: Number(originalAmount), daysOverdue: Number(daysOverdue), rule })
      }
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalAmount, daysOverdue, rule])

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title="Penalty Calculator" description={`Grace period: ${rules.gracePeriodDays} days · Max penalty: ${formatCurrency(rules.maxPenalty)}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="Original Amount" type="number" min="0" value={originalAmount} onChange={(event) => setOriginalAmount(event.target.value)} />
        <InputField label="Days Overdue" type="number" min="0" value={daysOverdue} onChange={(event) => setDaysOverdue(event.target.value)} />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Penalty Rule</label>
          <select value={rule} onChange={(event) => setRule(event.target.value)} className={selectClass}>
            {RULE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/[0.06]">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Result
        </p>
        {isCalculating || !result ? (
          <Skeleton className="h-14" />
        ) : (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">Calculated Penalty</dt>
            <dd className="text-right font-semibold text-red-600 dark:text-red-400">{formatCurrency(result.penalty)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Net Payable</dt>
            <dd className="text-right text-base font-bold text-slate-900 dark:text-white">{formatCurrency(result.netPayable)}</dd>
          </dl>
        )}
      </div>
    </div>
  )
}
