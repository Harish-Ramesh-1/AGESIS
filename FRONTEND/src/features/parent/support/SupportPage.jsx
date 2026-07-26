import { Headphones } from 'lucide-react'
import EmptyState from '../../../components/common/EmptyState/EmptyState'

export default function SupportPage() {
  return (
    <EmptyState
      icon={Headphones}
      title="Support"
      description="Contact your school's support team and browse help articles here."
    />
  )
}
