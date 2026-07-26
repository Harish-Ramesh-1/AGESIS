export default function ChartTooltip({ active, payload, label, formatter, render }) {
  if (!active || !payload?.length) return null

  if (render) {
    return (
      <div className="rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-xs shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/95">
        {render({ payload, label })}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-xs shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/95">
      {label && <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey ?? entry.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}
