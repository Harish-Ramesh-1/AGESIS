import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Send, UserPlus } from 'lucide-react'
import { useInviteUserStore } from '../store/inviteUserStore'
import { USER_ROLES } from '../services/userManagementService'
import PageHeaderSimple from '../components/PageHeaderSimple'
import UserTable from '../components/UserTable'
import Badge from '../../../../components/common/Badge'
import GlassCard from '../../../../components/common/GlassCard'
import InputField from '../../../../components/common/Input'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { PrimaryButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'

const EMPTY_FORM = { role: '', name: '', email: '', phone: '' }

const STATUS_VARIANT = { pending: 'warning', accepted: 'success', expired: 'danger' }
const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', expired: 'Expired' }

export default function InviteUser() {
  const status = useInviteUserStore((state) => state.status)
  const error = useInviteUserStore((state) => state.error)
  const invites = useInviteUserStore((state) => state.invites)
  const sendStatus = useInviteUserStore((state) => state.sendStatus)
  const sendError = useInviteUserStore((state) => state.sendError)
  const resendStatus = useInviteUserStore((state) => state.resendStatus)
  const resendingId = useInviteUserStore((state) => state.resendingId)
  const fetchInvites = useInviteUserStore((state) => state.fetchInvites)
  const sendInvite = useInviteUserStore((state) => state.sendInvite)
  const resetSendStatus = useInviteUserStore((state) => state.resetSendStatus)
  const resendInvite = useInviteUserStore((state) => state.resendInvite)

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchInvites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (sendStatus === 'success') {
      setForm(EMPTY_FORM)
      const timeout = setTimeout(() => resetSendStatus(), 4000)
      return () => clearTimeout(timeout)
    }
  }, [sendStatus, resetSendStatus])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = form.role && form.name.trim() && form.email.trim()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isFormValid) return
    await sendInvite(form)
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'sentDate', header: 'Sent Date', render: (row) => formatDate(row.sentDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          aria-label={`Resend invite to ${row.name}`}
          disabled={resendStatus === 'loading' && resendingId === row.id}
          onClick={() => resendInvite(row.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-clay transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resendStatus === 'loading' && resendingId === row.id ? 'animate-spin' : ''}`} aria-hidden="true" />
          Resend
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="Add / Invite User" />

      <div aria-live="polite" className="sr-only">
        {sendStatus === 'success' && 'Invite sent successfully.'}
        {sendStatus === 'error' && `Failed to send invite. ${sendError ?? ''}`}
        {resendStatus === 'success' && 'Invite resent successfully.'}
      </div>

      <GlassCard title="Invite a New User" description="Send a portal invitation to a parent, accountant, admin staff member or teacher.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="invite-role" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Role
              </label>
              <select
                id="invite-role"
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                required
                className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <option value="" disabled>
                  Select a role
                </option>
                {USER_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              id="invite-name"
              label="Full Name"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              required
            />
            <InputField
              id="invite-email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
            />
            <InputField
              id="invite-phone"
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
          </div>

          {sendStatus === 'success' && (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Invite sent successfully.
            </p>
          )}
          {sendStatus === 'error' && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {sendError}
            </p>
          )}

          <div>
            <PrimaryButton type="submit" fullWidth={false} disabled={!isFormValid} isLoading={sendStatus === 'loading'}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send Invite
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15"
        />
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recently Sent Invites</h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={fetchInvites} />}

        {status === 'success' && (
          <UserTable
            columns={columns}
            rows={invites}
            titleKey="name"
            subtitleKey="role"
            trailingKey="status"
            emptyIcon={UserPlus}
            emptyTitle="No invites sent yet"
            emptyMessage="Invites you send will appear here."
          />
        )}
      </div>
    </div>
  )
}
