import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton } from '../../../../components/common/Button'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SectionHeader from '../components/SectionHeader'

export default function DocumentSettings() {
  const status = useSettingsStore((state) => state.status)
  const error = useSettingsStore((state) => state.error)
  const settings = useSettingsStore((state) => state.settings)
  const isSaving = useSettingsStore((state) => state.isSaving)
  const savedAt = useSettingsStore((state) => state.savedAt)
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)
  const saveSettings = useSettingsStore((state) => state.saveSettings)

  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings && !form) setForm(settings)
  }, [settings, form])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!form) return
    await saveSettings(form)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Document Settings" />

      <div aria-live="polite" className="sr-only">
        {savedAt && 'Document settings saved.'}
      </div>

      {status === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={fetchSettings} />}

      {status === 'success' && form && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
            <SectionHeader title="Document Numbering" description="Prefix and starting number used for newly generated documents" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField label="Invoice Prefix" value={form.invoicePrefix} onChange={(event) => updateField('invoicePrefix', event.target.value)} />
              <InputField
                label="Invoice Starting Number"
                type="number"
                value={form.invoiceStartNumber}
                onChange={(event) => updateField('invoiceStartNumber', Number(event.target.value))}
              />
              <InputField label="Receipt Prefix" value={form.receiptPrefix} onChange={(event) => updateField('receiptPrefix', event.target.value)} />
              <InputField
                label="Receipt Starting Number"
                type="number"
                value={form.receiptStartNumber}
                onChange={(event) => updateField('receiptStartNumber', Number(event.target.value))}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Next invoice number will be{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {form.invoicePrefix}
                {form.invoiceStartNumber}
              </span>
              , next receipt number will be{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {form.receiptPrefix}
                {form.receiptStartNumber}
              </span>
              .
            </p>
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
            <SectionHeader title="Tax & Compliance" description="GST or tax identifiers printed on generated documents" />
            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show GST / Tax Fields on Documents</span>
              <input
                type="checkbox"
                checked={form.taxEnabled}
                onChange={(event) => updateField('taxEnabled', event.target.checked)}
                aria-label="Toggle GST / tax fields"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
              />
            </label>
            {form.taxEnabled && (
              <div className="mt-4">
                <InputField label="GST / Tax ID" value={form.taxId} onChange={(event) => updateField('taxId', event.target.value)} placeholder="e.g. 29ABCDE1234F1Z5" />
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
            <SectionHeader title="Branding & Footer" description="Controls what appears on the document header and footer" />
            <label className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show School Logo</span>
              <input
                type="checkbox"
                checked={form.showSchoolLogo}
                onChange={(event) => updateField('showSchoolLogo', event.target.checked)}
                aria-label="Toggle school logo on documents"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus-visible:outline-brand-500 dark:border-white/20"
              />
            </label>
            <div className="flex flex-col gap-1">
              <label htmlFor="footer-text" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Footer Text
              </label>
              <textarea
                id="footer-text"
                rows={3}
                value={form.footerText}
                onChange={(event) => updateField('footerText', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" fullWidth={false} isLoading={isSaving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Settings
            </PrimaryButton>
            {savedAt && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Saved successfully.</span>}
          </div>
        </form>
      )}
    </div>
  )
}
