import { useEffect, useState } from 'react'
import { BellRing, FileWarning, Phone } from 'lucide-react'
import clsx from 'clsx'
import { useCollectionStore } from '../store/collectionStore'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { PRIORITY_BADGE_VARIANT } from '../utils/dashboardUtils'

const PRIORITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export default function OverdueAccountsCard() {
  const status = useCollectionStore((state) => state.overdueStatus)
  const overdueAccounts = useCollectionStore((state) => state.overdueAccounts)
  const error = useCollectionStore((state) => state.overdueError)
  const fetchOverdueAccounts = useCollectionStore((state) => state.fetchOverdueAccounts)
  const [remindedIds, setRemindedIds] = useState(() => new Set())
  const [noticedIds, setNoticedIds] = useState(() => new Set())

  useEffect(() => {
    fetchOverdueAccounts()
  }, [fetchOverdueAccounts])

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-red-100 bg-red-50/40 p-5 shadow-clay backdrop-blur-2xl dark:border-red-500/20 dark:bg-red-500/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10"
      />
      <SectionHeader title="Overdue Accounts" description="Critical accounts needing escalation" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load overdue accounts. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      )}

      {status === 'success' && overdueAccounts.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No critical accounts right now.</p>
      )}

      {status === 'success' && overdueAccounts.length > 0 && (
        <ul className="flex flex-col gap-3">
          {overdueAccounts.map((account) => {
            const wasReminded = remindedIds.has(account.id)
            const wasNoticed = noticedIds.has(account.id)
            return (
              <li
                key={account.id}
                className="rounded-xl border border-white/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{account.student}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {account.className} · {account.daysOverdue} days overdue
                    </p>
                  </div>
                  <Badge variant={PRIORITY_BADGE_VARIANT[account.priority]}>{PRIORITY_LABEL[account.priority]}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Outstanding</p>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(account.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Late Fee / Penalty</p>
                    <p className="mt-0.5 font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(account.lateFee)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${account.parentPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    Call Parent
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemindedIds((prev) => new Set(prev).add(account.id))}
                    disabled={wasReminded}
                    className={clsx(
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ease-premium disabled:cursor-not-allowed disabled:opacity-60',
                      'border-white/50 bg-white/60 text-slate-700 hover:-translate-y-0.5 hover:bg-white/80 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10',
                    )}
                  >
                    <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
                    {wasReminded ? 'Reminder Sent' : 'Send Reminder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticedIds((prev) => new Set(prev).add(account.id))}
                    disabled={wasNoticed}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                  >
                    <FileWarning className="h-3.5 w-3.5" aria-hidden="true" />
                    {wasNoticed ? 'Notice Generated' : 'Generate Notice'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
