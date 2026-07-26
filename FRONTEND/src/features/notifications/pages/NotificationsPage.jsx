import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationCenterStore } from '../store/notificationCenterStore'
import PageHeader from '../components/PageHeader'
import NotificationSummary from '../components/NotificationSummary'
import FilterBar from '../components/FilterBar'
import SearchBar from '../components/SearchBar'
import PinnedSection from '../components/PinnedSection'
import NotificationFeed from '../components/NotificationFeed'
import BulkActionBar from '../components/BulkActionBar'
import PreferenceCard from '../components/PreferenceCard'
import ArchiveList from '../components/ArchiveList'
import AnalyticsCard from '../components/AnalyticsCard'
import GlassCard from '../../../components/common/GlassCard'
import Skeleton from '../../../components/common/Skeleton'
import ErrorState from '../../../components/common/ErrorState'
import { PARENT_ROUTES } from '../../../constants/routes'

export default function NotificationsPage() {
  const status = useNotificationCenterStore((state) => state.status)
  const notifications = useNotificationCenterStore((state) => state.notifications)
  const preferences = useNotificationCenterStore((state) => state.preferences)
  const fetchNotifications = useNotificationCenterStore((state) => state.fetchNotifications)
  const markAsRead = useNotificationCenterStore((state) => state.markAsRead)
  const markAllRead = useNotificationCenterStore((state) => state.markAllRead)
  const togglePin = useNotificationCenterStore((state) => state.togglePin)
  const toggleArchive = useNotificationCenterStore((state) => state.toggleArchive)
  const deleteNotification = useNotificationCenterStore((state) => state.deleteNotification)
  const archiveMany = useNotificationCenterStore((state) => state.archiveMany)
  const deleteMany = useNotificationCenterStore((state) => state.deleteMany)
  const togglePreference = useNotificationCenterStore((state) => state.togglePreference)

  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function handleAction(notification) {
    markAsRead(notification.id)
    if (notification.actionType === 'pay-now') navigate(PARENT_ROUTES.payFees)
    else if (notification.actionType === 'view-receipt') navigate(PARENT_ROUTES.paymentHistory)
    else if (notification.actionType === 'download-invoice') navigate(PARENT_ROUTES.invoices)
  }

  function handleArchiveSelected() {
    archiveMany(selectedIds)
    setSelectedIds([])
  }

  function handleDeleteSelected() {
    deleteMany(selectedIds)
    setSelectedIds([])
  }

  const activeNotifications = useMemo(() => notifications.filter((item) => !item.archived), [notifications])
  const archivedNotifications = useMemo(() => notifications.filter((item) => item.archived), [notifications])
  const pinnedNotifications = useMemo(
    () => activeNotifications.filter((item) => item.pinned),
    [activeNotifications],
  )

  const filteredNotifications = useMemo(() => {
    return activeNotifications.filter((item) => {
      if (activeFilter === 'unread' && !item.unread) return false
      if (activeFilter !== 'all' && activeFilter !== 'unread' && item.category !== activeFilter) return false
      if (searchQuery) {
        const query = searchQuery.trim().toLowerCase()
        const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [activeNotifications, activeFilter, searchQuery])

  const cardActions = {
    onToggleSelect: toggleSelect,
    onAction: handleAction,
    onMarkRead: markAsRead,
    onTogglePin: togglePin,
    onToggleArchive: toggleArchive,
    onDelete: deleteNotification,
  }

  if (status === 'error') {
    return (
      <div>
        <PageHeader title="Notifications" />
        <ErrorState message="Couldn't load notifications." onRetry={fetchNotifications} />
      </div>
    )
  }

  if (status !== 'success' || !preferences) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Notifications" count={activeNotifications.length} />

      <div className="flex flex-col gap-8">
        <section>
          <NotificationSummary notifications={notifications} />
        </section>

        <section>
          <GlassCard hover={false}>
            <div className="flex flex-col gap-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <FilterBar active={activeFilter} onChange={setActiveFilter} />
            </div>
          </GlassCard>
        </section>

        <PinnedSection notifications={pinnedNotifications} selectedIds={selectedIds} {...cardActions} />

        <section>
          <BulkActionBar
            selectedCount={selectedIds.length}
            onMarkAllRead={markAllRead}
            onDeleteSelected={handleDeleteSelected}
            onArchiveSelected={handleArchiveSelected}
          />
        </section>

        <section>
          <NotificationFeed notifications={filteredNotifications} selectedIds={selectedIds} {...cardActions} />
        </section>

        <PreferenceCard preferences={preferences} onToggle={togglePreference} />

        <ArchiveList notifications={archivedNotifications} onRestore={toggleArchive} onDelete={deleteNotification} />

        <section>
          <GlassCard title="Notification Analytics" hover={false}>
            <AnalyticsCard notifications={notifications} />
          </GlassCard>
        </section>
      </div>
    </div>
  )
}
