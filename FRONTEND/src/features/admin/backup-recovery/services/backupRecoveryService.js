import { apiGet, apiPatch, apiPost } from '../../../../services/apiClient'

// ---- Backup Schedule ----
// The seeded backup_schedule row uses `time` (not `timeOfDay`) and has no
// storage-location field at all.

const FREQUENCY_TO_DB = { Daily: 'daily', Weekly: 'weekly' }
const DB_TO_FREQUENCY = { daily: 'Daily', weekly: 'Weekly' }

function mapSchedule(value) {
  return {
    frequency: DB_TO_FREQUENCY[value.frequency] ?? titleCase(value.frequency) ?? 'Daily',
    timeOfDay: value.time ?? '02:00',
    retentionDays: value.retentionDays ?? 30,
    // Not tracked anywhere in the backend — honestly labeled rather than
    // reusing the old mock's invented "AWS S3 · ap-south-1" string.
    storageLocation: 'Managed by the backend (storage location not exposed via API)',
  }
}

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : null
}

export async function fetchBackupSchedule() {
  const { data } = await apiGet('/admin/backup/schedule')
  return mapSchedule(data)
}

export async function updateBackupSchedule(patch) {
  const { data } = await apiPatch('/admin/backup/schedule', {
    frequency: FREQUENCY_TO_DB[patch.frequency] ?? patch.frequency?.toLowerCase(),
    time: patch.timeOfDay,
    retentionDays: patch.retentionDays,
  })
  return mapSchedule(data)
}

// `backup_jobs` rows never record a real size or duration — the backend's
// "run backup" is a stub that inserts a completed row instantly, with no
// actual snapshot process behind it (matches the reference doc's note that
// backup/restore are inherently simulated). `durationSeconds` below is the
// real measured round-trip time of the API call itself; `sizeMb` is honestly
// 0 rather than a fabricated number when the backend hasn't recorded one.
export async function runBackupNow() {
  const start = Date.now()
  const { data } = await apiPost('/admin/backup/run')
  const durationSeconds = Math.max(1, Math.round((Date.now() - start) / 1000))
  return {
    id: data.id,
    timestamp: data.created_at,
    sizeMb: data.size_bytes ? Math.round(data.size_bytes / (1024 * 1024)) : 0,
    durationSeconds,
    trigger: 'manual',
    status: data.status === 'completed' ? 'success' : data.status,
  }
}

// ---- Backup History ----

function mapBackupJob(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    sizeMb: row.size_bytes ? Math.round(row.size_bytes / (1024 * 1024)) : 0,
    // Not tracked per historical job by the backend.
    durationSeconds: 0,
    trigger: row.type === 'manual' ? 'manual' : 'scheduled',
    status: row.status === 'completed' ? 'success' : row.status,
  }
}

export async function fetchBackupHistory() {
  const { data } = await apiGet('/admin/backup/history')
  return data.map(mapBackupJob).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// ---- Restore ----

export async function fetchRestoreSnapshots() {
  const { data } = await apiGet('/admin/backup/snapshots')
  return data.map(mapBackupJob).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function restoreFromSnapshot(id) {
  const { data } = await apiPost(`/admin/backup/snapshots/${id}/restore`)
  return { success: true, restoredFrom: id, restoredAt: new Date().toISOString(), message: data?.message }
}

// ---- Data Export ----

export const EXPORT_MODULES = ['Students', 'Payments', 'Users', 'Fee Structure', 'Audit Logs']
export const EXPORT_FORMATS = ['CSV', 'PDF']

async function resolveUserNames(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (uniqueIds.length === 0) return new Map()
  const { data: users } = await apiGet('/admin/users')
  return new Map(users.map((user) => [user.id, user.full_name]))
}

export async function fetchExportHistory() {
  const { data } = await apiGet('/admin/backup/exports')
  const nameById = await resolveUserNames(data.map((row) => row.requested_by))

  return data
    .map((row) => ({
      id: row.id,
      module: row.module,
      format: (row.format || '').toUpperCase(),
      generatedBy: nameById.get(row.requested_by) ?? 'You',
      generatedAt: row.created_at,
    }))
    .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
}

export async function generateExport({ module, format }) {
  // export_jobs.format is constrained to lowercase csv/xlsx/pdf server-side.
  await apiPost('/admin/backup/exports', { module, format: (format || '').toLowerCase() })
  return fetchExportHistory()
}
