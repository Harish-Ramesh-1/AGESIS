import { Inbox } from 'lucide-react'
import Badge from '../../../../components/common/Badge'
import EmptyState from '../../../../components/common/EmptyState'
import { formatRelativeTime } from '../../../../utils/formatDate'

const STATUS_META = {
  open: { label: 'Open', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
}

export default function TicketList({ tickets }) {
  if (tickets.length === 0) {
    return <EmptyState icon={Inbox} title="No tickets raised yet" description="Tickets you raise will show up here." />
  }

  return (
    <ul className="flex flex-col gap-2">
      {tickets.map((ticket) => {
        const meta = STATUS_META[ticket.status] ?? { label: ticket.status, variant: 'neutral' }
        return (
          <li key={ticket.id} className="rounded-xl border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{ticket.subject}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {ticket.id} &middot; {ticket.category} &middot; {formatRelativeTime(ticket.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="neutral">{ticket.priority}</Badge>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{ticket.description}</p>
          </li>
        )
      })}
    </ul>
  )
}
