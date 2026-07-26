import NotificationCard from './NotificationCard'

export default function NotificationFeed({ notifications, selectedIds = [], ...cardProps }) {
  if (notifications.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        No notifications match your filters.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          isSelected={selectedIds.includes(notification.id)}
          {...cardProps}
        />
      ))}
    </div>
  )
}
