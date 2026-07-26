import { useEffect, useMemo } from 'react'
import { Award, Check, Gauge, Hourglass, Users2, X } from 'lucide-react'
import { useScholarshipProgramStore } from '../store/scholarshipProgramStore'
import FeeConfigPageHeader from '../components/FeeConfigPageHeader'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import Badge from '../../../components/common/Badge'
import ProgressBar from '../../../components/common/ProgressBar'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { downloadCsv } from '../utils/exportUtils'
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_VARIANT,
  SCHOLARSHIP_TYPE_LABEL,
  SCHOLARSHIP_TYPE_VARIANT,
} from '../utils/feeConfigUtils'

export default function Scholarships() {
  const status = useScholarshipProgramStore((state) => state.status)
  const error = useScholarshipProgramStore((state) => state.error)
  const programs = useScholarshipProgramStore((state) => state.programs)
  const fetchPrograms = useScholarshipProgramStore((state) => state.fetchPrograms)

  const applicationsStatus = useScholarshipProgramStore((state) => state.applicationsStatus)
  const applicationsError = useScholarshipProgramStore((state) => state.applicationsError)
  const applications = useScholarshipProgramStore((state) => state.applications)
  const fetchApplications = useScholarshipProgramStore((state) => state.fetchApplications)
  const actioningId = useScholarshipProgramStore((state) => state.actioningId)
  const approve = useScholarshipProgramStore((state) => state.approve)
  const reject = useScholarshipProgramStore((state) => state.reject)

  useEffect(() => {
    fetchPrograms()
    fetchApplications()
  }, [fetchPrograms, fetchApplications])

  const summary = useMemo(() => {
    const activePrograms = programs.filter((row) => row.status === 'active').length
    const totalRecipients = programs.reduce((sum, row) => sum + row.activeRecipients, 0)
    const totalAllocated = programs.reduce((sum, row) => sum + row.budgetAllocated, 0)
    const totalUsed = programs.reduce((sum, row) => sum + row.budgetUsed, 0)
    const budgetUtilizedPercent = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0
    const pendingApplications = applications.filter((row) => row.status === 'pending').length
    return { activePrograms, totalRecipients, budgetUtilizedPercent, totalUsed, totalAllocated, pendingApplications }
  }, [programs, applications])

  function handleExport() {
    downloadCsv(
      'scholarship-programs.csv',
      ['Program', 'Type', 'Discount', 'Active Recipients', 'Budget Allocated', 'Budget Used'],
      programs.map((row) => [
        row.name,
        SCHOLARSHIP_TYPE_LABEL[row.type],
        row.discountType === 'percentage' ? `${row.discountValue}%` : formatCurrency(row.discountValue),
        row.activeRecipients,
        row.budgetAllocated,
        row.budgetUsed,
      ]),
    )
  }

  const programColumns = [
    { key: 'name', header: 'Program', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span> },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={SCHOLARSHIP_TYPE_VARIANT[row.type]}>{SCHOLARSHIP_TYPE_LABEL[row.type]}</Badge> },
    { key: 'discount', header: 'Discount', render: (row) => (row.discountType === 'percentage' ? `${row.discountValue}%` : formatCurrency(row.discountValue)) },
    { key: 'activeRecipients', header: 'Recipients' },
    {
      key: 'budget',
      header: 'Budget Utilization',
      render: (row) => {
        const percent = row.budgetAllocated > 0 ? Math.round((row.budgetUsed / row.budgetAllocated) * 100) : 0
        return (
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{formatCurrency(row.budgetUsed)}</span>
              <span>{percent}%</span>
            </div>
            <ProgressBar value={percent} className="mt-1" />
          </div>
        )
      },
    },
  ]

  const applicationColumns = [
    { key: 'studentName', header: 'Student', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</span> },
    { key: 'className', header: 'Class' },
    { key: 'programName', header: 'Program' },
    { key: 'requestedAmount', header: 'Requested Amount', render: (row) => formatCurrency(row.requestedAmount) },
    { key: 'appliedDate', header: 'Applied', render: (row) => formatDate(row.appliedDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={APPLICATION_STATUS_VARIANT[row.status]}>{APPLICATION_STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => approve(row.id)}
              disabled={actioningId === row.id}
              aria-label={`Approve application for ${row.studentName}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-emerald-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => reject(row.id)}
              disabled={actioningId === row.id}
              aria-label={`Reject application for ${row.studentName}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-red-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">No action needed</span>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <FeeConfigPageHeader pageTitle="Scholarships & Discounts" onExport={handleExport} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Award} label="Active Programs" value={summary.activePrograms} status={status} />
        <SummaryCard icon={Users2} label="Total Recipients" value={summary.totalRecipients} status={status} />
        <SummaryCard icon={Gauge} label="Budget Utilized" value={`${summary.budgetUtilizedPercent}%`} meta={`${formatCurrency(summary.totalUsed)} of ${formatCurrency(summary.totalAllocated)}`} status={status} />
        <SummaryCard icon={Hourglass} label="Pending Applications" value={summary.pendingApplications} status={applicationsStatus} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Scholarship & Discount Programs</h2>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchPrograms} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={programColumns}
            rows={programs}
            keyField="id"
            titleKey="name"
            subtitleKey="type"
            trailingKey="activeRecipients"
            emptyMessage="No scholarship programs configured yet."
          />
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Application Approval Queue</h2>
        {applicationsStatus === 'error' ? (
          <ErrorState message={applicationsError} onRetry={fetchApplications} />
        ) : applicationsStatus === 'loading' || applicationsStatus === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={applicationColumns}
            rows={applications}
            keyField="id"
            titleKey="studentName"
            subtitleKey="programName"
            trailingKey="requestedAmount"
            emptyMessage="No scholarship applications yet."
          />
        )}
      </div>
    </div>
  )
}
