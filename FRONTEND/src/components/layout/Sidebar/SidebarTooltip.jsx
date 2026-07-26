export default function SidebarTooltip({ children }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/50 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-700 opacity-0 shadow-glass backdrop-blur-xl transition-opacity duration-200 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-800/95 dark:text-slate-200"
    >
      {children}
    </span>
  )
}
