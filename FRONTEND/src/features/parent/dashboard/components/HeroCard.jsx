import { useEffect } from 'react'
import { useStudentStore } from '../../../../store/studentStore'
import Avatar from '../../../../components/common/Avatar/Avatar'
import Badge from '../../../../components/common/Badge/Badge'
import Skeleton from '../../../../components/common/Skeleton/Skeleton'

const STATUS_VARIANT = { paid: 'success', pending: 'warning', overdue: 'danger' }
const STATUS_LABEL = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue' }

export default function HeroCard() {
  const status = useStudentStore((state) => state.status)
  const profile = useStudentStore((state) => state.profile)
  const error = useStudentStore((state) => state.error)
  const fetchProfile = useStudentStore((state) => state.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        </div>
      </div>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <div className="rounded-clay border border-red-100 bg-red-50/60 p-6 text-sm text-red-700 shadow-clay dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        Couldn&apos;t load your profile. {error}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-6 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome, <span className="font-semibold text-slate-900 dark:text-white">{profile.parentName}</span>
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {profile.studentName}
          </h2>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">Registration No.</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{profile.registrationNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">Class &amp; Section</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">
                {profile.className} - {profile.section}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">Academic Year</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{profile.academicYear}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 dark:text-slate-500">School</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-200">{profile.school}</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
          <Avatar initials={profile.avatarInitials} size="lg" />
          <Badge variant={STATUS_VARIANT[profile.paymentStatus]}>{STATUS_LABEL[profile.paymentStatus]}</Badge>
        </div>
      </div>
    </div>
  )
}
