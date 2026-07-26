import { useEffect } from 'react'
import { useRefundStore } from '../store/refundStore'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import RefundTable from '../components/RefundTable'

export default function RefundManagement() {
  const fetchRefunds = useRefundStore((state) => state.fetchRefunds)

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader pageTitle="Refund Management" />

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Refund Requests" description="Pending and approved refunds needing action" />
        <RefundTable statusFilter={['pending', 'approved']} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <SectionHeader title="Refund History" description="Processed and rejected refunds" />
        <RefundTable statusFilter={['processed', 'rejected']} />
      </div>
    </div>
  )
}
