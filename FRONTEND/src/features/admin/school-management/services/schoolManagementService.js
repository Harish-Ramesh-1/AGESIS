import { apiGet, apiPost, apiPut } from '../../../../services/apiClient'

// ---------------------------------------------------------------------------
// School Profile
// ---------------------------------------------------------------------------
// NOTE: `/admin/school/profile` and `/admin/settings/general` both read/write
// the SAME `app_settings` row (category = 'general'), and this endpoint does
// a full replace (not a merge) on PUT. Saving the school profile here can
// overwrite fields used by System Settings > General (schoolDisplayName,
// timezone, currency, etc.) and vice versa. That's a backend-level design
// quirk outside the scope of this frontend service file — flagged here for
// visibility rather than silently worked around.

function initialsFrom(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export async function fetchSchoolProfile() {
  const { data } = await apiGet('/admin/school/profile')
  const name = data.name ?? data.schoolName ?? ''
  return {
    name,
    address: data.address ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    affiliationBoard: data.affiliationBoard ?? '',
    affiliationNumber: data.affiliationNumber ?? '',
    principalName: data.principalName ?? '',
    establishedYear: data.establishedYear ?? '',
    logoInitials: data.logoInitials ?? initialsFrom(name),
  }
}

export async function saveSchoolProfile(nextProfile) {
  const { data } = await apiPut('/admin/school/profile', nextProfile)
  return { ...data }
}

// ---------------------------------------------------------------------------
// Academic Years
// ---------------------------------------------------------------------------

function mapAcademicYear(row) {
  const today = new Date().toISOString().slice(0, 10)
  let status = 'archived'
  if (row.is_current) status = 'active'
  else if (row.start_date > today) status = 'upcoming'

  return {
    id: row.id,
    label: row.label,
    // The academic_years table has no `terms` column — the backend has no
    // concept of terms per year, so this stays a fixed display default.
    terms: ['Term 1', 'Term 2'],
    startDate: row.start_date,
    endDate: row.end_date,
    status,
  }
}

export async function fetchAcademicYears() {
  const { data } = await apiGet('/admin/school/academic-years')
  return data.map(mapAcademicYear)
}

export async function addAcademicYear(nextYear) {
  await apiPost('/admin/school/academic-years', {
    label: nextYear.label,
    start_date: nextYear.startDate,
    end_date: nextYear.endDate,
  })
  return fetchAcademicYears()
}

// ---------------------------------------------------------------------------
// Classes & Sections
// ---------------------------------------------------------------------------

export async function fetchClassesSections() {
  const { data } = await apiGet('/admin/school/classes-sections')

  const rows = data.map((row) => ({
    id: row.id,
    className: row.class_name,
    section: row.section,
    classTeacher: row.class_teacher,
    studentCount: row.student_count,
  }))

  const totalClasses = new Set(rows.map((row) => row.className)).size
  const totalSections = rows.length
  const totalStudents = rows.reduce((sum, row) => sum + (Number(row.studentCount) || 0), 0)
  const avgClassSize = totalSections ? Math.round(totalStudents / totalSections) : 0

  return { rows, summary: { totalClasses, totalSections, avgClassSize } }
}

// ---------------------------------------------------------------------------
// Academic Calendar
// ---------------------------------------------------------------------------

// calendar_events has no styling metadata (tone/icon) — these are purely
// presentational and derived from event_type for a reasonable-looking
// timeline, not real backend data.
const CALENDAR_EVENT_STYLE = {
  Holiday: { tone: 'amber', icon: 'PartyPopper' },
  PTM: { tone: 'sky', icon: 'Users' },
  Exam: { tone: 'red', icon: 'BookOpen' },
  'Sports Day': { tone: 'violet', icon: 'Trophy' },
  Event: { tone: 'brand', icon: 'CalendarDays' },
}

function styleForEventType(type) {
  return CALENDAR_EVENT_STYLE[type] ?? { tone: 'brand', icon: 'CalendarDays' }
}

function mapCalendarEvent(row) {
  const style = styleForEventType(row.event_type)
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.start_date,
    type: row.event_type,
    tone: style.tone,
    icon: style.icon,
  }
}

export async function fetchAcademicCalendarEvents() {
  const { data } = await apiGet('/admin/school/calendar')
  return data.map(mapCalendarEvent).sort((a, b) => new Date(a.date) - new Date(b.date))
}

export async function addAcademicCalendarEvent(nextEvent) {
  await apiPost('/admin/school/calendar', {
    title: nextEvent.title,
    description: nextEvent.description,
    event_type: nextEvent.type,
    start_date: nextEvent.date,
  })
  return fetchAcademicCalendarEvents()
}
