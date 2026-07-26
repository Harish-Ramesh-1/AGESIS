import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CalendarClock, Gauge, ListChecks, TrendingUp, Wallet2 } from 'lucide-react'
import { usePendingDueStore } from '../store/pendingDueStore'
import PendingDuesPageHeader from '../components/PendingDuesPageHeader'
import SectionHeader from '../components/SectionHeader'
import FilterBar from '../components/FilterBar'
import OutstandingSummaryCard from '../components/OutstandingSummaryCard'
import DueListTable from '../components/DueListTable'
import { formatCurrency } from '../../../utils/formatCurrency'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatDate } from '../../../utils/formatDate'
import { DUE_STATUS_LABEL } from '../utils/pendingDuesUtils'

const DEFAULT_FILTERS = { className: '', section: '', feeCategory: '', status: '', minAmount: '', maxAmount: '' }

export default function DueList() {
  const status = usePendingDueStore((state) => state.dueListStatus)
  const dueList = usePendingDueStore((state) => state.dueList)
  const fetchDueList = usePendingDueStore((state) => state.fetchDueList)

  const [query, setQuery] = useState('')
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDueList({ query, ...appliedFilters })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, appliedFilters])

  const summary = useMemo(() => {
    const total = dueList.reduce((sum, row) => sum + row.outstandingAmount, 0)
    const dueToday = dueList.filter((row) => row.status === 'due-today').length
    const dueThisWeek = dueList.filter((row) => row.daysRemaining >= 0 && row.daysRemaining <= 7).length
    const overdueCount = dueList.filter((row) => row.status === 'overdue').length
    const average = dueList.length > 0 ? total / dueList.length : 0
    const collectionRate = dueList.length > 0 ? Math.round(((dueList.length - overdueCount) / dueList.length) * 100) : 100
    return { total, count: dueList.length, dueToday, dueThisWeek, average, collectionRate }
  }, [dueList])

  function handleExport() {
    const header = 'Student,Registration No.,Class,Fee Category,Installment,Outstanding,Due Date,Status'
    const rows = dueList.map((row) => [row.studentName, row.registrationNumber, `${row.className}-${row.section}`, row.feeCategory, row.installment, row.outstandingAmount, formatDate(row.dueDate), DUE_STATUS_LABEL[row.status]].join(','))
    downloadTextFile('due-list.csv', [header, ...rows].join('\n'))
  }

  return (
    <div className="flex flex-col gap-6">
      <PendingDuesPageHeader pageTitle="Due List" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <OutstandingSummaryCard icon={Wallet2} label="Total Outstanding" value={formatCurrency(summary.total)} meta={`${summary.count} students`} status={status} />
        <OutstandingSummaryCard icon={ListChecks} label="Pending Students" value={summary.count} status={status} />
        <OutstandingSummaryCard icon={CalendarClock} label="Due Today" value={summary.dueToday} status={status} />
        <OutstandingSummaryCard icon={CalendarCheck2} label="Due This Week" value={summary.dueThisWeek} status={status} />
        <OutstandingSummaryCard icon={TrendingUp} label="Avg. Outstanding" value={formatCurrency(Math.round(summary.average))} status={status} />
        <OutstandingSummaryCard icon={Gauge} label="Collection Rate" value={`${summary.collectionRate}%`} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Search & Filters" />
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          draftFilters={draftFilters}
          onFilterChange={(key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }))}
          onApply={() => setAppliedFilters(draftFilters)}
          onReset={() => {
            setDraftFilters(DEFAULT_FILTERS)
            setAppliedFilters(DEFAULT_FILTERS)
            setQuery('')
          }}
        />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Outstanding Students" />
        <DueListTable />
      </div>
    </div>
  )
}
