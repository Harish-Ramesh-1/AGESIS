const MOCK_REWARDS_DATA = {
  streak: { current: 12, longest: 14 },
  points: 2450,
  level: {
    current: 'Gold',
    xp: 2450,
    nextLevelXp: 3000,
    nextLevel: 'Platinum',
    tiers: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
  },
  badges: [
    { id: 'b1', label: 'First Payment', icon: 'Wallet', unlocked: true },
    { id: 'b2', label: '6 Month Streak', icon: 'Flame', unlocked: true },
    { id: 'b3', label: '12 Month Streak', icon: 'Flame', unlocked: true },
    { id: 'b4', label: 'Early Bird', icon: 'Sunrise', unlocked: true },
    { id: 'b5', label: 'Gold Member', icon: 'Award', unlocked: true },
    { id: 'b6', label: 'Perfect Year', icon: 'CalendarCheck', unlocked: false, progress: 75 },
    { id: 'b7', label: 'Scholarship Champion', icon: 'GraduationCap', unlocked: false, progress: 40 },
    { id: 'b8', label: 'Platinum Member', icon: 'Gem', unlocked: false, progress: 92 },
  ],
  timeline: [
    { id: 't1', month: 'July', points: 150, title: 'Perfect Payment', description: 'Paid the full installment 5 days early.' },
    { id: 't2', month: 'June', points: 120, title: 'On-Time Payment', description: 'Paid before the due date.' },
    { id: 't3', month: 'May', points: 100, title: 'Paid Before Due Date', description: 'Settled installment ahead of schedule.' },
    { id: 't4', month: 'April', points: 100, title: 'On-Time Payment', description: 'Paid before the due date.' },
    { id: 't5', month: 'March', points: 130, title: 'Early Bird Bonus', description: 'Paid over a week before the due date.' },
    { id: 't6', month: 'February', points: 120, title: 'Perfect Payment', description: 'Paid the full installment on time.' },
  ],
  benefits: [
    { id: 'ben1', icon: 'Headset', label: 'Priority Support', description: 'Skip the queue for support requests.' },
    { id: 'ben2', icon: 'Percent', label: 'Early Payment Discount', description: '2% off when paying a full term early.' },
    { id: 'ben3', icon: 'FileBadge', label: 'Special Certificates', description: 'Digital certificate of financial excellence.' },
    { id: 'ben4', icon: 'ShoppingBag', label: 'School Merchandise', description: 'Redeem points for branded merchandise.' },
    { id: 'ben5', icon: 'BadgeCheck', label: 'Recognition Badge', description: 'Featured on the school honor board.' },
    { id: 'ben6', icon: 'Sparkles', label: 'Future Premium Benefits', description: 'First access to upcoming perks.' },
  ],
  upcomingRewards: [
    {
      id: 'up1',
      title: 'Pay next installment before due date',
      reward: '+150 Points',
      icon: 'Coins',
    },
    {
      id: 'up2',
      title: 'Complete One Year',
      reward: 'Unlock Platinum Badge',
      icon: 'Gem',
    },
  ],
  analytics: {
    monthlyPayments: [
      { month: 'Feb', onTime: 1, late: 0 },
      { month: 'Mar', onTime: 1, late: 0 },
      { month: 'Apr', onTime: 1, late: 0 },
      { month: 'May', onTime: 1, late: 0 },
      { month: 'Jun', onTime: 1, late: 0 },
      { month: 'Jul', onTime: 1, late: 0 },
    ],
    consistencyScore: 92,
  },
  leaderboard: [
    { rank: 1, name: 'Meera Iyer', streak: 18, isCurrentUser: false },
    { rank: 2, name: 'Arjun Nair', streak: 15, isCurrentUser: false },
    { rank: 3, name: 'Rajesh Mehta', streak: 12, isCurrentUser: true },
    { rank: 4, name: 'Priya Verma', streak: 11, isCurrentUser: false },
    { rank: 5, name: 'Karan Malhotra', streak: 10, isCurrentUser: false },
    { rank: 6, name: 'Sneha Kapoor', streak: 9, isCurrentUser: false },
    { rank: 7, name: 'Vikram Rao', streak: 8, isCurrentUser: false },
    { rank: 8, name: 'Anita Desai', streak: 7, isCurrentUser: false },
    { rank: 9, name: 'Rohan Gupta', streak: 6, isCurrentUser: false },
    { rank: 10, name: 'Divya Pillai', streak: 5, isCurrentUser: false },
  ],
}

const FETCH_DELAY_MS = 800

export async function fetchRewards() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_REWARDS_DATA
}
