export default function ActionTile({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 rounded-clay border border-white/40 bg-white/40 px-3 py-4 text-center transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  )
}
