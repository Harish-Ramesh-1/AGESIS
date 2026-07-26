import { useNavigate } from 'react-router-dom'
import { HelpCircle, Mail, Phone, Ticket } from 'lucide-react'
import { PARENT_ROUTES } from '../../../../constants/routes'
import DashboardCard from './DashboardCard'
import ActionTile from './ActionTile'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

export default function SupportCard() {
  const navigate = useNavigate()

  const actions = [
    { label: 'Raise Ticket', icon: Ticket, onClick: () => navigate(PARENT_ROUTES.support) },
    { label: 'Call School', icon: Phone, onClick: () => navigate(PARENT_ROUTES.support) },
    { label: 'Email Support', icon: Mail, onClick: () => window.location.assign(`mailto:${SUPPORT_EMAIL}`) },
    { label: 'FAQ', icon: HelpCircle, onClick: () => navigate(PARENT_ROUTES.support) },
  ]

  return (
    <DashboardCard title="Need Help?" description="We're here for you">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <ActionTile key={action.label} {...action} />
        ))}
      </div>
    </DashboardCard>
  )
}
