import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, ClipboardX, Plus, Send } from 'lucide-react'
import { useReminderCampaignStore } from '../store/reminderCampaignStore'
import PageHeaderSimple from '../components/PageHeaderSimple'
import SummaryCard from '../components/SummaryCard'
import ConfigTable from '../components/ConfigTable'
import CampaignFormModal from '../components/CampaignFormModal'
import Badge from '../../../../components/common/Badge'
import Skeleton from '../../../../components/common/Skeleton'
import ErrorState from '../../../../components/common/ErrorState'
import { GlassButton } from '../../../../components/common/Button'
import { formatDate } from '../../../../utils/formatDate'
import { CAMPAIGN_STATUS_LABEL, CAMPAIGN_STATUS_VARIANT } from '../utils/pendingDuesUtils'

export default function ReminderManagement() {
  const status = useReminderCampaignStore((state) => state.status)
  const error = useReminderCampaignStore((state) => state.error)
  const campaigns = useReminderCampaignStore((state) => state.campaigns)
  const fetchCampaigns = useReminderCampaignStore((state) => state.fetchCampaigns)

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const summary = useMemo(() => {
    const sentCampaigns = campaigns.filter((row) => row.status === 'sent')
    const totalSent = sentCampaigns.reduce((sum, row) => sum + row.sentCount, 0)
    const scheduled = campaigns.filter((row) => row.status === 'scheduled').length
    const failed = campaigns.filter((row) => row.status === 'failed').length
    return { totalSent, scheduled, failed }
  }, [campaigns])

  const columns = [
    { key: 'audience', header: 'Audience', render: (row) => <span className="font-medium text-slate-800 dark:text-slate-100">{row.audience}</span> },
    { key: 'channel', header: 'Channel' },
    { key: 'sentCount', header: 'Sent Count', render: (row) => row.sentCount.toLocaleString('en-IN') },
    { key: 'sentDate', header: 'Date', render: (row) => formatDate(row.sentDate) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={CAMPAIGN_STATUS_VARIANT[row.status]}>{CAMPAIGN_STATUS_LABEL[row.status]}</Badge> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSimple
        title="Reminder Management"
        extraControls={
          <GlassButton icon={Plus} onClick={() => setIsModalOpen(true)}>
            Create Reminder Campaign
          </GlassButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Send} label="Total Reminders Sent" value={summary.totalSent.toLocaleString('en-IN')} status={status} />
        <SummaryCard icon={CalendarClock} label="Scheduled Campaigns" value={summary.scheduled} status={status} />
        <SummaryCard icon={ClipboardX} label="Failed Campaigns" value={summary.failed} status={status} />
      </div>

      <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Reminder Campaigns</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Institution-wide scheduled and sent reminder batches, grouped by audience.</p>
        </div>
        {status === 'error' ? (
          <ErrorState message={error} onRetry={fetchCampaigns} />
        ) : status === 'loading' || status === 'idle' ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : (
          <ConfigTable
            columns={columns}
            rows={campaigns}
            keyField="id"
            titleKey="audience"
            subtitleKey="channel"
            trailingKey="sentCount"
            emptyMessage="No reminder campaigns yet."
          />
        )}
      </div>

      {isModalOpen && <CampaignFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
