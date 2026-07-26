export function computePaymentAmount({ paymentType, feeDetails, selectedComponentKeys }) {
  if (!feeDetails) return 0

  if (paymentType === 'full') return feeDetails.pendingAmount

  if (paymentType === 'installment') {
    const nextInstallment = feeDetails.installments.find(
      (item) => item.status === 'upcoming' || item.status === 'pending',
    )
    return nextInstallment ? nextInstallment.amount : 0
  }

  if (paymentType === 'custom') {
    return feeDetails.components
      .filter((component) => selectedComponentKeys.includes(component.key))
      .reduce((sum, component) => sum + Math.max(component.pending, 0), 0)
  }

  return 0
}

export function calculateCurrentLateFee({ dueDate, lateFeePerDay, graceDays = 0 }) {
  const today = new Date().setHours(0, 0, 0, 0)
  const due = new Date(dueDate).setHours(0, 0, 0, 0)
  const overdueDays = Math.max(0, Math.round((today - due) / 86_400_000) - graceDays)
  return overdueDays * lateFeePerDay
}

export function calculateProjectedPenalty({ lateFeePerDay, projectedOverdueDays = 30 }) {
  return lateFeePerDay * projectedOverdueDays
}
