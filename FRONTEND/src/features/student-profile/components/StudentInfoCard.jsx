import GlassCard from '../../../components/common/GlassCard'
import InfoItem from './InfoItem'
import { formatDate } from '../../../utils/formatDate'

export default function StudentInfoCard({ personal }) {
  return (
    <GlassCard title="Student Information">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoItem label="Date of Birth" value={formatDate(personal.dob)} />
        <InfoItem label="Gender" value={personal.gender} />
        <InfoItem label="Blood Group" value={personal.bloodGroup} />
        <InfoItem label="Nationality" value={personal.nationality} />
        <InfoItem label="Religion" value={personal.religion} />
        <InfoItem label="Category" value={personal.category} />
        <InfoItem label="Student Email" value={personal.email} />
        <InfoItem label="Student Phone" value={personal.phone} />
        <InfoItem label="Admission Date" value={formatDate(personal.admissionDate)} />
      </dl>
    </GlassCard>
  )
}
