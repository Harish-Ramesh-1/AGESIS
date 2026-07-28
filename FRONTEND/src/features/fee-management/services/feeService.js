import { apiGet } from '../../../services/apiClient'

async function getPrimaryStudentId() {
  const { data: children } = await apiGet('/students/me/children')
  const student = children?.[0]
  if (!student) throw new Error('No student profile is linked to this account yet.')
  return student
}

function deriveComponents(components = [], totalFee, amountPaid) {
  const paidRatio = totalFee > 0 ? amountPaid / totalFee : 0
  return components.map((component, index) => {
    const amount = Number(component.amount || 0)
    const paid = Math.round(amount * paidRatio)
    const pending = amount - paid
    return {
      key: component.category?.toLowerCase().replace(/\s+/g, '-') || `component-${index}`,
      label: component.category || 'Fee Component',
      amount,
      paid,
      pending,
      status: pending <= 0 ? 'paid' : paid > 0 ? 'partial' : 'pending',
    }
  })
}

export async function fetchFeeDetails() {
  const student = await getPrimaryStudentId()

  const [{ data: assignment }, { data: dues }, { data: scholarships }, { data: discounts }, { data: lateFeeRule }] = await Promise.all([
    apiGet(`/students/${student.id}/fee-structure`),
    apiGet(`/dues?studentId=${student.id}`),
    apiGet(`/fees/students/${student.id}/scholarships`),
    apiGet(`/fees/students/${student.id}/discounts`),
    apiGet('/dues/late-fees/rules'),
  ])

  const totalFee = Number(assignment?.total_amount || 0)
  const amountPaid = (dues || []).reduce((sum, due) => sum + Number(due.amount_paid || 0), 0)
  const pendingAmount = Math.max(totalFee - amountPaid, 0)

  const upcoming = (dues || [])
    .filter((due) => due.status !== 'paid')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

  const daysRemaining = upcoming
    ? Math.ceil((new Date(upcoming.due_date).getTime() - Date.now()) / 86400000)
    : null

  return {
    totalFee,
    amountPaid,
    pendingAmount,
    progressPercent: totalFee > 0 ? Math.round((amountPaid / totalFee) * 100) : 0,
    scholarshipTotal: [...(scholarships || []), ...(discounts || [])].reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    ),
    upcomingDue: upcoming
      ? {
          amount: Number(upcoming.amount_due) - Number(upcoming.amount_paid),
          dueDate: upcoming.due_date,
          daysRemaining,
          lateFeePerDay: lateFeeRule?.fee_type === 'flat' ? Number(lateFeeRule.amount) : 0,
          lateFeeGraceDays: lateFeeRule?.grace_days ?? 7,
        }
      : null,
    components: deriveComponents(assignment?.components, totalFee, amountPaid),
    installments: (dues || []).map((due) => ({
      id: due.id,
      label: due.description || 'Installment',
      amount: Number(due.amount_due),
      dueDate: due.due_date,
      paidDate: due.status === 'paid' ? due.updated_at : undefined,
      status: due.status === 'paid' ? 'paid' : new Date(due.due_date) < new Date() ? 'pending' : 'upcoming',
    })),
    scholarships: [
      ...(scholarships || []).map((s) => ({ id: s.id, type: 'scholarship', name: s.name || 'Scholarship', appliedAmount: Number(s.amount || 0), description: '' })),
      ...(discounts || []).map((d) => ({ id: d.id, type: 'discount', name: d.label || 'Discount', appliedAmount: Number(d.amount || 0), description: d.reason || '' })),
    ],
    activities: [],
  }
}
