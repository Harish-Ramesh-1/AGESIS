import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import Avatar from '../../../components/common/Avatar'
import SectionHeader from './SectionHeader'
import SearchBar from './SearchBar'

export default function StudentSearchCard({ title, description, searchStatus, searchResults, onSearch, onSelect }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title={title} description={description} />

      <SearchBar
        id="document-student-search"
        value={query}
        onChange={setQuery}
        placeholder="Search by student name, registration no., admission no., parent name or mobile"
      />

      {query && (
        <div className="mt-3">
          {searchStatus === 'loading' && <p className="px-1 text-xs text-slate-400 dark:text-slate-500">Searching…</p>}
          {searchStatus === 'success' && searchResults.length === 0 && <p className="px-1 text-xs text-slate-400 dark:text-slate-500">No students found.</p>}
          {searchStatus === 'success' && searchResults.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {searchResults.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(student)
                      setQuery('')
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/40 bg-white/40 px-3.5 py-2.5 text-left transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
                  >
                    <Avatar initials={student.avatarInitials} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {student.registrationNumber} · Class {student.className}-{student.section}
                      </p>
                    </div>
                    <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
