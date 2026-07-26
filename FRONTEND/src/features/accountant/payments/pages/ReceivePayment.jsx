import { RotateCcw, X } from 'lucide-react'
import { useReceivePaymentStore } from '../store/receivePaymentStore'
import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import { SecondaryButton } from '../../../../components/common/Button'
import PaymentsPageHeader from '../components/PaymentsPageHeader'
import SectionHeader from '../components/SectionHeader'
import StudentSearchCard from '../components/StudentSearchCard'
import PaymentCard from '../components/PaymentCard'
import ReceiptPreview from '../components/ReceiptPreview'
import { formatCurrency } from '../../../../utils/formatCurrency'

export default function ReceivePayment() {
  const detailStatus = useReceivePaymentStore((state) => state.detailStatus)
  const student = useReceivePaymentStore((state) => state.selectedStudent)
  const lastReceipt = useReceivePaymentStore((state) => state.lastReceipt)
  const clearStudent = useReceivePaymentStore((state) => state.clearStudent)
  const reset = useReceivePaymentStore((state) => state.reset)

  return (
    <div className="flex flex-col gap-6">
      <PaymentsPageHeader pageTitle="Receive Payment" />

      <StudentSearchCard />

      {detailStatus === 'loading' && (
        <div className="rounded-clay border border-white/50 bg-white/30 p-6 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
          <Skeleton className="h-24" />
        </div>
      )}

      {detailStatus === 'success' && student && !lastReceipt && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
              />
              <button
                type="button"
                onClick={clearStudent}
                aria-label="Clear selected student"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <SectionHeader title="Student Summary" />
              <div className="flex items-center gap-3">
                <Avatar
                  initials={student.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Class {student.className}-{student.section} · {student.registrationNumber}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400 dark:text-slate-500">Admission No.</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{student.admissionNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 dark:text-slate-500">Parent</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">{student.parentName}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
                <p className="text-xs text-amber-700 dark:text-amber-300">Outstanding Balance</p>
                <p className="mt-0.5 text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {formatCurrency(student.outstanding.totalDue)}
                </p>
                {student.outstanding.components.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5 border-t border-amber-200/60 pt-3 text-xs dark:border-amber-500/20">
                    {student.outstanding.components.map((component) => (
                      <li key={component.label} className="flex items-center justify-between text-amber-800 dark:text-amber-200">
                        <span>{component.label}</span>
                        <span className="font-medium">{formatCurrency(component.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {student.outstanding.totalDue === 0 && (
                  <Badge variant="success" className="mt-2">
                    Fully Paid
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PaymentCard />
          </div>
        </div>
      )}

      {lastReceipt && (
        <div className="mx-auto w-full max-w-xl">
          <ReceiptPreview receipt={lastReceipt} studentMeta={student ? `Class ${student.className}-${student.section}` : undefined} showSuccessBanner />
          <div className="mt-4 flex justify-center">
            <SecondaryButton fullWidth={false} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Record Another Payment
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  )
}
