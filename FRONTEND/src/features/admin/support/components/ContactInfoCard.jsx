import { Clock, Mail, Phone } from 'lucide-react'

export default function ContactInfoCard() {
  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
      />
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Platform Support</h2>
      <ul className="flex flex-col gap-3 text-sm">
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <a href="mailto:platform-support@agesis.io" className="text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300">
            platform-support@agesis.io
          </a>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Phone className="h-4 w-4" aria-hidden="true" />
          </span>
          <a href="tel:+911140099876" className="text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300">
            +91 11 4009 9876
          </a>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Clock className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-slate-700 dark:text-slate-200">Mon&ndash;Sat, 9:00 AM&ndash;6:00 PM IST (Priority line for Admins)</span>
        </li>
      </ul>
    </div>
  )
}
