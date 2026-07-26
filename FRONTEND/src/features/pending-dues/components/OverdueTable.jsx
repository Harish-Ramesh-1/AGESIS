import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, ChevronDown, PhoneCall, ShieldAlert, WalletCards } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import { useReminderStore } from '../store/reminderStore'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { PRIORITY_LABEL, PRIORITY_VARIANT } from '../utils/pendingDuesUtils'

export default function OverdueTable({ onApplyPenalty }) {
  const status = usePendingDueStore((state) => state.overdueStatus)
  const overdueList = usePendingDueStore((state) => state.overdueList)
  const error = usePendingDueStore((state) => state.overdueError)
  const sendReminder = useReminderStore((state) => state.sendReminder)
  const navigate = useNavigate()
  const [remindedIds, setRemindedIds] = useState(() => new Set())

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load overdue accounts. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    )
  }

  if (overdueList.length === 0) {
    return <EmptyState icon={ShieldAlert} title="No overdue accounts" description="Every account is within its due window." />
  }

  async function handleReminder(row) {
    await sendReminder(row.id, { template: 'Overdue', channel: 'Email', studentName: row.studentName })
    setRemindedIds((prev) => new Set(prev).add(row.id))
  }

  function RowActions({ row }) {
    const wasReminded = remindedIds.has(row.id)
    return (
      <div className="flex items-center gap-1">
        <a
          href={`tel:${row.parentPhone.replace(/\s+/g, '')}`}
          aria-label={`Call parent of ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => handleReminder(row)}
          disabled={wasReminded}
          aria-label={`Send reminder to ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onApplyPenalty(row)}
          aria-label={`Apply penalty for ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10"
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => navigate(ACCOUNTANT_ROUTES.receivePayment)}
          aria-label={`Receive payment from ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <WalletCards className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="hidden md:block">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-white/10">
                {['Student', 'Parent', 'Outstanding', 'Original Due Date', 'Days Overdue', 'Late Fee', 'Priority', 'Actions'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overdueList.map((row) => (
                <tr key={row.id} className="border-b border-slate-100/80 transition-colors duration-200 ease-premium last:border-0 hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{row.studentName}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.parentName}</td>
                  <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{formatCurrency(row.outstandingAmount)}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(row.dueDate)}</td>
                  <td className="px-3 py-3 text-red-600 dark:text-red-400">{row.daysOverdue}d</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatCurrency(row.lateFee)}</td>
                  <td className="px-3 py-3">
                    <Badge variant={PRIORITY_VARIANT[row.priority]}>{PRIORITY_LABEL[row.priority]}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <RowActions row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {overdueList.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.daysOverdue} days overdue</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant={PRIORITY_VARIANT[row.priority]}>{PRIORITY_LABEL[row.priority]}</Badge>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Outstanding</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.outstandingAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Late Fee</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(row.lateFee)}</p>
                </div>
              </div>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
