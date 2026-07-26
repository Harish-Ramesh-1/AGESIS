import { Mail, Phone, ShieldAlert } from 'lucide-react'
import Avatar from '../../../components/common/Avatar'
import Badge from '../../../components/common/Badge'

export default function ParentCard({ guardian }) {
  return (
    <div className="flex flex-col gap-3 rounded-clay border border-white/40 bg-white/30 p-5 transition-all duration-200 ease-premium hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <Avatar initials={guardian.initials} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{guardian.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{guardian.relationship}</p>
        </div>
        {guardian.isEmergencyContact && (
          <Badge variant="danger" className="ml-auto shrink-0">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            Emergency
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {guardian.email}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {guardian.phone}
        </span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{guardian.occupation}</p>
    </div>
  )
}
