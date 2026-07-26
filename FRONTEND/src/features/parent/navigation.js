import { PARENT_ROUTES } from '../../constants/routes'

export const PARENT_NAV_SECTIONS = [
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: PARENT_ROUTES.dashboard,
  },
  {
    type: 'group',
    id: 'fee-management',
    label: 'Fee Management',
    icon: 'Wallet',
    children: [
      { id: 'fee-details', label: 'Fee Details', icon: 'Wallet', path: PARENT_ROUTES.feeDetails },
      { id: 'pay-fees', label: 'Pay Fees', icon: 'CreditCard', path: PARENT_ROUTES.payFees },
      { id: 'pending-dues', label: 'Pending Dues', icon: 'CircleDollarSign', path: PARENT_ROUTES.pendingDues },
    ],
  },
  {
    type: 'group',
    id: 'payments',
    label: 'Payments',
    icon: 'Receipt',
    children: [
      { id: 'payment-history', label: 'Payment History', icon: 'Receipt', path: PARENT_ROUTES.paymentHistory },
      { id: 'invoices', label: 'Invoices & Receipts', icon: 'FileText', path: PARENT_ROUTES.invoices },
    ],
  },
  {
    type: 'group',
    id: 'engagement',
    label: 'Engagement',
    icon: 'Award',
    children: [
      { id: 'rewards', label: 'Rewards & Streaks', icon: 'Award', path: PARENT_ROUTES.rewards },
      { id: 'notifications', label: 'Notifications', icon: 'Bell', path: PARENT_ROUTES.notifications },
    ],
  },
  {
    type: 'group',
    id: 'profile',
    label: 'Profile',
    icon: 'UserRound',
    children: [
      { id: 'student-profile', label: 'Student Profile', icon: 'UserRound', path: PARENT_ROUTES.studentProfile },
      { id: 'settings', label: 'Settings', icon: 'Settings', path: PARENT_ROUTES.settings },
    ],
  },
  {
    type: 'link',
    id: 'support',
    label: 'Support',
    icon: 'Headphones',
    path: PARENT_ROUTES.support,
  },
]

export function getPageTitle(pathname) {
  for (const section of PARENT_NAV_SECTIONS) {
    if (section.type === 'link' && pathname.startsWith(section.path)) return section.label
    if (section.type === 'group') {
      const child = section.children.find((item) => pathname.startsWith(item.path))
      if (child) return child.label
    }
  }
  return 'Dashboard'
}
