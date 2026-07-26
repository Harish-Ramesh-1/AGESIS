import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useVerificationStore } from '../store/verificationStore'
import Timeline from '../../../../components/common/Timeline'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import VerificationTable from '../components/VerificationTable'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { formatRelativeTime } from '../../../../utils/formatDate'

export default function PaymentVerification() {
  const items = useVerificationStore((state) => state.items)
  const fetchQueue = useVerificationStore((state) => state.fetchQueue)

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const auditTrail = items.filter((item) => item.verificationStatus !== 'pending')

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader pageTitle="Payment Verification" />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <SectionHeader title="Pending Verification" description="Online transactions awaiting manual verification" />
        <VerificationTable />
      </div>

      {auditTrail.length > 0 && (
        <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
          />
          <SectionHeader title="Audit Trail" description="Recent verification decisions" />
          <Timeline
            items={auditTrail.map((item) => ({
              id: item.id,
              icon: item.verificationStatus === 'verified' ? CheckCircle2 : XCircle,
              tone: item.verificationStatus === 'verified' ? 'emerald' : 'red',
              title: `${item.studentName} · ${formatCurrency(item.amount)}`,
              description: `${item.id} marked ${item.verificationStatus}`,
              meta: formatRelativeTime(item.verificationDate),
            }))}
          />
        </div>
      )}
    </div>
  )
}
