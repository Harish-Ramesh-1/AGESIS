import { useNavigate } from 'react-router-dom'
import {
  ChartColumn,
  DatabaseBackup,
  Megaphone,
  NotebookTabs,
  ShieldCheck,
  Sliders,
  UserCog,
  UserPlus,
} from 'lucide-react'
import { ADMIN_ROUTES } from '../../../../constants/routes'
import SectionHeader from './SectionHeader'

const ACTIONS = [
  { label: 'Add / Invite User', description: 'Create a parent, accountant or staff account', icon: UserPlus, path: ADMIN_ROUTES.usersInvite },
  { label: 'Create Announcement', description: 'Broadcast a message to the school', icon: Megaphone, path: ADMIN_ROUTES.announcements },
  { label: 'Fee Structure', description: 'Configure school-wide fee heads', icon: NotebookTabs, path: ADMIN_ROUTES.feeStructure },
  { label: 'Financial Reports', description: 'Review collections and revenue', icon: ChartColumn, path: ADMIN_ROUTES.reportsDailyCollection },
  { label: 'Roles & Permissions', description: 'Manage role-based access', icon: UserCog, path: ADMIN_ROUTES.rolesList },
  { label: 'Security Center', description: 'Review sessions and alerts', icon: ShieldCheck, path: ADMIN_ROUTES.securityAlerts },
  { label: 'Backup Now', description: 'Trigger a manual system backup', icon: DatabaseBackup, path: ADMIN_ROUTES.backupSchedule },
  { label: 'System Settings', description: 'Configure platform-wide settings', icon: Sliders, path: ADMIN_ROUTES.settingsGeneral },
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
