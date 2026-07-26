import { useState } from 'react'
import { Clock, Pencil } from 'lucide-react'
import { useStudentProfileStore } from '../../../store/studentProfileStore'
import GlassCard from '../../../components/common/GlassCard'
import Badge from '../../../components/common/Badge'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatRelativeTime } from '../../../utils/formatDate'
import InfoItem from './InfoItem'

function AddressBlock({ title, address }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{address.line}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <InfoItem label="City" value={address.city} />
        <InfoItem label="State" value={address.state} />
        <InfoItem label="Postal Code" value={address.postalCode} />
        <InfoItem label="Country" value={address.country} />
      </dl>
    </div>
  )
}

function buildForm(address) {
  return {
    line: address.permanent.line,
    city: address.permanent.city,
    state: address.permanent.state,
    postalCode: address.permanent.postalCode,
    country: address.permanent.country,
  }
}

export default function AddressCard({ address }) {
  const pendingRequest = useStudentProfileStore((state) => state.pendingRequests.address)
  const submitAddressChangeRequest = useStudentProfileStore((state) => state.submitAddressChangeRequest)
  const cancelAddressChangeRequest = useStudentProfileStore((state) => state.cancelAddressChangeRequest)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(() => buildForm(address))

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleEditOpen() {
    setForm(buildForm(address))
    setIsEditing(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitAddressChangeRequest(form)
    setIsEditing(false)
  }

  const editButton = !pendingRequest && !isEditing && (
    <button
      type="button"
      onClick={handleEditOpen}
      className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/40 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]"
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      Edit
    </button>
  )

  return (
    <GlassCard title="Address Information" action={editButton}>
      <div className="flex flex-col gap-6">
        {pendingRequest && (
          <div className="flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
              <Badge variant="warning">Pending Admin Approval</Badge>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {pendingRequest.data.line}, {pendingRequest.data.city}, {pendingRequest.data.state}{' '}
              {pendingRequest.data.postalCode}, {pendingRequest.data.country}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
              Submitted {formatRelativeTime(pendingRequest.submittedAt)}
            </p>
            <button
              type="button"
              onClick={cancelAddressChangeRequest}
              className="self-start text-xs font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
            >
              Cancel Request
            </button>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Address Line"
              value={form.line}
              onChange={(event) => handleChange('line', event.target.value)}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="City"
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                required
              />
              <InputField
                label="State"
                value={form.state}
                onChange={(event) => handleChange('state', event.target.value)}
                required
              />
              <InputField
                label="Postal Code"
                value={form.postalCode}
                onChange={(event) => handleChange('postalCode', event.target.value)}
                required
              />
              <InputField
                label="Country"
                value={form.country}
                onChange={(event) => handleChange('country', event.target.value)}
                required
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changes will be sent to the school admin for approval before they take effect.
            </p>
            <div className="flex gap-3">
              <SecondaryButton type="button" fullWidth={false} onClick={() => setIsEditing(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" fullWidth={false}>
                Submit for Approval
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <>
            <AddressBlock title="Permanent Address" address={address.permanent} />
            {!address.sameAsPermanent && <AddressBlock title="Current Address" address={address.current} />}
            {address.sameAsPermanent && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Current address is the same as permanent address.
              </p>
            )}
          </>
        )}
      </div>
    </GlassCard>
  )
}
