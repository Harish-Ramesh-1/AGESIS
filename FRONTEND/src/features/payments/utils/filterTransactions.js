export function filterTransactions(transactions, filters) {
  const { search, academicYear, month, method, status, feeCategory, dateFrom, dateTo, amountMin, amountMax } = filters

  return transactions.filter((transaction) => {
    if (search) {
      const query = search.trim().toLowerCase()
      const haystack = [transaction.id, transaction.receiptNumber, transaction.invoiceNumber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (academicYear && transaction.academicYear !== academicYear) return false
    if (month && transaction.month !== month) return false
    if (method && transaction.method !== method) return false
    if (status && transaction.status !== status) return false
    if (feeCategory && transaction.feeCategory !== feeCategory) return false
    if (dateFrom && transaction.date < dateFrom) return false
    if (dateTo && transaction.date > dateTo) return false
    if (amountMin && transaction.amount < Number(amountMin)) return false
    if (amountMax && transaction.amount > Number(amountMax)) return false
    return true
  })
}

export const EMPTY_FILTERS = {
  search: '',
  academicYear: '',
  month: '',
  method: '',
  status: '',
  feeCategory: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
}
