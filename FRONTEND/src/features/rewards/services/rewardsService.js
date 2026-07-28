import { apiGet } from '../../../services/apiClient'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Simple client-side tier ladder — the backend only tracks a running points total,
// there is no "level" concept on the server, so tiers/thresholds are UI vocabulary.
const TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 500 },
  { name: 'Gold', min: 1500 },
  { name: 'Platinum', min: 3000 },
  { name: 'Diamond', min: 5000 },
]

const BENEFITS = [
  { id: 'ben1', icon: 'Headset', label: 'Priority Support', description: 'Skip the queue for support requests.' },
  { id: 'ben2', icon: 'Percent', label: 'Early Payment Discount', description: '2% off when paying a full term early.' },
  { id: 'ben3', icon: 'FileBadge', label: 'Special Certificates', description: 'Digital certificate of financial excellence.' },
  { id: 'ben4', icon: 'ShoppingBag', label: 'School Merchandise', description: 'Redeem points for branded merchandise.' },
  { id: 'ben5', icon: 'BadgeCheck', label: 'Recognition Badge', description: 'Featured on the school honor board.' },
  { id: 'ben6', icon: 'Sparkles', label: 'Future Premium Benefits', description: 'First access to upcoming perks.' },
]

const UPCOMING_REWARDS = [
  { id: 'up1', title: 'Pay next installment before due date', reward: '+150 Points', icon: 'Coins' },
  { id: 'up2', title: 'Complete One Year', reward: 'Unlock Platinum Badge', icon: 'Gem' },
]

function monthKey(dateStr) {
  const date = new Date(dateStr)
  return date.getFullYear() * 12 + date.getMonth()
}

function computeStreaks(dates) {
  const keys = [...new Set(dates.map(monthKey))].sort((a, b) => a - b)
  if (keys.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < keys.length; i++) {
    run = keys[i] === keys[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  let current = 1
  for (let i = keys.length - 1; i > 0; i--) {
    if (keys[i] === keys[i - 1] + 1) current += 1
    else break
  }

  return { current, longest }
}

function computeLevel(points) {
  let currentIndex = 0
  TIERS.forEach((tier, index) => {
    if (points >= tier.min) currentIndex = index
  })
  const current = TIERS[currentIndex]
  const next = TIERS[currentIndex + 1]
  return {
    current: current.name,
    xp: points,
    nextLevelXp: next ? next.min : Math.max(points, current.min) + 1000,
    nextLevel: next ? next.name : current.name,
    tiers: TIERS.map((tier) => tier.name),
  }
}

function badgeIcon(label = '') {
  const lower = label.toLowerCase()
  if (lower.includes('streak')) return 'Flame'
  if (lower.includes('early') || lower.includes('bird')) return 'Zap'
  if (lower.includes('gold') || lower.includes('platinum') || lower.includes('member')) return 'Gem'
  return 'Award'
}

function buildMonthlyPayments(entries) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, month: MONTH_LABELS[date.getMonth()], onTime: 0, late: 0 })
  }
  const byKey = new Map(months.map((entry) => [entry.key, entry]))
  entries.forEach((entry) => {
    if (!entry.created_at) return
    const date = new Date(entry.created_at)
    const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    // The reward ledger only records points for on-time payments — there's no
    // "late" signal on the backend, so `late` stays 0.
    if (bucket) bucket.onTime += 1
  })
  return months.map(({ month, onTime, late }) => ({ month, onTime, late }))
}

export async function fetchRewards() {
  const [{ data: rewards }, { data: me }] = await Promise.all([apiGet('/rewards'), apiGet('/auth/me')])

  const entries = rewards?.entries || []
  const points = Number(rewards?.totalPoints || 0)
  const dates = entries.map((entry) => entry.created_at)
  const { current, longest } = computeStreaks(dates)
  const level = computeLevel(points)

  const badgeLabels = [...new Set(entries.map((entry) => entry.badge).filter(Boolean))]
  const badges = badgeLabels.map((label, index) => ({
    id: `badge-${index}`,
    label,
    icon: badgeIcon(label),
    unlocked: true,
  }))

  const timeline = entries.slice(0, 8).map((entry) => ({
    id: entry.id,
    month: entry.created_at ? MONTH_LABELS[new Date(entry.created_at).getMonth()] : '',
    points: Number(entry.points || 0),
    title: entry.reason || entry.badge || 'Reward Earned',
    description: entry.reason || (entry.badge ? `Badge earned: ${entry.badge}` : ''),
  }))

  const monthlyPayments = buildMonthlyPayments(entries)
  const activeMonths = monthlyPayments.filter((month) => month.onTime > 0).length
  const consistencyScore = Math.round((activeMonths / monthlyPayments.length) * 100)

  return {
    streak: { current, longest },
    points,
    level,
    badges,
    timeline,
    benefits: BENEFITS,
    upcomingRewards: UPCOMING_REWARDS,
    analytics: { monthlyPayments, consistencyScore },
    // The backend has no cross-family leaderboard endpoint, so this only reflects
    // the signed-in parent's own standing.
    leaderboard: [{ rank: 1, name: me?.fullName || 'You', streak: current, isCurrentUser: true }],
  }
}
