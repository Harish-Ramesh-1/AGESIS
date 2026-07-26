import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchStore } from '../store/searchStore'

export default function StudentSearchBar() {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const [localValue, setLocalValue] = useState(query)

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(localValue), 300)
    return () => clearTimeout(timeout)
  }, [localValue, setQuery])

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <label htmlFor="student-search" className="sr-only">
        Search students
      </label>
      <input
        id="student-search"
        type="search"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
        placeholder="Search by student name, registration no., admission no., parent name, mobile, email, class or section"
        className="w-full rounded-clay border border-white/50 bg-white/50 py-3.5 pl-12 pr-11 text-sm text-slate-800 shadow-clay-inset backdrop-blur-xl transition-colors duration-200 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue('')}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-white/60 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
