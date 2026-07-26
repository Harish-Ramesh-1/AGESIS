import { useFeeStore } from '../../../store/feeStore'
import { usePaymentStore } from '../../../store/paymentStore'
import { calculateCurrentLateFee, computePaymentAmount } from '../utils/feeCalculations'

export default function usePaymentSummary() {
  const feeDetails = useFeeStore((state) => state.details)
  const paymentType = usePaymentStore((state) => state.paymentType)
  const selectedComponentKeys = usePaymentStore((state) => state.selectedComponentKeys)

  if (!feeDetails) {
    return { subtotal: 0, discount: 0, lateFee: 0, finalAmount: 0 }
  }

  const subtotal = computePaymentAmount({ paymentType, feeDetails, selectedComponentKeys })
  const discount = 0
  const lateFee = calculateCurrentLateFee(feeDetails.upcomingDue)
  const finalAmount = Math.max(0, subtotal - discount + lateFee)

  return { subtotal, discount, lateFee, finalAmount }
}
