import Breadcrumb from '../../../../components/common/Breadcrumb'
import { ACCOUNTANT_ROUTES } from '../../../../constants/routes'

export default function PageHeaderSimple({ title, extraControls }) {
  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', to: ACCOUNTANT_ROUTES.dashboard }, { label: title }]} />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <div className="flex flex-wrap items-center gap-3">{extraControls}</div>
      </div>
    </div>
  )
}
