import { X } from 'lucide-react'
import { useDueStudentStore } from '../store/dueStudentStore'
import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { DUE_STATUS_LABEL, DUE_STATUS_VARIANT } from '../utils/pendingDuesUtils'

export default function StudentDuePreview() {
  const status = useDueStudentStore((state) => state.status)
  const student = useDueStudentStore((state) => state.student)
  const error = useDueStudentStore((state) => state.error)
  const closeStudent = useDueStudentStore((state) => state.closeStudent)

  if (status === 'idle') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={closeStudent} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Student due details"
        className="relative z-10 w-full max-w-md rounded-clay border border-white/50 bg-white/95 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <button
          type="button"
          onClick={closeStudent}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {status === 'loading' && <Skeleton className="h-48" />}
        {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load student. {error}</p>}

        {status === 'success' && student && (
          <>
            <div className="flex items-center gap-3">
              <Avatar initials={student.avatarInitials} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{student.studentName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Class {student.className}-{student.section} · {student.registrationNumber}
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Parent</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.parentName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Mobile</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.parentPhone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Fee Category</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.feeCategory}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 dark:text-slate-500">Installment</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">{student.installment}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-amber-700 dark:text-amber-300">Outstanding Amount</p>
                <Badge variant={DUE_STATUS_VARIANT[student.status]}>{DUE_STATUS_LABEL[student.status]}</Badge>
              </div>
              <p className="mt-0.5 text-2xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(student.outstandingAmount)}</p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">Due {formatDate(student.dueDate)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
