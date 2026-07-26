import { useEffect, useState } from 'react'
import { useStudentProfileStore } from '../../../store/studentProfileStore'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import ProfileHero from '../components/ProfileHero'
import StudentInfoCard from '../components/StudentInfoCard'
import ParentCard from '../components/ParentCard'
import SchoolInfoCard from '../components/SchoolInfoCard'
import AddressCard from '../components/AddressCard'
import MedicalCard from '../components/MedicalCard'
import AcademicCard from '../components/AcademicCard'
import FeeSummaryCard from '../components/FeeSummaryCard'
import DocumentsCard from '../components/DocumentsCard'
import EmergencyCard from '../components/EmergencyCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'

export default function StudentProfilePage() {
  const status = useStudentProfileStore((state) => state.status)
  const profile = useStudentProfileStore((state) => state.profile)
  const fetchStudentProfile = useStudentProfileStore((state) => state.fetchStudentProfile)
  const [academicYear, setAcademicYear] = useState('2025-2026')

  useEffect(() => {
    fetchStudentProfile()
  }, [fetchStudentProfile])

  if (status === 'error') {
    return (
      <div>
        <PageHeader title="Student Profile" />
        <ErrorState message="Couldn't load the student profile." onRetry={fetchStudentProfile} />
      </div>
    )
  }

  if (status !== 'success' || !profile) {
    return (
      <div>
        <PageHeader title="Student Profile" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Student Profile"
        academicYear={academicYear}
        academicYearOptions={['2025-2026', '2024-2025']}
        onAcademicYearChange={setAcademicYear}
      />

      <div className="flex flex-col gap-8">
        <ProfileHero profile={profile} />

        <StudentInfoCard personal={profile.personal} />

        <section>
          <SectionHeader title="Parent & Guardian Information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile.guardians.map((guardian) => (
              <ParentCard key={guardian.id} guardian={guardian} />
            ))}
          </div>
        </section>

        <SchoolInfoCard school={profile.school} />

        <AddressCard address={profile.address} />

        <MedicalCard medical={profile.medical} />

        <AcademicCard snapshot={profile.academicSnapshot} />

        <FeeSummaryCard />

        <DocumentsCard documents={profile.documents} />

        <EmergencyCard guardians={profile.guardians} />
      </div>
    </div>
  )
}
