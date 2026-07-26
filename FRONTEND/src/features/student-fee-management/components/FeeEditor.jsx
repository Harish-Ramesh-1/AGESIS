import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useFeeStructureStore } from '../store/feeStructureStore'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function FeeEditor({ feeComponents, onDone }) {
  const [draft, setDraft] = useState(() => feeComponents.map((row) => ({ ...row })))
  const saveFeeComponents = useFeeStructureStore((state) => state.saveFeeComponents)
  const isSaving = useFeeStructureStore((state) => state.isSaving)

  function updateRow(id, patch) {
    setDraft((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        next.netAmount = next.amount - next.discount - next.scholarship - next.concession + next.lateFee
        return next
      }),
    )
  }

  const changedRows = useMemo(
    () =>
      draft.filter((row) => {
        const original = feeComponents.find((item) => item.id === row.id)
        return original && (original.amount !== row.amount || original.enabled !== row.enabled || original.dueDate !== row.dueDate || original.installments !== row.installments)
      }),
    [draft, feeComponents],
  )

  async function handleSave() {
    const success = await saveFeeComponents(draft)
    if (success) onDone()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="thin-scrollbar overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/70 dark:border-white/10">
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Component</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due Date</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Installments</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Net Amount</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  'border-b border-slate-100/80 last:border-0 dark:border-white/5',
                  !row.enabled && 'opacity-50',
                )}
              >
                <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">{row.component}</td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="0"
                    value={row.amount}
                    disabled={!row.enabled}
                    onChange={(event) => updateRow(row.id, { amount: Number(event.target.value) })}
                    className="w-28 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="date"
                    value={row.dueDate}
                    disabled={!row.enabled}
                    onChange={(event) => updateRow(row.id, { dueDate: event.target.value })}
                    className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={row.installments}
                    disabled={!row.enabled}
                    onChange={(event) => updateRow(row.id, { installments: Number(event.target.value) })}
                    className="w-16 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-sm text-slate-900 shadow-clay-inset focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
                  />
                </td>
                <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(row.netAmount)}</td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.enabled}
                    aria-label={`${row.enabled ? 'Disable' : 'Enable'} ${row.component}`}
                    onClick={() => updateRow(row.id, { enabled: !row.enabled })}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors duration-200 ease-premium',
                      row.enabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15',
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium',
                        row.enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
                      )}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {changedRows.length > 0 && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/[0.08] dark:text-amber-200">
          <p className="font-semibold">Preview: {changedRows.length} component{changedRows.length > 1 ? 's' : ''} will be updated</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {changedRows.map((row) => {
              const original = feeComponents.find((item) => item.id === row.id)
              return (
                <li key={row.id}>
                  {row.component}: {formatCurrency(original.amount)} → {formatCurrency(row.amount)}
                  {original.enabled !== row.enabled ? ` (${row.enabled ? 'enabled' : 'disabled'})` : ''}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-white/40 bg-white/70 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <SecondaryButton fullWidth={false} onClick={onDone} disabled={isSaving}>
          Cancel
        </SecondaryButton>
        <PrimaryButton fullWidth={false} onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </PrimaryButton>
      </div>
    </div>
  )
}
