import { useEffect, useRef, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { fetchStudentsForDocument } from '../services/documentsService'
import useClickOutside from '../../../hooks/useClickOutside'
import Avatar from '../../../components/common/Avatar'
import InputField from '../../../components/common/Input'
import { PrimaryButton } from '../../../components/common/Button'
import SectionHeader from './SectionHeader'
import { formatCurrency } from '../../../utils/formatCurrency'

function initialsOf(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '—'
}

export default function ManualEntryCard({ title, description, onSubmit }) {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [errors, setErrors] = useState({})

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [matchedStudent, setMatchedStudent] = useState(null)
  const fieldRef = useRef(null)
  useClickOutside(fieldRef, () => setShowSuggestions(false))

  useEffect(() => {
    if (!registrationNumber.trim()) {
      setSuggestions([])
      return undefined
    }
    let cancelled = false
    const timeout = setTimeout(async () => {
      const results = await fetchStudentsForDocument(registrationNumber.trim())
      if (!cancelled) {
        setSuggestions(results)
        setShowSuggestions(true)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [registrationNumber])

  function handleRegistrationChange(value) {
    setRegistrationNumber(value)
    // Any manual edit invalidates a previously selected match — its pending fee
    // data no longer necessarily applies to whatever is now typed in the field.
    if (matchedStudent) setMatchedStudent(null)
  }

  function handleSelectSuggestion(student) {
    setRegistrationNumber(student.registrationNumber)
    setName(student.name)
    setClassName(student.className)
    setSection(student.section)
    setMatchedStudent(student)
    setSuggestions([])
    setShowSuggestions(false)
    setErrors({})
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!registrationNumber.trim()) nextErrors.registrationNumber = 'Registration number is required.'
    if (!name.trim()) nextErrors.name = 'Student name is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      id: matchedStudent ? matchedStudent.id : `manual-${Date.now()}`,
      name: name.trim(),
      registrationNumber: registrationNumber.trim(),
      admissionNumber: matchedStudent?.admissionNumber ?? '—',
      className: className.trim(),
      section: section.trim(),
      academicYear: matchedStudent?.academicYear ?? '2025-2026',
      avatarInitials: initialsOf(name),
      feeComponents: matchedStudent ? matchedStudent.feeComponents.map((item) => ({ ...item })) : [{ label: 'Fee Payment', amount: 0 }],
      pendingAmount: matchedStudent?.pendingAmount ?? 0,
      isManual: !matchedStudent,
    })
  }

  return (
    <div className="relative overflow-hidden rounded-clay border border-white/50 bg-white/30 p-5 shadow-clay backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
      <SectionHeader title={title} description={description} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div ref={fieldRef} className="relative">
            <InputField
              label="Registration Number"
              value={registrationNumber}
              onChange={(event) => handleRegistrationChange(event.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setShowSuggestions(false)
              }}
              placeholder="Start typing to search, or enter a new number"
              error={errors.registrationNumber}
              autoComplete="off"
              required
            />

            {showSuggestions && suggestions.length > 0 && (
              <ul
                role="listbox"
                aria-label="Matching students"
                className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/50 bg-white/95 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95"
              >
                {suggestions.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      role="option"
                      onClick={() => handleSelectSuggestion(student)}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-brand-50/70 dark:hover:bg-white/[0.06]"
                    >
                      <Avatar initials={student.avatarInitials} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{student.registrationNumber}</p>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {student.name} · Class {student.className}-{student.section}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <InputField
            label="Student Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            error={errors.name}
            required
          />
          <InputField label="Class (optional)" value={className} onChange={(event) => setClassName(event.target.value)} placeholder="e.g. 8" />
          <InputField label="Section (optional)" value={section} onChange={(event) => setSection(event.target.value)} placeholder="e.g. B" />
        </div>

        {matchedStudent ? (
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
            <p className="text-xs text-amber-700 dark:text-amber-300">Pending Fee for This Student</p>
            <p className="mt-0.5 text-xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(matchedStudent.pendingAmount)}</p>
            {matchedStudent.pendingAmount > 0 && matchedStudent.feeComponents.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1 border-t border-amber-200/60 pt-2 text-xs dark:border-amber-500/20">
                {matchedStudent.feeComponents.map((item) => (
                  <li key={item.label} className="flex items-center justify-between text-amber-800 dark:text-amber-200">
                    <span>{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">No pending balance on record for this student.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Matching registration numbers appear as you type — pick one to see their pending fee and autofill details, or keep typing to enter a new student manually.
          </p>
        )}

        <PrimaryButton type="submit" fullWidth={false}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Continue
        </PrimaryButton>
      </form>
    </div>
  )
}
