import SectionHeader from './SectionHeader'

export default function AnalyticsCard({ title, description, action, children, className }) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6 ${className ?? ''}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <SectionHeader title={title} description={description} action={action} />
      {children}
    </div>
  )
}
