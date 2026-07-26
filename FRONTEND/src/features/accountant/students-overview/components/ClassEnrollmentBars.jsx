export default function ClassEnrollmentBars({ data }) {
  return (
    <ul className="flex flex-col gap-3">
      {data.map((row) => (
        <li key={row.className} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">Class {row.className}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-premium dark:bg-brand-400"
              style={{ width: `${row.pct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{row.enrolled}</span>
        </li>
      ))}
    </ul>
  )
}
