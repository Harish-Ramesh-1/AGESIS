import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'
import GlassCard from '../../../components/common/GlassCard'
import { formatDate } from '../../../utils/formatDate'

const STATUS_VARIANT = { active: 'success', inactive: 'warning', graduated: 'info' }

export default function ProfileHero({ profile }) {
  return (
    <GlassCard hover={false}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="transition-transform duration-200 ease-premium hover:scale-105">
            <Avatar initials={profile.avatarInitials} size="lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {profile.className} - {profile.section} · Roll No. {profile.rollNumber}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Admitted {formatDate(profile.personal.admissionDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:flex sm:flex-col sm:items-end sm:gap-2 sm:text-right">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Registration No.</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{profile.registrationNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Admission No.</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{profile.admissionNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Academic Year</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{profile.academicYear}</p>
          </div>
          <Badge variant={STATUS_VARIANT[profile.status]} className="w-fit sm:ml-auto">
            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
          </Badge>
        </div>
      </div>
    </GlassCard>
  )
}
