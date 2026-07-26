import Breadcrumb from '../../../components/common/Breadcrumb'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function PageHeader({ title, count }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: PARENT_ROUTES.dashboard },
            { label: 'Engagement' },
            { label: title },
          ]}
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      </div>
      {typeof count === 'number' && (
        <span className="rounded-full border border-white/40 bg-white/40 px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-clay dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
          {count} Notifications
        </span>
      )}
    </div>
  )
}
