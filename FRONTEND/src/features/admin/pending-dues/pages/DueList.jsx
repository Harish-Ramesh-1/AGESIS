import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, ListChecks, Search, Wallet2 } from 'lucide-react'
import { useDueListStore } from '../store/dueListStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatDate } from '../../../../utils/formatDate'
import { CLASS_OPTIONS, DUE_STATUS_LABEL, DUE_STATUS_VARIANT } from '../utils/pendingDuesUtils'

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function DueList() {
  const status = useDueListStore((state) => state.status)
  const error = useDueListStore((state) => state.error)
  const dueList = useDueListStore((state) => state.dueList)
  const fetchDueList = useDueListStore((state) => state.fetchDueList)

  const [query, setQuery] = useState('')
  const [className, setClassName] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDueList({ query, className })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, className])

  const summary = useMemo(() => {
    const total = dueList.reduce((sum, row) => sum + row.outstandingAmount, 0)
    const dueThisWeek = dueList.filter((row) => row.daysRemaining >= 0 && row.daysRemaining <= 7).length
    return { total, count: dueList.length, dueThisWeek }
  }, [dueList])

  const columns = [
    { key: 'studentName', header: 'Student', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</span> },
    { key: 'className', header: 'Class', render: (row) => `${row.className}-${row.section}` },
    { key: 'feeCategory', header: 'Fee Category' },
    { key: 'outstandingAmount', header: 'Amount', render: (row) => formatCurrency(row.outstandingAmount) },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'daysOverdue', header: 'Days Overdue', render: (row) => (row.daysOverdue > 0 ? `${row.daysOverdue}d` : '—') },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={DUE_STATUS_VARIANT[row.status]}>{DUE_STATUS_LABEL[row.status]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Pending Dues" />

      <div aria-live="polite" className="sr-only">
        {dueList.length} students with pending dues institution-wide.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Wallet2} label="Total Pending Amount" value={formatCurrency(summary.total)} meta={`${summary.count} students`} status={status} />
        <SummaryCard icon={ListChecks} label="Students Pending" value={summary.count} status={status} />
        <SummaryCard icon={CalendarClock} label="Due This Week" value={summary.dueThisWeek} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="dues-search" className="sr-only">
              Search students
            </label>
            <input
              id="dues-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by student, parent name or fee category"
              className="w-full rounded-clay border border-white/50 bg-white/50 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <select value={className} onChange={(event) => setClassName(event.target.value)} className={`sm:max-w-[200px] ${selectClass}`} aria-label="Filter by class">
            <option value="">All Classes</option>
            {CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Class {option}
              </option>
            ))}
          </select>
        </div>

        {status === 'error' ? (
          <ErrorState message={error} onRetry={() => fetchDueList({ query, className })} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={dueList}
            keyField="id"
            titleKey="studentName"
            subtitleKey="feeCategory"
            trailingKey="outstandingAmount"
            emptyMessage="No pending dues match the selected filters."
          />
        )}
      </div>
    </div>
  )
}
