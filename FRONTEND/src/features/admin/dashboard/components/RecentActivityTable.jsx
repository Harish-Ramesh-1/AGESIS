import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useRecentActivityStore } from '../store/recentActivityStore'
import DataTable from '../../../../components/common/DataTable'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import SectionHeader from './SectionHeader'
import { ADMIN_ROUTES } from '../../../../constants/routes'
import { formatDate } from '../../../../utils/formatDate'
import { SEVERITY_BADGE_VARIANT } from '../utils/dashboardUtils'

const SEVERITY_LABEL = { info: 'Info', warning: 'Warning', critical: 'Critical' }

export default function RecentActivityTable() {
  const status = useRecentActivityStore((state) => state.status)
  const activity = useRecentActivityStore((state) => state.activity)
  const error = useRecentActivityStore((state) => state.error)
  const fetchRecentActivity = useRecentActivityStore((state) => state.fetchRecentActivity)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRecentActivity()
  }, [fetchRecentActivity])

  const columns = [
    { key: 'id', header: 'Log ID' },
    { key: 'actor', header: 'Actor' },
    { key: 'action', header: 'Action' },
    { key: 'entity', header: 'Entity' },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => <Badge variant={SEVERITY_BADGE_VARIANT[row.severity]}>{SEVERITY_LABEL[row.severity]}</Badge>,
    },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  ]

  return (
    <div className="relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader
        title="Recent Activity"
        description="Latest system & audit events"
        action={
          <button
            type="button"
            onClick={() => navigate(ADMIN_ROUTES.auditLogs)}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            View All
          </button>
        }
      />

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load recent activity. {error}</p>
      )}

      {(status === 'loading' || status === 'idle') && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={activity} emptyMessage="No recent activity." />
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {activity.map((row) => (
              <details
                key={row.id}
                className="group rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{row.action}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{row.actor}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant={SEVERITY_BADGE_VARIANT[row.severity]}>{SEVERITY_LABEL[row.severity]}</Badge>
                    <ChevronDown
                      className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Entity</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{row.entity}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500">Date</p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatDate(row.date)}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
