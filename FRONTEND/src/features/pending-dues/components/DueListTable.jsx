import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, ChevronDown, Eye, FilePlus2, WalletCards, Wallet2 } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import { useReminderStore } from '../store/reminderStore'
import { useDueStudentStore } from '../store/dueStudentStore'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import BulkActionToolbar from './BulkActionToolbar'
import StudentDuePreview from './StudentDuePreview'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { DUE_STATUS_LABEL, DUE_STATUS_VARIANT } from '../utils/pendingDuesUtils'

export default function DueListTable() {
  const status = usePendingDueStore((state) => state.dueListStatus)
  const dueList = usePendingDueStore((state) => state.dueList)
  const error = usePendingDueStore((state) => state.dueListError)
  const sendReminder = useReminderStore((state) => state.sendReminder)
  const openStudent = useDueStudentStore((state) => state.openStudent)
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [remindedIds, setRemindedIds] = useState(() => new Set())

  if (status === 'error') return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load due list. {error}</p>

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    )
  }

  if (dueList.length === 0) {
    return <EmptyState icon={Wallet2} title="No pending dues found" description="Try adjusting your search or filters." />
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected = dueList.every((row) => prev.has(row.id))
      return allSelected ? new Set() : new Set(dueList.map((row) => row.id))
    })
  }

  async function handleQuickReminder(row) {
    await sendReminder(row.id, { template: row.status === 'overdue' ? 'Overdue' : 'Upcoming Due', channel: 'Email', studentName: row.studentName })
    setRemindedIds((prev) => new Set(prev).add(row.id))
  }

  function handleBulkReminder() {
    setRemindedIds((prev) => new Set([...prev, ...selectedIds]))
  }

  function handleExport() {
    const header = 'Student,Registration No.,Class,Fee Category,Installment,Outstanding,Due Date,Status'
    const rows = dueList
      .filter((row) => selectedIds.size === 0 || selectedIds.has(row.id))
      .map((row) => [row.studentName, row.registrationNumber, `${row.className}-${row.section}`, row.feeCategory, row.installment, row.outstandingAmount, row.dueDate, DUE_STATUS_LABEL[row.status]].join(','))
    downloadTextFile('pending-dues.csv', [header, ...rows].join('\n'))
  }

  function handleGenerateStatements() {
    const targets = dueList.filter((row) => selectedIds.has(row.id))
    downloadTextFile(
      'fee-statements.txt',
      targets.map((row) => `${row.studentName} (${row.registrationNumber}) — Outstanding: ${formatCurrency(row.outstandingAmount)} — Due ${formatDate(row.dueDate)}`).join('\n\n'),
    )
  }

  function RowActions({ row }) {
    const wasReminded = remindedIds.has(row.id)
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => openStudent(row.studentId)}
          aria-label={`View ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => navigate(ACCOUNTANT_ROUTES.receivePayment)}
          aria-label={`Receive payment from ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <WalletCards className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => handleQuickReminder(row)}
          disabled={wasReminded}
          aria-label={`Send reminder to ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => navigate(ACCOUNTANT_ROUTES.generateInvoice)}
          aria-label={`Generate invoice for ${row.studentName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <BulkActionToolbar
        count={selectedIds.size}
        onSendReminder={handleBulkReminder}
        onExport={handleExport}
        onGenerateStatements={handleGenerateStatements}
      />

      <div className="hidden md:block">
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-white/10">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={dueList.length > 0 && dueList.every((row) => selectedIds.has(row.id))}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                  />
                </th>
                {['Student', 'Reg. No.', 'Class', 'Fee Category', 'Installment', 'Outstanding', 'Due Date', 'Days Remaining', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dueList.map((row) => (
                <tr key={row.id} className="border-b border-slate-100/80 transition-colors duration-200 ease-premium last:border-0 hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      aria-label={`Select ${row.studentName}`}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{row.parentName}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.registrationNumber}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.className}-{row.section}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.feeCategory}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.installment}</td>
                  <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{formatCurrency(row.outstandingAmount)}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{formatDate(row.dueDate)}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                    {row.daysRemaining >= 0 ? `${row.daysRemaining}d` : `${Math.abs(row.daysRemaining)}d overdue`}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={DUE_STATUS_VARIANT[row.status]}>{DUE_STATUS_LABEL[row.status]}</Badge>
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
        {dueList.map((row) => (
          <details key={row.id} className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.studentName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{row.className}-{row.section} · {row.feeCategory}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(row.outstandingAmount)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Due Date</p>
                  <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.dueDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500">Status</p>
                  <Badge variant={DUE_STATUS_VARIANT[row.status]} className="mt-0.5">
                    {DUE_STATUS_LABEL[row.status]}
                  </Badge>
                </div>
              </div>
              <RowActions row={row} />
            </div>
          </details>
        ))}
      </div>

      <StudentDuePreview />
    </div>
  )
}
