import { PhoneCall } from 'lucide-react'
import GlassCard from '../../../components/common/GlassCard'
import InfoItem from './InfoItem'

export default function EmergencyCard({ guardians }) {
  const primary = guardians.find((guardian) => guardian.isEmergencyContact) ?? guardians[0]
  const secondary = guardians.find((guardian) => guardian.id !== primary?.id)

  return (
    <GlassCard
      title="Emergency Contacts"
      action={<PhoneCall className="h-4 w-4 text-red-500" aria-hidden="true" />}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {primary && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Primary Guardian
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">
              <InfoItem label="Name" value={primary.name} />
              <InfoItem label="Relationship" value={primary.relationship} />
              <InfoItem label="Emergency Phone" value={primary.phone} />
            </dl>
          </div>
        )}
        {secondary && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Secondary Guardian
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">
              <InfoItem label="Name" value={secondary.name} />
              <InfoItem label="Relationship" value={secondary.relationship} />
              <InfoItem label="Emergency Phone" value={secondary.phone} />
            </dl>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
