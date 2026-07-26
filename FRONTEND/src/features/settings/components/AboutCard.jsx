import GlassCard from '../../../components/common/GlassCard'
import { GlassButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import InfoItem from './InfoItem'

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL

export default function AboutCard() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="About" description="Application information" />

      <GlassCard hover={false}>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <InfoItem label="AGESIS Version" value="1.0" />
          <InfoItem label="Application Build" value="2026.07.24" />
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <GlassButton onClick={() => window.open(`${PUBLIC_SITE_URL}/privacy`, '_blank', 'noopener,noreferrer')}>
            Privacy Policy
          </GlassButton>
          <GlassButton onClick={() => window.open(`${PUBLIC_SITE_URL}/terms`, '_blank', 'noopener,noreferrer')}>
            Terms of Service
          </GlassButton>
          <GlassButton onClick={() => window.open(`${PUBLIC_SITE_URL}/licenses`, '_blank', 'noopener,noreferrer')}>
            Licenses
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
