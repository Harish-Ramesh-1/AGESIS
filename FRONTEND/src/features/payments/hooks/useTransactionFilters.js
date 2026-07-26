import { useMemo, useState } from 'react'
import { EMPTY_FILTERS, filterTransactions } from '../utils/filterTransactions'

export default function useTransactionFilters(transactions) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
  }

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  )

  const isFiltered = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key])

  return { filters, setFilter, resetFilters, filteredTransactions, isFiltered }
}
