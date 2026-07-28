import { apiGet, apiPost } from '../../../services/apiClient'

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

async function getPaymentContext() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) throw new Error('No student profile is linked to this account yet.')

  const { data: dues } = await apiGet(`/dues?studentId=${student.id}`)
  const openDue = (dues || []).find((due) => due.status !== 'paid')
  return { studentId: student.id, dueId: openDue?.id }
}

function openRazorpayCheckout({ orderId, keyId, amount, currency, student }) {
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount: Math.round(amount * 100),
      currency,
      name: 'AGESIS School',
      description: 'Fee Payment',
      prefill: { name: student?.fullName },
      theme: { color: '#4f46e5' },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
    })
    razorpay.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed.')))
    razorpay.open()
  })
}

export async function submitPayment({ amount, method }) {
  if (!method) throw new Error('Select a payment method to continue.')
  if (!amount || amount <= 0) throw new Error('Enter a valid amount to pay.')

  const { studentId, dueId } = await getPaymentContext()
  const { data: checkout } = await apiPost('/payments/checkout', { studentId, dueId, amount, method })

  let verifyPayload = { paymentId: checkout.paymentId }

  if (!checkout.isDemo) {
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) throw new Error('Could not load the payment gateway. Please try again.')
    const result = await openRazorpayCheckout({
      orderId: checkout.orderId,
      keyId: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
    })
    verifyPayload = {
      paymentId: checkout.paymentId,
      razorpayOrderId: result.razorpay_order_id,
      razorpayPaymentId: result.razorpay_payment_id,
      razorpaySignature: result.razorpay_signature,
    }
  }

  const { data: payment } = await apiPost('/payments/verify', verifyPayload)
  const { data: receipt } = await apiPost('/documents/receipts', { paymentId: payment.id }).catch(() => ({ data: null }))

  return {
    id: payment.id,
    receiptNumber: receipt?.receipt_no || payment.reference_no,
    invoiceNumber: payment.reference_no,
    amount: Number(payment.amount),
    method: payment.method,
    date: payment.paid_at,
  }
}
