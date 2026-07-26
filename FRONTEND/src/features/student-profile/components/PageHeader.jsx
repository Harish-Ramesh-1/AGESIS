import Breadcrumb from '../../../components/common/Breadcrumb'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function PageHeader({ title, academicYear, academicYearOptions, onAcademicYearChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: PARENT_ROUTES.dashboard },
            { label: 'Profile' },
            { label: title },
          ]}
        />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      </div>

      {academicYearOptions && (
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Academic Year
          <select
            value={academicYear}
            onChange={(event) => onAcademicYearChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
          >
            {academicYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
