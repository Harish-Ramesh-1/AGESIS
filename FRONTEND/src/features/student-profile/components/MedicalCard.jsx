import { useState } from 'react'
import { Clock, Pencil } from 'lucide-react'
import { useStudentProfileStore } from '../../../store/studentProfileStore'
import Badge from '../../../components/common/Badge'
import GlassCard from '../../../components/common/GlassCard'
import InputField from '../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../components/common/Button'
import { formatRelativeTime } from '../../../utils/formatDate'
import InfoItem from './InfoItem'

function buildForm(medical) {
  return {
    bloodGroup: medical.bloodGroup,
    emergencyContact: medical.emergencyContact,
    doctorName: medical.doctorName,
    hospital: medical.hospital,
    allergies: medical.allergies.join(', '),
    conditions: medical.conditions.join(', '),
    notes: medical.notes ?? '',
  }
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function MedicalCard({ medical }) {
  const pendingRequest = useStudentProfileStore((state) => state.pendingRequests.medical)
  const submitMedicalChangeRequest = useStudentProfileStore((state) => state.submitMedicalChangeRequest)
  const cancelMedicalChangeRequest = useStudentProfileStore((state) => state.cancelMedicalChangeRequest)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(() => buildForm(medical))

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleEditOpen() {
    setForm(buildForm(medical))
    setIsEditing(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitMedicalChangeRequest({
      ...form,
      allergies: splitList(form.allergies),
      conditions: splitList(form.conditions),
    })
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
    <GlassCard title="Medical Information" action={editButton}>
      {pendingRequest && (
        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" aria-hidden="true" />
            <Badge variant="warning">Pending Admin Approval</Badge>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Blood Group: {pendingRequest.data.bloodGroup} · Doctor: {pendingRequest.data.doctorName}
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
            Submitted {formatRelativeTime(pendingRequest.submittedAt)}
          </p>
          <button
            type="button"
            onClick={cancelMedicalChangeRequest}
            className="self-start text-xs font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
          >
            Cancel Request
          </button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(event) => handleChange('bloodGroup', event.target.value)}
              required
            />
            <InputField
              label="Emergency Contact"
              type="tel"
              value={form.emergencyContact}
              onChange={(event) => handleChange('emergencyContact', event.target.value)}
              required
            />
            <InputField
              label="Doctor Name"
              value={form.doctorName}
              onChange={(event) => handleChange('doctorName', event.target.value)}
            />
            <InputField
              label="Hospital"
              value={form.hospital}
              onChange={(event) => handleChange('hospital', event.target.value)}
            />
          </div>
          <InputField
            label="Known Allergies (comma separated)"
            value={form.allergies}
            onChange={(event) => handleChange('allergies', event.target.value)}
            placeholder="Peanuts, Dust"
          />
          <InputField
            label="Medical Conditions (comma separated)"
            value={form.conditions}
            onChange={(event) => handleChange('conditions', event.target.value)}
            placeholder="Mild Asthma"
          />
          <InputField
            label="Notes"
            value={form.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
          />
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
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <InfoItem label="Blood Group" value={medical.bloodGroup} />
            <InfoItem label="Emergency Contact" value={medical.emergencyContact} />
            <InfoItem label="Doctor Name" value={medical.doctorName} />
            <InfoItem label="Hospital" value={medical.hospital} />
          </dl>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Known Allergies</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {medical.allergies.length > 0 ? (
                  medical.allergies.map((allergy) => (
                    <Badge key={allergy} variant="warning">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">None reported</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Medical Conditions</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {medical.conditions.length > 0 ? (
                  medical.conditions.map((condition) => (
                    <Badge key={condition} variant="danger">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">None reported</span>
                )}
              </div>
            </div>
          </div>

          {medical.notes && (
            <p className="mt-5 rounded-xl bg-amber-50/70 px-3.5 py-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {medical.notes}
            </p>
          )}
        </>
      )}
    </GlassCard>
  )
}
