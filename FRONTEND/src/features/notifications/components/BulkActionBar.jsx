import { Archive, CheckCheck, Trash2 } from 'lucide-react'
import { GlassButton } from '../../../components/common/Button'

export default function BulkActionBar({ selectedCount, onMarkAllRead, onDeleteSelected, onArchiveSelected }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-clay border border-white/40 bg-white/30 px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {selectedCount > 0 ? `${selectedCount} selected` : 'No notifications selected'}
      </span>
      <div className="flex flex-wrap gap-2">
        <GlassButton icon={CheckCheck} onClick={onMarkAllRead}>
          Mark All Read
        </GlassButton>
        <GlassButton icon={Archive} onClick={onArchiveSelected} disabled={selectedCount === 0}>
          Archive Selected
        </GlassButton>
        <GlassButton icon={Trash2} onClick={onDeleteSelected} disabled={selectedCount === 0}>
          Delete Selected
        </GlassButton>
      </div>
    </div>
  )
}
