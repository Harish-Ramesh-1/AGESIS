const MOCK_ANALYTICS = {
  monthlyTrend: [
    { month: 'Feb', paid: 5000 },
    { month: 'Mar', paid: 0 },
    { month: 'Apr', paid: 15000 },
    { month: 'May', paid: 0 },
    { month: 'Jun', paid: 25000 },
    { month: 'Jul', paid: 0 },
  ],
  methodDistribution: [
    { method: 'UPI', amount: 60000 },
    { method: 'Credit Card', amount: 42500 },
    { method: 'Net Banking', amount: 7000 },
    { method: 'Wallet', amount: 3500 },
    { method: 'Cash', amount: 6000 },
  ],
  annualSummary: {
    totalPaid: 108000,
    averagePayment: 15428,
    paymentFrequency: 'Every 6 weeks',
  },
}

const FETCH_DELAY_MS = 750

export async function fetchAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS))
  return MOCK_ANALYTICS
}
