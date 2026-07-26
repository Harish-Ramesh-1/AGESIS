import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  BellRing,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import clsx from 'clsx'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import { useSearchStore } from '../store/searchStore'
import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import EmptyState from '../../../components/common/EmptyState'
import SectionHeader from './SectionHeader'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { formatCurrency } from '../../../utils/formatCurrency'
import { FEE_STATUS_LABEL, FEE_STATUS_VARIANT } from '../utils/feeManagementUtils'

const PAGE_SIZE = 8

export default function StudentDirectoryTable() {
  const listStatus = useStudentDirectoryStore((state) => state.listStatus)
  const students = useStudentDirectoryStore((state) => state.students)
  const listError = useStudentDirectoryStore((state) => state.listError)
  const fetchStudents = useStudentDirectoryStore((state) => state.fetchStudents)
  const selectStudent = useStudentDirectoryStore((state) => state.selectStudent)
  const selectedStudentId = useStudentDirectoryStore((state) => state.selectedStudentId)

  const query = useSearchStore((state) => state.query)
  const appliedFilters = useSearchStore((state) => state.appliedFilters)

  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [remindedIds, setRemindedIds] = useState(() => new Set())

  useEffect(() => {
    fetchStudents({ query, ...appliedFilters })
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, appliedFilters])

  const sortedStudents = useMemo(() => {
    const copy = [...students]
    copy.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      if (sortKey === 'outstandingAmount') return (a.outstandingAmount - b.outstandingAmount) * direction
      if (sortKey === 'status') return a.status.localeCompare(b.status) * direction
      return a.name.localeCompare(b.name) * direction
    })
    return copy
  }, [students, sortKey, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PAGE_SIZE))
  const pageStudents = sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected = pageStudents.every((student) => prev.has(student.id))
      const next = new Set(prev)
      pageStudents.forEach((student) => (allSelected ? next.delete(student.id) : next.add(student.id)))
      return next
    })
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBulkReminder() {
    setRemindedIds((prev) => new Set([...prev, ...selectedIds]))
  }

  const allOnPageSelected = pageStudents.length > 0 && pageStudents.every((student) => selectedIds.has(student.id))

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Student Directory"
        description={listStatus === 'success' ? `${sortedStudents.length} students found` : undefined}
      />

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200/60 bg-brand-50/60 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
          <p className="text-sm font-medium text-brand-800 dark:text-brand-200">{selectedIds.size} selected</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkReminder}
              disabled={[...selectedIds].every((id) => remindedIds.has(id))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
              {[...selectedIds].every((id) => remindedIds.has(id)) ? 'Reminder Sent' : 'Send Reminder'}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export Selected
            </button>
          </div>
        </div>
      )}

      {listStatus === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load students. {listError}</p>}

      {(listStatus === 'loading' || listStatus === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      )}

      {listStatus === 'success' && sortedStudents.length === 0 && (
        <EmptyState icon={UsersRound} title="No students found" description="Try adjusting your search or filters." />
      )}

      {listStatus === 'success' && sortedStudents.length > 0 && (
        <>
          <div className="hidden md:block">
            <div className="thin-scrollbar overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 dark:border-white/10">
                    <th className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all students on this page"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                      />
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <button type="button" onClick={() => handleSort('name')} className="inline-flex items-center gap-1">
                        Student <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Reg. No.
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Class
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Parent
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleSort('outstandingAmount')}
                        className="inline-flex items-center gap-1"
                      >
                        Outstanding <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1">
                        Status <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => selectStudent(student.id)}
                      aria-current={selectedStudentId === student.id ? 'true' : undefined}
                      className={clsx(
                        'cursor-pointer border-b border-slate-100/80 transition-colors duration-200 ease-premium last:border-0 hover:bg-white/50 dark:border-white/5 dark:hover:bg-white/[0.05]',
                        selectedStudentId === student.id && 'bg-brand-50/60 dark:bg-brand-500/10',
                      )}
                    >
                      <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleSelect(student.id)}
                          aria-label={`Select ${student.name}`}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={student.avatarInitials} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{student.admissionNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{student.registrationNumber}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {student.className}-{student.section}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{student.parentName}</td>
                      <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">
                        {formatCurrency(student.outstandingAmount)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={FEE_STATUS_VARIANT[student.status]}>{FEE_STATUS_LABEL[student.status]}</Badge>
                      </td>
                      <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => selectStudent(student.id)}
                            aria-label={`View profile for ${student.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(ACCOUNTANT_ROUTES.receivePayment)}
                            aria-label={`Receive payment from ${student.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/10"
                          >
                            <WalletCards className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {pageStudents.map((student) => (
              <details
                key={student.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={student.avatarInitials} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {student.className}-{student.section} · {student.registrationNumber}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Parent</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{student.parentName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Outstanding</p>
                      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                        {formatCurrency(student.outstandingAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Status</p>
                      <Badge variant={FEE_STATUS_VARIANT[student.status]} className="mt-0.5">
                        {FEE_STATUS_LABEL[student.status]}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectStudent(student.id)}
                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    View Financial Profile
                  </button>
                </div>
              </details>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/40 text-slate-600 transition-colors duration-200 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/40 text-slate-600 transition-colors duration-200 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
