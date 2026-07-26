import { Globe, Headset, Shield } from 'lucide-react'
import { GlassButton } from '../../../components/common/Button'
import agesisLogo from '../../../assets/logos/agesis-logo.svg'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL
const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL

export default function LoginCard({ title, subtitle, children }) {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
      />
      <div className="mb-4 flex flex-col items-center text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/60 p-2 shadow-clay-button backdrop-blur-md dark:border-white/10 dark:bg-white/10">
          <img src={agesisLogo} alt="Agesis International School logo" className="h-full w-full" />
        </span>
        <p className="mt-2 text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Agesis International School
        </p>
        <span className="mt-1 inline-flex items-center rounded-full bg-brand-50/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          Fee Management Portal
        </span>
        <h1 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      {children}

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
        <GlassButton
          icon={Headset}
          aria-label="Contact support"
          onClick={() => window.location.assign(`mailto:${SUPPORT_EMAIL}`)}
        >
          Support
        </GlassButton>
        <GlassButton icon={Shield} aria-label="View privacy policy">
          Privacy
        </GlassButton>
        <GlassButton
          icon={Globe}
          aria-label="Visit public site"
          onClick={() => window.open(PUBLIC_SITE_URL, '_blank', 'noopener,noreferrer')}
        >
          Public Site
        </GlassButton>
      </div>
    </div>
  )
}
