import clsx from 'clsx'

export default function SidebarHeader({ logoSrc, schoolName, schoolTagline, isCollapsed }) {
  return (
    <div className="shrink-0">
      <div
        className={clsx(
          'flex items-center gap-3 px-5 py-5',
          isCollapsed && 'flex-col justify-center gap-2 px-2',
        )}
      >
        <img
          src={logoSrc}
          alt={`${schoolName} logo`}
          className="h-9 w-9 shrink-0 rounded-xl border border-white/50 bg-white/60 p-1.5 shadow-clay-button dark:border-white/10 dark:bg-white/10"
        />
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {schoolName}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{schoolTagline}</p>
          </div>
        )}
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent dark:via-white/10" />
    </div>
  )
}
