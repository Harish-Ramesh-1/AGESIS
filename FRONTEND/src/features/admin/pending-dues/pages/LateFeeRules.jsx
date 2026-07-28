import { useEffect, useState } from 'react'
import { CalendarClock, Percent, ShieldCheck, Sliders, Wallet2 } from 'lucide-react'
import { useLateFeeRulesStore } from '../store/lateFeeRulesStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { LATE_FEE_TYPE_LABEL } from '../utils/pendingDuesUtils'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function LateFeeRules() {
  const status = useLateFeeRulesStore((state) => state.status)
  const error = useLateFeeRulesStore((state) => state.error)
  const rules = useLateFeeRulesStore((state) => state.rules)
  const fetchRules = useLateFeeRulesStore((state) => state.fetchRules)
  const isSaving = useLateFeeRulesStore((state) => state.isSaving)
  const saveMessage = useLateFeeRulesStore((state) => state.saveMessage)
  const saveRules = useLateFeeRulesStore((state) => state.saveRules)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  useEffect(() => {
    if (rules && !form) setForm(rules)
  }, [rules, form])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveRules(form)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Late Fee Rules" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard icon={CalendarClock} label="Grace Period" value={rules ? `${rules.gracePeriodDays}d` : '—'} status={status} />
        <SummaryCard
          icon={Percent}
          label="Late Fee"
          value={rules ? (rules.lateFeeType === 'flat' ? formatCurrency(rules.flatAmount) : `${rules.percentageRate}%`) : '—'}
          meta={rules ? LATE_FEE_TYPE_LABEL[rules.lateFeeType] : undefined}
          status={status}
        />
        <SummaryCard icon={Wallet2} label="Maximum Cap" value={rules ? formatCurrency(rules.maxPenaltyCap) : '—'} status={status} />
        <SummaryCard icon={ShieldCheck} label="Auto-Apply" value={rules ? (rules.autoApply ? 'Enabled' : 'Disabled') : '—'} status={status} />
        <SummaryCard icon={Sliders} label="Last Updated" value={rules ? formatDate(rules.updatedDate) : '—'} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Configure Late Fee Policy</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            This institution-wide policy governs how late fees are calculated. Accountants apply penalties based on these rules.
          </p>
        </div>

        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchRules} />
        ) : status === 'loading' || status === 'idle' || !form ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="rule-grace-period" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Grace Period (Days)
                </label>
                <input
                  id="rule-grace-period"
                  type="number"
                  min="0"
                  value={form.gracePeriodDays}
                  onChange={(event) => updateField('gracePeriodDays', Number(event.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="rule-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Late Fee Type
                </label>
                <select id="rule-type" value={form.lateFeeType} onChange={(event) => updateField('lateFeeType', event.target.value)} className={inputClass}>
                  <option value="flat">Flat Amount (per day)</option>
                  <option value="percentage">Percentage of Outstanding</option>
                </select>
              </div>

              {form.lateFeeType === 'flat' ? (
                <div>
                  <label htmlFor="rule-flat-amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Flat Amount / Day (Rs.)
                  </label>
                  <input
                    id="rule-flat-amount"
                    type="number"
                    min="0"
                    value={form.flatAmount}
                    onChange={(event) => updateField('flatAmount', Number(event.target.value))}
                    className={inputClass}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="rule-percentage-rate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Percentage Rate (%)
                  </label>
                  <input
                    id="rule-percentage-rate"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.percentageRate}
                    onChange={(event) => updateField('percentageRate', Number(event.target.value))}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor="rule-max-cap" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Maximum Late Fee Cap (Rs.)
                </label>
                <input
                  id="rule-max-cap"
                  type="number"
                  min="0"
                  value={form.maxPenaltyCap}
                  onChange={(event) => updateField('maxPenaltyCap', Number(event.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.autoApply}
                    onChange={(event) => updateField('autoApply', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                  />
                  Auto-apply late fees after grace period
                </label>
              </div>
            </div>

            {saveMessage && (
              <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {saveMessage}
              </p>
            )}

            <div>
              <PrimaryButton fullWidth={false} type="submit" isLoading={isSaving}>
                Save Rules
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
