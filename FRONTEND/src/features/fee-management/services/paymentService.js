import { IS_DEMO_PAYMENTS, PAYMENT_ENDPOINTS } from '../../../constants/api'

const PROCESSING_DELAY_MS = 1400

function randomReference(prefix) {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${random}`
}

async function submitDemoPayment({ amount, method }) {
  await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS))

  if (!method) {
    throw new Error('Select a payment method to continue.')
  }
  if (!amount || amount <= 0) {
    throw new Error('Enter a valid amount to pay.')
  }

  return {
    id: randomReference('TXN'),
    receiptNumber: randomReference('RCT'),
    invoiceNumber: randomReference('INV'),
    amount,
    method,
    date: new Date().toISOString(),
  }
}

async function submitLivePayment({ amount, method }) {
  const response = await fetch(PAYMENT_ENDPOINTS.checkout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, method }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Payment could not be processed. Please try again.')
  }

  return data
}

export function submitPayment({ amount, method }) {
  return IS_DEMO_PAYMENTS ? submitDemoPayment({ amount, method }) : submitLivePayment({ amount, method })
}
