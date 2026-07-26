import { Laptop, LogOut, MonitorSmartphone, Smartphone, Tablet } from 'lucide-react'
import { formatRelativeTime } from '../../../../utils/formatDate'
import Badge from '../../../../components/common/Badge'

const DEVICE_ICONS = {
  'MacBook Pro': Laptop,
  'Windows PC': MonitorSmartphone,
  'iPhone 14': Smartphone,
  'iPad Air': Tablet,
}

export default function ActiveSessionsList({ sessions, onSignOut, isBusy }) {
  if (!sessions.length) {
    return <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No active sessions found.</p>
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {sessions.map((session) => {
        const Icon = DEVICE_ICONS[session.device] ?? MonitorSmartphone
        return (
          <li
            key={session.id}
            className="flex flex-col gap-3 rounded-xl border border-white/40 bg-white/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {session.device}
                  {session.current && <Badge variant="info">Current session</Badge>}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {session.browser} &middot; {session.location} &middot; Active {formatRelativeTime(session.lastActive)}
                </p>
              </div>
            </div>
            {!session.current && (
              <button
                type="button"
                onClick={() => onSignOut(session.id)}
                disabled={isBusy}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-white/50 bg-white/50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 sm:self-center"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
