import { useEffect, useState } from 'react'
import { ChevronDown, KeyRound, Plus, Trash2, Webhook } from 'lucide-react'
import { useIntegrationsStore } from '../store/integrationsStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import GlassCard from '../../../../components/common/GlassCard'
import Badge from '../../../../components/common/Badge'
import DataTable from '../../../../components/common/DataTable'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import EmptyState from '../../../../components/common/EmptyState'
import InputField from '../../../../components/common/Input'
import { PrimaryButton, SecondaryButton } from '../../../../components/common/Button'
import { formatDate, formatRelativeTime } from '../../../../utils/formatDate'

export default function ApiWebhooks() {
  const apiKeysStatus = useIntegrationsStore((state) => state.apiKeysStatus)
  const apiKeysError = useIntegrationsStore((state) => state.apiKeysError)
  const apiKeys = useIntegrationsStore((state) => state.apiKeys)
  const apiKeyActionStatus = useIntegrationsStore((state) => state.apiKeyActionStatus)
  const webhooksStatus = useIntegrationsStore((state) => state.webhooksStatus)
  const webhooks = useIntegrationsStore((state) => state.webhooks)
  const fetchApiWebhooks = useIntegrationsStore((state) => state.fetchApiWebhooks)
  const createApiKey = useIntegrationsStore((state) => state.createApiKey)
  const removeApiKey = useIntegrationsStore((state) => state.removeApiKey)

  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [expandedWebhookId, setExpandedWebhookId] = useState(null)

  useEffect(() => {
    fetchApiWebhooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerateKey(event) {
    event.preventDefault()
    await createApiKey(newKeyLabel)
    setNewKeyLabel('')
    setShowNewKeyForm(false)
  }

  const apiKeyColumns = [
    { key: 'label', header: 'Label' },
    { key: 'maskedKey', header: 'Key', render: (row) => <span className="font-mono text-xs">{row.maskedKey}</span> },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'lastUsedAt', header: 'Last Used', render: (row) => (row.lastUsedAt ? formatRelativeTime(row.lastUsedAt) : 'Never') },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => removeApiKey(row.id)}
          disabled={apiKeyActionStatus === 'loading'}
          aria-label={`Revoke API key ${row.label}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Revoke
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple title="API & Webhooks" />

      <div aria-live="polite" className="sr-only">
        {apiKeyActionStatus === 'success' && 'API key list updated.'}
      </div>

      <GlassCard
        title="API Keys"
        description="Keys used by external systems and integrations to access the AGESIS API."
        action={
          <SecondaryButton fullWidth={false} onClick={() => setShowNewKeyForm((prev) => !prev)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Generate New Key
          </SecondaryButton>
        }
      >
        {showNewKeyForm && (
          <form onSubmit={handleGenerateKey} className="mb-4 flex flex-col gap-3 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-end">
            <div className="flex-1">
              <InputField
                id="new-api-key-label"
                label="Key Label"
                placeholder="e.g. Finance Reporting Tool"
                value={newKeyLabel}
                onChange={(event) => setNewKeyLabel(event.target.value)}
                icon={KeyRound}
              />
            </div>
            <PrimaryButton type="submit" fullWidth={false} isLoading={apiKeyActionStatus === 'loading'}>
              Create Key
            </PrimaryButton>
          </form>
        )}

        {apiKeysStatus === 'loading' || apiKeysStatus === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : apiKeysStatus === 'error' ? (
          <ErrorState message={apiKeysError} onRetry={fetchApiWebhooks} />
        ) : apiKeys.length === 0 ? (
          <EmptyState icon={KeyRound} title="No API keys yet" description="Generate a key to allow external systems to access the AGESIS API." />
        ) : (
          <DataTable columns={apiKeyColumns} rows={apiKeys} />
        )}
      </GlassCard>

      <GlassCard title="Webhook Endpoints" description="Registered endpoints notified when key events occur in the system.">
        {webhooksStatus === 'loading' || webhooksStatus === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState icon={Webhook} title="No webhooks configured" description="Register an endpoint to start receiving event notifications." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-white/10">
            {webhooks.map((webhook) => {
              const isExpanded = expandedWebhookId === webhook.id
              return (
                <li key={webhook.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedWebhookId(isExpanded ? null : webhook.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{webhook.url}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Event: {webhook.eventType}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={webhook.status === 'active' ? 'success' : 'danger'}>
                        {webhook.status === 'active' ? 'Active' : 'Failing'}
                      </Badge>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ease-premium ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-white/40 bg-white/40 p-3 text-xs dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-2">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Last Delivery Attempt</p>
                        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{formatRelativeTime(webhook.lastDeliveryAt)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Last Delivery Status</p>
                        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{webhook.lastDeliveryStatus}</p>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
