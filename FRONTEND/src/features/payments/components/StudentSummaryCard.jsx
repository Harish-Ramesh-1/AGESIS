import { useEffect } from 'react'
import { useStudentStore } from '../../../store/studentStore'
import { useFeeStore } from '../../../store/feeStore'
import Avatar from '../../../components/common/Avatar'
import Skeleton from '../../../components/common/Skeleton'
import GlassCard from '../../../components/common/GlassCard'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function StudentSummaryCard() {
  const studentStatus = useStudentStore((state) => state.status)
  const profile = useStudentStore((state) => state.profile)
  const fetchProfile = useStudentStore((state) => state.fetchProfile)

  const feeStatus = useFeeStore((state) => state.status)
  const feeDetails = useFeeStore((state) => state.details)
  const fetchFeeDetails = useFeeStore((state) => state.fetchFeeDetails)

  useEffect(() => {
    fetchProfile()
    fetchFeeDetails()
  }, [fetchProfile, fetchFeeDetails])

  if (studentStatus === 'loading' || studentStatus === 'idle') {
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

  if (studentStatus === 'error' || !profile) {
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
      <div className="text-left sm:text-right">
        <p className="text-xs text-slate-400 dark:text-slate-500">Current Balance</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">
          {feeStatus === 'success' && feeDetails ? formatCurrency(feeDetails.pendingAmount) : '—'}
        </p>
      </div>
    </GlassCard>
  )
}
