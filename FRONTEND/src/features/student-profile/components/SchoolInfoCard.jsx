import GlassCard from '../../../components/common/GlassCard'
import InfoItem from './InfoItem'

export default function SchoolInfoCard({ school }) {
  return (
    <GlassCard title="School Information">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <InfoItem label="School Name" value={school.name} />
        <InfoItem label="Campus" value={school.campus} />
        <InfoItem label="Department" value={school.department} />
        <InfoItem label="Class Teacher" value={school.classTeacher} />
        <InfoItem label="Academic Coordinator" value={school.academicCoordinator} />
        <InfoItem label="House" value={school.house} />
        <InfoItem label="Bus Route" value={school.busRoute} />
        <InfoItem label="Hostel Status" value={school.hostelStatus} />
      </dl>
    </GlassCard>
  )
}
