import Breadcrumb from '../../../components/common/Breadcrumb'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: PARENT_ROUTES.dashboard },
          { label: 'Engagement' },
          { label: title },
        ]}
      />
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  )
}
