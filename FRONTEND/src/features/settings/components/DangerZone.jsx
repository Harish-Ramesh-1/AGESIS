import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { SecondaryButton } from '../../../components/common/Button'

export default function DangerZone() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="rounded-clay border border-red-200/70 bg-red-50/50 p-6 dark:border-red-500/20 dark:bg-red-500/[0.06]">
      <h2 className="text-base font-semibold text-red-700 dark:text-red-300">Danger Zone</h2>
      <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/80">
        Actions that affect your account access.
      </p>

      <div className="mt-4">
        <SecondaryButton fullWidth={false} onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </SecondaryButton>
      </div>
    </div>
  )
}
