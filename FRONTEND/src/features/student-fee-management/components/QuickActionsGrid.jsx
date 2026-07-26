import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Download, FilePlus2, Printer, ReceiptText, WalletCards } from 'lucide-react'
import { useStudentDirectoryStore } from '../store/studentDirectoryStore'
import SectionHeader from './SectionHeader'
import { ACCOUNTANT_ROUTES } from '../../../constants/routes'
import { downloadTextFile } from '../../../utils/downloadTextFile'
import { formatCurrency } from '../../../utils/formatCurrency'
import { FEE_STATUS_LABEL } from '../utils/feeManagementUtils'

export default function QuickActionsGrid() {
  const student = useStudentDirectoryStore((state) => state.selectedStudent)
  const navigate = useNavigate()
  const [reminderSent, setReminderSent] = useState(false)

  if (!student) return null

  function handleSendReminder() {
    setReminderSent(true)
  }

  function handleExportProfile() {
    downloadTextFile(
      `${student.registrationNumber}-profile.txt`,
      [
        `Student Financial Profile`,
        `Name: ${student.name}`,
        `Admission No.: ${student.admissionNumber}`,
        `Registration No.: ${student.registrationNumber}`,
        `Class: ${student.className}-${student.section}`,
        `Academic Year: ${student.academicYear}`,
        `Parent: ${student.parentName} (${student.parentPhone}, ${student.parentEmail})`,
        `Fee Status: ${FEE_STATUS_LABEL[student.status]}`,
        `Outstanding Balance: ${formatCurrency(student.outstandingAmount)}`,
      ].join('\n'),
    )
  }

  const actions = [
    { label: 'Receive Payment', description: 'Record a payment for this student', icon: WalletCards, onClick: () => navigate(ACCOUNTANT_ROUTES.receivePayment) },
    { label: 'Generate Invoice', description: 'Create a new invoice', icon: FilePlus2, onClick: () => navigate(ACCOUNTANT_ROUTES.generateInvoice) },
    { label: 'Generate Receipt', description: 'Issue a payment receipt', icon: ReceiptText, onClick: () => navigate(ACCOUNTANT_ROUTES.generateReceipt) },
    { label: reminderSent ? 'Reminder Sent' : 'Send Reminder', description: 'Notify the parent of dues', icon: BellRing, onClick: handleSendReminder, disabled: reminderSent },
    { label: 'Print Statement', description: 'Print the fee statement', icon: Printer, onClick: () => window.print() },
    { label: 'Export Profile', description: 'Download this student’s profile', icon: Download, onClick: handleExportProfile },
  ]

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Quick Actions" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex flex-col items-start gap-3 rounded-clay border border-white/40 bg-white/40 p-4 text-left transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/60 hover:shadow-clay-active disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.label}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
