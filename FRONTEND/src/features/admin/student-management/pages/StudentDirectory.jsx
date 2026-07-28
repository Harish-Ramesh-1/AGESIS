import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Pencil, UserCheck, UserPlus, UsersRound } from 'lucide-react'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import { CLASS_NUMBERS } from '../services/studentManagementService'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import Badge from '../../../../components/common/Badge'
import { SecondaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import PageHeaderSimple from '../components/PageHeaderSimple'
import KpiCard from '../components/KpiCard'
import ResponsiveTable from '../components/ResponsiveTable'

const PAGE_SIZE = 10

const STATUS_VARIANT = { active: 'success', inactive: 'neutral', alumnus: 'info' }
const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', alumnus: 'Alumnus' }

const selectClass =
  'rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100'

export default function StudentDirectory() {
  const status = useStudentDirectoryStore((state) => state.status)
  const error = useStudentDirectoryStore((state) => state.error)
  const students = useStudentDirectoryStore((state) => state.students)
  const kpis = useStudentDirectoryStore((state) => state.kpis)
  const fetchDirectory = useStudentDirectoryStore((state) => state.fetchDirectory)

  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchDirectory()
  }, [fetchDirectory])

  useEffect(() => {
    setPage(1)
  }, [query, classFilter, statusFilter])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (classFilter && student.className !== classFilter) return false
      if (statusFilter && student.status !== statusFilter) return false
      if (query) {
        const q = query.toLowerCase()
        if (![student.name, student.parentName, student.id].join(' ').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [students, classFilter, statusFilter, query])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const pageStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns = [
    { key: 'name', header: 'Student', render: (row) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{row.name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{row.id}</p>
      </div>
    ) },
    { key: 'classSection', header: 'Class', render: (row) => `${row.className}-${row.section}` },
    { key: 'rollNo', header: 'Roll No.' },
    { key: 'parentName', header: 'Parent' },
    { key: 'admissionDate', header: 'Admission Date', render: (row) => formatDate(row.admissionDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`View profile for ${row.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Edit record for ${row.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Student Directory" />

      <div aria-live="polite" className="sr-only">
        {filteredStudents.length} students matching current filters.
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchDirectory} />}

      {status === 'success' && kpis && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={UsersRound} label="Total Students" value={kpis.totalStudents.toLocaleString('en-IN')} meta="Institution-wide" />
            <KpiCard icon={UserCheck} label="Active" value={kpis.activeCount.toLocaleString('en-IN')} meta="Currently enrolled" />
            <KpiCard icon={UserPlus} label="New Admissions This Term" value={kpis.newAdmissionsThisTerm} meta="Since 1 Apr 2026" />
            <KpiCard icon={UsersRound} label="Avg. Class Size" value={kpis.avgClassSize} meta="Students per section" />
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
            />

            <div className="mb-5 flex flex-col gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by student name, parent name, or admission number"
                aria-label="Search students"
                className="w-full rounded-clay border border-white/50 bg-white/50 px-4 py-3 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sd-class-filter" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Class
                  </label>
                  <select id="sd-class-filter" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className={selectClass}>
                    <option value="">All Classes</option>
                    {CLASS_NUMBERS.map((item) => (
                      <option key={item} value={item}>
                        Grade {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sd-status-filter" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Status
                  </label>
                  <select id="sd-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClass}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="alumnus">Alumnus</option>
                  </select>
                </div>
                <SecondaryButton
                  fullWidth={false}
                  onClick={() => {
                    setQuery('')
                    setClassFilter('')
                    setStatusFilter('')
                  }}
                >
                  Reset
                </SecondaryButton>
              </div>
            </div>

            <ResponsiveTable
              columns={columns}
              rows={pageStudents}
              titleKey="name"
              subtitleKey="parentName"
              trailingKey="status"
              emptyIcon={UsersRound}
              emptyTitle="No students found"
            />

            {filteredStudents.length > 0 && totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page {page} of {totalPages} · {filteredStudents.length} students
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
          </div>
        </>
      )}
    </div>
  )
}
