import { useEffect, useMemo, useState } from 'react'
import { Award, Gauge, Plus, ToggleLeft, ToggleRight, Users2 } from 'lucide-react'
import { useScholarshipsStore } from '../store/scholarshipsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import ScholarshipFormModal from '../components/ScholarshipFormModal'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton } from '../../../../components/common/Button'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { DISCOUNT_TYPE_LABEL, SCHOLARSHIP_TYPE_LABEL, SCHOLARSHIP_TYPE_VARIANT } from '../utils/feeStructureUtils'

export default function Scholarships() {
  const status = useScholarshipsStore((state) => state.status)
  const error = useScholarshipsStore((state) => state.error)
  const policies = useScholarshipsStore((state) => state.policies)
  const fetchPolicies = useScholarshipsStore((state) => state.fetchPolicies)
  const actioningId = useScholarshipsStore((state) => state.actioningId)
  const toggleActive = useScholarshipsStore((state) => state.toggleActive)

  const recipientsStatus = useScholarshipsStore((state) => state.recipientsStatus)
  const recipientsError = useScholarshipsStore((state) => state.recipientsError)
  const recipients = useScholarshipsStore((state) => state.recipients)
  const fetchRecipients = useScholarshipsStore((state) => state.fetchRecipients)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPolicies()
    fetchRecipients()
  }, [fetchPolicies, fetchRecipients])

  const summary = useMemo(() => {
    const activePolicies = policies.filter((row) => row.active).length
    const totalRecipients = policies.reduce((sum, row) => sum + row.activeRecipients, 0)
    const totalDiscountValue = recipients.reduce((sum, row) => sum + row.discountAmount, 0)
    const avgDiscount = recipients.length > 0 ? Math.round(totalDiscountValue / recipients.length) : 0
    return { activePolicies, totalRecipients, totalDiscountValue, avgDiscount }
  }, [policies, recipients])

  const policyColumns = [
    { key: 'name', header: 'Policy', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.name}</span> },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={SCHOLARSHIP_TYPE_VARIANT[row.type]}>{SCHOLARSHIP_TYPE_LABEL[row.type]}</Badge> },
    { key: 'discountType', header: 'Discount Type', render: (row) => DISCOUNT_TYPE_LABEL[row.discountType] },
    { key: 'discount', header: 'Discount', render: (row) => (row.discountType === 'percentage' ? `${row.discountValue}%` : formatCurrency(row.discountValue)) },
    { key: 'eligibility', header: 'Eligibility Criteria' },
    { key: 'activeRecipients', header: 'Recipients' },
    {
      key: 'active',
      header: 'Status',
      render: (row) => <Badge variant={row.active ? 'success' : 'neutral'}>{row.active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => toggleActive(row.id)}
          disabled={actioningId === row.id}
          aria-label={row.active ? `Deactivate ${row.name}` : `Activate ${row.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 hover:text-brand-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
        >
          {row.active ? <ToggleRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> : <ToggleLeft className="h-5 w-5" aria-hidden="true" />}
        </button>
      ),
    },
  ]

  const recipientColumns = [
    { key: 'studentName', header: 'Student', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.studentName}</span> },
    { key: 'className', header: 'Class', render: (row) => `${row.className} - ${row.section}` },
    { key: 'scholarshipName', header: 'Scholarship / Discount' },
    { key: 'discountAmount', header: 'Discount Amount', render: (row) => formatCurrency(row.discountAmount) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Scholarships & Discounts"
        extraControls={
          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Scholarship Policy
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Award} label="Active Policies" value={summary.activePolicies} status={status} />
        <SummaryCard icon={Users2} label="Total Recipients" value={summary.totalRecipients} status={status} />
        <SummaryCard icon={Gauge} label="Total Discount Value" value={formatCurrency(summary.totalDiscountValue)} status={recipientsStatus} />
        <SummaryCard icon={Gauge} label="Avg. Discount / Student" value={formatCurrency(summary.avgDiscount)} status={recipientsStatus} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Scholarship & Discount Policies</h2>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchPolicies} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={policyColumns}
            rows={policies}
            keyField="id"
            titleKey="name"
            subtitleKey="type"
            trailingKey="activeRecipients"
            emptyMessage="No scholarship policies configured yet."
          />
        )}
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Students Currently Availing Scholarships</h2>
        {recipientsStatus === 'error' ? (
          <ErrorState message={recipientsError} onRetry={fetchRecipients} />
        ) : recipientsStatus === 'loading' || recipientsStatus === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={recipientColumns}
            rows={recipients}
            keyField="id"
            titleKey="studentName"
            subtitleKey="scholarshipName"
            trailingKey="discountAmount"
            emptyMessage="No students are currently availing scholarships."
          />
        )}
      </div>

      {isModalOpen && <ScholarshipFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
