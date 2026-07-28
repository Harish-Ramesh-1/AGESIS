import { apiGet } from '../../../../services/apiClient'
import { useAuthStore } from '../../../../store/authStore'

const DAY_MS = 24 * 60 * 60 * 1000

function getAcademicYear(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed; academic year assumed to start in April
  return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

function formatRevenueLabel(dateStr, range) {
  const date = new Date(dateStr)
  if (range === 'year') return date.toLocaleDateString('en-US', { month: 'short' })
  if (range === 'week') return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function mapSeverity(severity) {
  if (severity === 'critical') return 'critical'
  if (severity === 'high') return 'warning'
  return 'info'
}

function derivePriority(type) {
  if (type === 'error' || type === 'warning') return 'high'
  if (type === 'due' || type === 'payment') return 'medium'
  return 'low'
}

const PORTAL_APPROVAL_LABEL = {
  parent: 'Parent Account',
  accountant: 'Accountant Account',
  admin: 'Admin Account',
}

export async function fetchSummary() {
  const [{ data: summary }, { data: studentStats }, { data: userDistribution }, { data: pendingApprovals }, { data: revenuePoints }] =
    await Promise.all([
      apiGet('/dashboard/summary'),
      apiGet('/dashboard/student-stats'),
      apiGet('/dashboard/user-distribution'),
      apiGet('/dashboard/pending-approvals'),
      apiGet('/dashboard/revenue?range=month'),
    ])

  const approvals = pendingApprovals || []
  const now = Date.now()
  const urgentCount = approvals.filter((user) => now - new Date(user.created_at).getTime() > 3 * DAY_MS).length
  const newUsersThisWeek = approvals.filter((user) => now - new Date(user.created_at).getTime() <= 7 * DAY_MS).length
  const newUsersToday = approvals.filter((user) => now - new Date(user.created_at).getTime() <= DAY_MS).length

  const staffCount = Number(userDistribution?.accountant || 0) + Number(userDistribution?.admin || 0)

  const points = revenuePoints || []
  const mid = Math.floor(points.length / 2)
  const firstHalf = points.slice(0, mid).reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const secondHalf = points.slice(mid).reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const revenueGrowthPercent = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : secondHalf > 0 ? 100 : 0

  const authUser = useAuthStore.getState().user

  return {
    hero: {
      adminName: authUser?.fullName || 'Administrator',
      role: 'System Administrator',
      academicYear: getAcademicYear(),
      newUsersThisWeek,
      newUsersToday,
      systemStatus: 'All Systems Operational',
    },
    kpis: {
      totalStudents: { count: Number(studentStats?.total) || 0, activeCount: Number(studentStats?.active) || 0 },
      totalStaff: { count: staffCount, growthPercent: 0 },
      totalRevenue: { amount: Number(summary?.totalCollected) || 0, growthPercent: revenueGrowthPercent },
      pendingDues: { amount: Number(summary?.outstanding) || 0, count: Number(summary?.dueCount) || 0 },
      pendingApprovals: { count: approvals.length, urgentCount },
      securityAlerts: { count: 0, criticalCount: 0 },
      systemUptime: { percent: 100, incidentCount: 0 },
      announcementsSent: { count: 0, reachCount: 0 },
    },
  }
}

export async function fetchPerformance() {
  const [{ data: periods }, { data: summary }, { data: pendingApprovals }] = await Promise.all([
    apiGet('/dashboard/performance'),
    apiGet('/dashboard/summary'),
    apiGet('/dashboard/pending-approvals'),
  ])

  const sorted = [...(periods || [])].sort((a, b) => (a.period > b.period ? 1 : -1))
  const current = sorted.length ? Number(sorted[sorted.length - 1].amount) || 0 : 0
  const priorPeriods = sorted.slice(0, -1)
  const target = priorPeriods.length
    ? (priorPeriods.reduce((sum, p) => sum + Number(p.amount || 0), 0) / priorPeriods.length) * 1.1
    : current * 1.1 || 1
  const collected = Math.min(current, target)
  const remaining = Math.max(target - current, 0)
  const percent = target > 0 ? Math.round((current / target) * 100) : 0

  const approvals = pendingApprovals || []
  const upcomingTasks = []
  if (approvals.length > 0) {
    upcomingTasks.push({
      id: 'pending-approvals',
      title: 'Review Pending Approvals',
      description: `${approvals.length} account${approvals.length === 1 ? '' : 's'} awaiting approval`,
      due: 'Today',
      icon: 'UserCog',
      priority: approvals.length > 5 ? 'high' : 'medium',
    })
  }
  if (Number(summary?.dueCount) > 0) {
    upcomingTasks.push({
      id: 'pending-dues',
      title: 'Follow Up on Pending Dues',
      description: `${summary.dueCount} due record${summary.dueCount === 1 ? '' : 's'} outstanding`,
      due: 'This week',
      icon: 'ClipboardPlus',
      priority: 'medium',
    })
  }

  const systemStatus = [
    { id: 'gateway', label: 'Payment Gateway', status: 'online', detail: 'Operational' },
    { id: 'database', label: 'Database', status: 'healthy', detail: 'Operational' },
    { id: 'notifications', label: 'Notification Service', status: 'running', detail: 'Operational' },
    { id: 'backup', label: 'Backup Service', status: 'connected', detail: 'Operational' },
  ]

  return { target, collected, remaining, percent, upcomingTasks, systemStatus }
}

export async function fetchRevenue(range) {
  const backendRange = range === 'today' ? 'week' : range
  const { data } = await apiGet(`/dashboard/revenue?range=${backendRange}`)
  const rows = (data || []).map((row) => ({ date: row.date, amount: Number(row.amount) || 0 }))

  let grouped = rows
  if (range === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10)
    grouped = rows.filter((row) => row.date === todayStr)
  } else if (range === 'year') {
    const byMonth = new Map()
    rows.forEach((row) => {
      const key = row.date.slice(0, 7)
      byMonth.set(key, (byMonth.get(key) || 0) + row.amount)
    })
    grouped = Array.from(byMonth.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, amount]) => ({ date: `${key}-01`, amount }))
  }

  const points = grouped.map((row, index) => {
    const prevAmount = index > 0 ? grouped[index - 1].amount : null
    const growthPercent = prevAmount ? ((row.amount - prevAmount) / prevAmount) * 100 : null
    return {
      label: formatRevenueLabel(row.date, range),
      revenue: row.amount,
      transactions: 0,
      growthPercent,
    }
  })

  return { range, points }
}

export async function fetchUserDistribution() {
  const { data } = await apiGet('/dashboard/user-distribution')
  const counts = {
    Parents: Number(data?.parent) || 0,
    Accountants: Number(data?.accountant) || 0,
    'Admin Staff': Number(data?.admin) || 0,
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0) || 1
  return Object.entries(counts).map(([role, count]) => ({
    role,
    count,
    amount: count,
    percent: Math.round((count / total) * 100),
  }))
}

export async function fetchPendingApprovals() {
  const { data } = await apiGet('/dashboard/pending-approvals')
  const now = Date.now()
  return (data || []).map((user) => ({
    id: user.id,
    name: user.full_name,
    type: PORTAL_APPROVAL_LABEL[user.portal] || 'Account Request',
    className: '—',
    requestedOn: user.created_at,
    status: now - new Date(user.created_at).getTime() > 3 * DAY_MS ? 'urgent' : 'pending',
  }))
}

export async function fetchRecentActivity() {
  const { data } = await apiGet('/dashboard/recent-activity')
  return (data || []).map((row) => ({
    id: row.id,
    actor: row.actor_name || 'System',
    action: row.action,
    entity: row.entity_type ? `${row.entity_type}${row.entity_id ? ' — ' + row.entity_id : ''}` : row.entity_id || '—',
    date: row.created_at,
    severity: mapSeverity(row.severity),
  }))
}

export async function fetchNotifications() {
  const { data } = await apiGet('/dashboard/notifications')
  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.message,
    priority: derivePriority(row.type),
    timestamp: row.created_at,
    actionLabel: 'View Details',
    unread: !row.read,
  }))
}
