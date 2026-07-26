import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, BellRing, CreditCard, FileText, Undo2, XCircle } from 'lucide-react'
import { useDashboardNotificationStore } from '../store/notificationStore'
import Timeline from '../../../../components/common/Timeline'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'
import { formatRelativeTime } from '../../../../utils/formatDate'

const TYPE_ICON = {
  payment: CreditCard,
  refund: Undo2,
  failed: XCircle,
  invoice: FileText,
  reminder: BellRing,
  system: AlertTriangle,
}

const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'slate' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

const TYPE_ROUTE = {
  payment: ACCOUNTANT_ROUTES.paymentHistory,
  refund: ACCOUNTANT_ROUTES.refundManagement,
  failed: ACCOUNTANT_ROUTES.failedTransactions,
  invoice: ACCOUNTANT_ROUTES.generateInvoice,
  reminder: ACCOUNTANT_ROUTES.reminderManagement,
}

export default function NotificationPanel() {
  const status = useDashboardNotificationStore((state) => state.status)
  const items = useDashboardNotificationStore((state) => state.items)
  const error = useDashboardNotificationStore((state) => state.error)
  const fetchNotifications = useDashboardNotificationStore((state) => state.fetchNotifications)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title="Recent Notifications" />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load notifications. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      )}

      {status === 'success' && items.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p>
      )}

      {status === 'success' && items.length > 0 && (
        <Timeline
          items={items.map((item) => {
            const route = TYPE_ROUTE[item.type]
            return {
              id: item.id,
              icon: TYPE_ICON[item.type] ?? BellRing,
              tone: PRIORITY_TONE[item.priority] ?? 'slate',
              title: item.title,
              badge: PRIORITY_LABEL[item.priority],
              description: item.description,
              meta: formatRelativeTime(item.timestamp),
              action: route ? (
                <button
                  type="button"
                  onClick={() => navigate(route)}
                  className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
                >
                  {item.actionLabel}
                </button>
              ) : null,
            }
          })}
        />
      )}
    </div>
  )
}
