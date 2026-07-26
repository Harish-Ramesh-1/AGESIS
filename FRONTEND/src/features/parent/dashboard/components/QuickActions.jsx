import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Download, FileText, History } from 'lucide-react'
import { PARENT_ROUTES } from '../../../../constants/routes'
import { useDashboardStore } from '../../../../store/dashboardStore'
import { downloadTextFile } from '../../../../utils/downloadTextFile'
import { formatDate } from '../../../../utils/formatDate'
import DashboardCard from './DashboardCard'
import ActionTile from './ActionTile'

export default function QuickActions() {
  const navigate = useNavigate()
  const status = useDashboardStore((state) => state.status)
  const documents = useDashboardStore((state) => state.documents)
  const fetchDashboardExtras = useDashboardStore((state) => state.fetchDashboardExtras)

  useEffect(() => {
    fetchDashboardExtras()
  }, [fetchDashboardExtras])

  function handleDownloadReceipt() {
    if (!documents) return
    const receipt = documents.latestReceipt
    downloadTextFile(
      `${receipt.id}.txt`,
      `${receipt.label}\nDocument ID: ${receipt.id}\nDate: ${formatDate(receipt.date)}\nAgesis International School`,
    )
  }

  const actions = [
    { label: 'Pay Fees', icon: CreditCard, onClick: () => navigate(PARENT_ROUTES.payFees) },
    { label: 'Download Receipt', icon: Download, onClick: handleDownloadReceipt, disabled: status !== 'success' },
    { label: 'View Invoices', icon: FileText, onClick: () => navigate(PARENT_ROUTES.invoices) },
    { label: 'Payment History', icon: History, onClick: () => navigate(PARENT_ROUTES.paymentHistory) },
  ]

  return (
    <DashboardCard title="Quick Actions">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <ActionTile key={action.label} {...action} />
        ))}
      </div>
    </DashboardCard>
  )
}
