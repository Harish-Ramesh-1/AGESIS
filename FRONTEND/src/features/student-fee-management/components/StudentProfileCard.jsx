import { useNavigate } from 'react-router-dom'
import { FilePlus2, Receipt, WalletCards, X } from 'lucide-react'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { formatCurrency } from '../../../utils/formatCurrency'
import { FEE_STATUS_LABEL, FEE_STATUS_VARIANT } from '../utils/feeManagementUtils'

export default function StudentProfileCard() {
  const status = useStudentDirectoryStore((state) => state.detailStatus)
  const student = useStudentDirectoryStore((state) => state.selectedStudent)
  const error = useStudentDirectoryStore((state) => state.detailError)
  const clearSelection = useStudentDirectoryStore((state) => state.clearSelection)
  const navigate = useNavigate()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || !student) {
    return (
      <div className="rounded-clay border border-red-100 bg-red-50/60 p-6 text-sm text-red-700 shadow-clay dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        Couldn&apos;t load this student&apos;s profile. {error}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <button
        type="button"
        onClick={clearSelection}
        aria-label="Close student profile"
        className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar initials={student.avatarInitials} size="lg" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Class {student.className}-{student.section} · {student.academicYear}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Admission No.</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.admissionNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Registration No.</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.registrationNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Parent</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.parentName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Parent Phone</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.parentPhone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Parent Email</dt>
                <dd className="truncate font-medium text-slate-700 dark:text-slate-200">{student.parentEmail}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 rounded-2xl border border-white/40 bg-white/40 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04] sm:items-end">
          <Badge variant={FEE_STATUS_VARIANT[student.status]}>{FEE_STATUS_LABEL[student.status]}</Badge>
          <div className="sm:text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">Outstanding Balance</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(student.outstandingAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryButton fullWidth={false} onClick={() => navigate(ACCOUNTANT_ROUTES.paymentHistory)}>
          <Receipt className="h-4 w-4" aria-hidden="true" />
          View Payments
        </PrimaryButton>
        <SecondaryButton fullWidth={false} onClick={() => navigate(ACCOUNTANT_ROUTES.generateInvoice)}>
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Generate Invoice
        </SecondaryButton>
        <SecondaryButton fullWidth={false} onClick={() => navigate(ACCOUNTANT_ROUTES.receivePayment)}>
          <WalletCards className="h-4 w-4" aria-hidden="true" />
          Receive Payment
        </SecondaryButton>
      </div>
    </div>
  )
}
