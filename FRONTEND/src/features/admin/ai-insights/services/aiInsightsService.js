import { apiGet, apiPost } from '../../../../services/apiClient'

// The backend explicitly marks this feature `comingSoon: true` and only
// returns { headline, outstanding, collected } — there's no widget catalogue
// or teaser-insight list on the server. `upcomingWidgets` stays as static UI
// copy describing planned features (pure UI vocabulary, not data), while the
// two teaser cards are now built from the real outstanding/collected numbers
// instead of the old fully-invented "12 students" / "Tue, 10-11 AM" values.
const UPCOMING_WIDGETS = [
  {
    id: 'default-risk',
    title: 'Predictive Fee-Default Risk',
    description: 'Flags students likely to miss upcoming due dates based on historical payment behaviour.',
    icon: 'ShieldAlert',
  },
  {
    id: 'smart-timing',
    title: 'Smart Reminder Timing',
    description: 'Automatically chooses the best day and channel to send each fee reminder for maximum response.',
    icon: 'BellRing',
  },
  {
    id: 'revenue-forecasting',
    title: 'Revenue Forecasting',
    description: 'Projects term and year-end collection using enrolment trends and seasonal payment patterns.',
    icon: 'TrendingUp',
  },
  {
    id: 'anomaly-detection',
    title: 'Transaction Anomaly Detection',
    description: 'Surfaces unusual refund patterns, duplicate charges or reconciliation mismatches automatically.',
    icon: 'Radar',
  },
]

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount) || 0)
}

export async function fetchAiInsightsPreview() {
  const { data } = await apiGet('/admin/ai-insights/preview')

  const teaserInsights = [
    {
      id: 'outstanding-preview',
      label: 'Outstanding Dues (Preview)',
      value: formatCurrency(data.outstanding),
      meta: data.headline,
      icon: 'ShieldAlert',
    },
    {
      id: 'collected-preview',
      label: 'Fees Collected (Preview)',
      value: formatCurrency(data.collected),
      meta: 'Total successful collections recorded so far this term.',
      icon: 'Clock',
    },
  ]

  return {
    upcomingWidgets: UPCOMING_WIDGETS.map((widget) => ({ ...widget })),
    teaserInsights,
  }
}

export async function subscribeToAiInsights(email) {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }
  const { data } = await apiPost('/admin/ai-insights/subscribe', { email })
  return { success: true, email: data?.email ?? email }
}
