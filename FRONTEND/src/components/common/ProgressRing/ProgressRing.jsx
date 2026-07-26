const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ProgressRing({ percent, label = 'Complete', size = 160 }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ height: size, width: size }}>
      <svg viewBox="0 0 144 144" className="h-full w-full -rotate-90">
        <circle cx="72" cy="72" r={RADIUS} fill="none" strokeWidth="12" className="stroke-slate-200/70 dark:stroke-white/10" />
        <circle
          cx="72"
          cy="72"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-brand-600 transition-[stroke-dashoffset] duration-1000 ease-premium dark:stroke-brand-400"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{clamped}%</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      </div>
    </div>
  )
}
