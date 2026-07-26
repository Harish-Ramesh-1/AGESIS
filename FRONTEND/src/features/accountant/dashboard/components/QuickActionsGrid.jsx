import { useNavigate } from 'react-router-dom'
import {
  BadgeDollarSign,
  ChartColumn,
  CircleDollarSign,
  Download,
  FilePlus2,
  GraduationCap,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'
import SectionHeader from './SectionHeader'

const ACTIONS = [
  { label: 'Receive Payment', description: 'Record a new fee payment', icon: WalletCards, path: ACCOUNTANT_ROUTES.receivePayment },
  { label: 'Assign Fees', description: 'Assign fee structures to students', icon: BadgeDollarSign, path: ACCOUNTANT_ROUTES.assignFees },
  { label: 'Generate Invoice', description: 'Create a new invoice', icon: FilePlus2, path: ACCOUNTANT_ROUTES.generateInvoice },
  { label: 'Generate Receipt', description: 'Issue a payment receipt', icon: ReceiptText, path: ACCOUNTANT_ROUTES.generateReceipt },
  { label: 'View Student', description: 'Search and view student records', icon: GraduationCap, path: ACCOUNTANT_ROUTES.students },
  { label: 'Pending Dues', description: 'Review outstanding balances', icon: CircleDollarSign, path: ACCOUNTANT_ROUTES.dueList },
  { label: 'Financial Reports', description: 'Analyze collections and revenue', icon: ChartColumn, path: ACCOUNTANT_ROUTES.dailyCollection },
  { label: 'Export Collections', description: 'Download collection reports', icon: Download, path: ACCOUNTANT_ROUTES.exportReports },
]

export default function QuickActionsGrid() {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Quick Actions" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.path)}
            className="flex flex-col items-start gap-3 rounded-clay border border-white/40 bg-white/40 p-4 text-left transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/60 hover:shadow-clay-active dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
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
