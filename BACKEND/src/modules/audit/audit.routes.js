import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'

export const auditRouter = Router()

function mapRow(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    actor: row.actor_name || 'System',
    actionType: row.action,
    entity: row.entity_type ? `${row.entity_type}${row.entity_id ? ' — ' + row.entity_id : ''}` : row.entity_id,
    details: row.details?.message || row.details?.note || JSON.stringify(row.details || {}),
    severity: row.severity,
  }
}

auditRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { query, actor, actionType, dateFrom, dateTo } = req.query
    let q = supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500)
    if (actor) q = q.eq('actor_name', actor)
    if (actionType) q = q.eq('action', actionType)
    if (dateFrom) q = q.gte('created_at', dateFrom)
    if (dateTo) q = q.lte('created_at', `${dateTo}T23:59:59`)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)

    let rows = data.map(mapRow)
    if (query) {
      const needle = String(query).toLowerCase()
      rows = rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(needle))
    }
    res.json({ data: rows })
  }),
)
