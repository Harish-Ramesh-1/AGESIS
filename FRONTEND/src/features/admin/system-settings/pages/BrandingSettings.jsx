import { useEffect, useState } from 'react'
import { Check, CheckCircle2, ImagePlus, UploadCloud } from 'lucide-react'
import clsx from 'clsx'
import { useSystemSettingsStore } from '../store/systemSettingsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'

const PRESET_COLORS = ['#4338CA', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777']

function UploadDropzone({ label, hint, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white/40 px-4 py-8 text-center transition-colors duration-200 hover:border-brand-400 dark:border-white/15 dark:bg-white/[0.02]">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Drag &amp; drop, or click to browse</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
      </div>
    </div>
  )
}

export default function BrandingSettings() {
  const status = useSystemSettingsStore((state) => state.brandingStatus)
  const error = useSystemSettingsStore((state) => state.brandingError)
  const branding = useSystemSettingsStore((state) => state.branding)
  const saveStatus = useSystemSettingsStore((state) => state.brandingSaveStatus)
  const saveError = useSystemSettingsStore((state) => state.brandingSaveError)
  const fetchBranding = useSystemSettingsStore((state) => state.fetchBranding)
  const saveBranding = useSystemSettingsStore((state) => state.saveBranding)
  const resetSaveStatus = useSystemSettingsStore((state) => state.resetBrandingSaveStatus)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchBranding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (branding && !form) setForm(branding)
  }, [branding, form])

  useEffect(() => {
    if (saveStatus === 'success') {
      const timeout = setTimeout(() => resetSaveStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [saveStatus, resetSaveStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await saveBranding(form)
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSimple title="Branding" />
        <ErrorState message={error} onRetry={fetchBranding} />
      </div>
    )
  }

  const isLoading = status === 'loading' || status === 'idle' || !form

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageHeaderSimple title="Branding" />

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'success' && 'Branding saved successfully.'}
        {saveStatus === 'error' && `Failed to save branding. ${saveError ?? ''}`}
      </div>

      <GlassCard title="Logo & Favicon" description="Used across all three portals, login screens and generated documents.">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadDropzone label="School Logo" hint="PNG or SVG, up to 2MB" icon={ImagePlus} />
            <UploadDropzone label="Favicon" hint="ICO or PNG, 32×32px recommended" icon={UploadCloud} />
          </div>
        )}
      </GlassCard>

      <GlassCard title="Primary Brand Color" description="Used for buttons, highlights and active states across the app.">
        {isLoading ? (
          <Skeleton className="h-12" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {PRESET_COLORS.map((color) => {
              const isSelected = form.primaryColor.toLowerCase() === color.toLowerCase()
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('primaryColor', color)}
                  aria-label={`Select brand color ${color}`}
                  aria-pressed={isSelected}
                  className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-full shadow-clay transition-transform duration-200 ease-premium hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                    isSelected && 'ring-2 ring-slate-900 ring-offset-2 dark:ring-white',
                  )}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                </button>
              )
            })}
            <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">{form.primaryColor.toUpperCase()}</span>
          </div>
        )}
      </GlassCard>

      <GlassCard title="Portal Taglines" description="A short line shown under the logo on each portal's login screen.">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InputField
              id="branding-tagline-parent"
              label="Parent Portal Tagline"
              value={form.taglineParent}
              onChange={(event) => handleChange('taglineParent', event.target.value)}
            />
            <InputField
              id="branding-tagline-accountant"
              label="Accountant Portal Tagline"
              value={form.taglineAccountant}
              onChange={(event) => handleChange('taglineAccountant', event.target.value)}
            />
            <InputField
              id="branding-tagline-admin"
              label="Admin Portal Tagline"
              value={form.taglineAdmin}
              onChange={(event) => handleChange('taglineAdmin', event.target.value)}
            />
          </div>
        )}
      </GlassCard>

      {saveStatus === 'success' && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Branding saved successfully.
        </p>
      )}
      {saveStatus === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {saveError}
        </p>
      )}

      <div>
        <PrimaryButton type="submit" fullWidth={false} disabled={isLoading} isLoading={saveStatus === 'loading'}>
          Save Branding
        </PrimaryButton>
      </div>
    </form>
  )
}
