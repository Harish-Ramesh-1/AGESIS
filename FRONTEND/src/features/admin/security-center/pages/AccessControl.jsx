import { useEffect, useState } from 'react'
import { Globe, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useAccessControlStore } from '../store/accessControlStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import ToggleSwitch from '../components/ToggleSwitch'
import SecurityTable from '../components/SecurityTable'
import GlassCard from '../../../../components/common/GlassCard'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

const EMPTY_FORM = { ipOrCidr: '', label: '' }

export default function AccessControl() {
  const status = useAccessControlStore((state) => state.status)
  const error = useAccessControlStore((state) => state.error)
  const allowlist = useAccessControlStore((state) => state.allowlist)
  const deviceTrust = useAccessControlStore((state) => state.deviceTrust)
  const addStatus = useAccessControlStore((state) => state.addStatus)
  const addError = useAccessControlStore((state) => state.addError)
  const removeStatus = useAccessControlStore((state) => state.removeStatus)
  const removingId = useAccessControlStore((state) => state.removingId)
  const toggleStatus = useAccessControlStore((state) => state.toggleStatus)
  const fetchAccessControl = useAccessControlStore((state) => state.fetchAccessControl)
  const addIp = useAccessControlStore((state) => state.addIp)
  const resetAddStatus = useAccessControlStore((state) => state.resetAddStatus)
  const removeIp = useAccessControlStore((state) => state.removeIp)
  const toggleDeviceTrust = useAccessControlStore((state) => state.toggleDeviceTrust)

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchAccessControl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (addStatus === 'success') {
      setForm(EMPTY_FORM)
      const timeout = setTimeout(() => resetAddStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [addStatus, resetAddStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = form.ipOrCidr.trim() && form.label.trim()

  async function handleAdd(event) {
    event.preventDefault()
    if (!isFormValid) return
    await addIp(form)
  }

  const columns = [
    { key: 'ipOrCidr', header: 'IP / CIDR' },
    { key: 'label', header: 'Label' },
    { key: 'addedBy', header: 'Added By' },
    { key: 'date', header: 'Date Added', render: (row) => formatDate(row.date) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          aria-label={`Remove ${row.ipOrCidr} from allow list`}
          disabled={removeStatus === 'loading' && removingId === row.id}
          onClick={() => removeIp(row.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Access Control" />

      <div aria-live="polite" className="sr-only">
        {addStatus === 'success' && 'IP address added to the allow list.'}
        {removeStatus === 'success' && 'IP address removed from the allow list.'}
        {toggleStatus === 'success' && 'Device verification setting updated.'}
      </div>

      <GlassCard title="IP Allow List" description="Only requests originating from these IP addresses or ranges are trusted as known office networks.">
        <form onSubmit={handleAdd} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1.5fr_auto] sm:items-end">
          <InputField
            id="access-control-ip"
            label="IP Address / CIDR"
            placeholder="e.g. 103.21.244.0/24"
            value={form.ipOrCidr}
            onChange={(event) => handleChange('ipOrCidr', event.target.value)}
            required
          />
          <InputField
            id="access-control-label"
            label="Label"
            placeholder="e.g. Head Office"
            value={form.label}
            onChange={(event) => handleChange('label', event.target.value)}
            required
          />
          <PrimaryButton type="submit" fullWidth={false} disabled={!isFormValid} isLoading={addStatus === 'loading'}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add IP
          </PrimaryButton>
        </form>

        {addStatus === 'error' && (
          <p role="alert" className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
            {addError}
          </p>
        )}

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchAccessControl} />}

        {status === 'success' && (
          <SecurityTable
            columns={columns}
            rows={allowlist}
            titleKey="ipOrCidr"
            subtitleKey="label"
            trailingKey="date"
            emptyIcon={Globe}
            emptyTitle="No trusted IPs yet"
            emptyMessage="Add an IP address or CIDR range to trust it."
          />
        )}
      </GlassCard>

      <GlassCard title="Device Trust" description="Additional verification for logins from devices the portal hasn't seen before.">
        {status === 'loading' || !deviceTrust ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50/80 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Require Device Verification for New Logins</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Prompt for an email or SMS confirmation code the first time a user signs in from an unrecognized device.
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={deviceTrust.requireDeviceVerification}
              onChange={(next) => toggleDeviceTrust(next)}
              disabled={toggleStatus === 'loading'}
              label="Toggle require device verification for new logins"
            />
          </div>
        )}
      </GlassCard>
    </div>
  )
}
