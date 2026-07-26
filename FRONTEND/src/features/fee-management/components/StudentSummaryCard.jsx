import { useEffect } from 'react'
import { useStudentStore } from '../../../store/studentStore'
import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'
import Skeleton from '../../../components/common/Skeleton'
import GlassCard from '../../../components/common/GlassCard'

const STATUS_VARIANT = { paid: 'success', pending: 'warning', overdue: 'danger' }
const STATUS_LABEL = { paid: 'Paid', pending: 'Pending', overdue: 'Overdue' }

export default function StudentSummaryCard() {
  const status = useStudentStore((state) => state.status)
  const profile = useStudentStore((state) => state.profile)
  const fetchProfile = useStudentStore((state) => state.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (status === 'loading' || status === 'idle') {
    return (
      <GlassCard hover={false} className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </GlassCard>
    )
  }

  if (status === 'error' || !profile) {
    return null
  }

  return (
    <GlassCard
      hover={false}
      className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <Avatar initials={profile.avatarInitials} size="md" />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.studentName}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {profile.registrationNumber} · {profile.className} - {profile.section} · {profile.academicYear}
          </p>
        </div>
      </div>
      <Badge variant={STATUS_VARIANT[profile.paymentStatus]}>{STATUS_LABEL[profile.paymentStatus]}</Badge>
    </GlassCard>
  )
}
