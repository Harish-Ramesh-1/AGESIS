import { useEffect } from 'react'
import { CircleDollarSign, GraduationCap, Wallet, Wallet2 } from 'lucide-react'
import { useFeeStore } from '../../../store/feeStore'
import PageHeader from '../components/PageHeader'
import SectionHeader from '../components/SectionHeader'
import FeeSummaryCard from '../components/FeeSummaryCard'
import FeeBreakdownTable from '../components/FeeBreakdownTable'
import PaymentProgress from '../components/PaymentProgress'
import InstallmentTimeline from '../components/InstallmentTimeline'
import ScholarshipCard from '../components/ScholarshipCard'
import ActivityTimeline from '../components/ActivityTimeline'
import DocumentCard from '../components/DocumentCard'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { formatCurrency } from '../../../utils/formatCurrency'

export default function FeeDetails() {
  const status = useFeeStore((state) => state.status)
  const details = useFeeStore((state) => state.details)
  const fetchFeeDetails = useFeeStore((state) => state.fetchFeeDetails)

  useEffect(() => {
    fetchFeeDetails()
  }, [fetchFeeDetails])

  return (
    <div>
      <PageHeader
        title="Fee Details"
        description="Complete overview of your child's fee structure and payment status."
      />

      {status === 'error' && <ErrorState message="Couldn't load fee details." onRetry={fetchFeeDetails} />}

      {(status === 'loading' || status === 'idle') && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      )}

      {status === 'success' && details && (
        <div className="flex flex-col gap-8">
          <section>
            <SectionHeader title="Fee Summary" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <FeeSummaryCard icon={Wallet} label="Total Fee" value={formatCurrency(details.totalFee)} tone="brand" />
              <FeeSummaryCard
                icon={Wallet2}
                label="Paid"
                value={formatCurrency(details.amountPaid)}
                tone="emerald"
              />
              <FeeSummaryCard
                icon={CircleDollarSign}
                label="Pending"
                value={formatCurrency(details.pendingAmount)}
                tone="amber"
              />
              <FeeSummaryCard
                icon={GraduationCap}
                label="Scholarship"
                value={formatCurrency(details.scholarshipTotal)}
                tone="violet"
              />
            </div>
          </section>

          <section>
            <SectionHeader title="Complete Fee Breakdown" description="Every component of your annual fee" />
            <GlassCard hover={false}>
              <FeeBreakdownTable components={details.components} />
            </GlassCard>
          </section>

          <section>
            <PaymentProgress percent={details.progressPercent} remainingBalance={details.pendingAmount} />
          </section>

          <section>
            <InstallmentTimeline installments={details.installments} />
          </section>

          <section>
            <SectionHeader title="Scholarships & Discounts" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {details.scholarships.map((item) => (
                <ScholarshipCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section>
            <ActivityTimeline activities={details.activities} />
          </section>

          <section>
            <DocumentCard />
          </section>
        </div>
      )}
    </div>
  )
}
