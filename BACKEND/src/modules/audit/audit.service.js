import { supabaseAdmin } from '../../config/supabaseClient.js'

/** Best-effort audit log write — never throws, so it can't break the caller's primary action. */
export async function logAudit({ actorId, actorName, action, entityType, entityId, details, severity, ip }) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId || null,
      actor_name: actorName || 'System',
      action,
      entity_type: entityType || null,
      entity_id: entityId ? String(entityId) : null,
      details: details || {},
      severity: severity || 'normal',
      ip: ip || null,
    })
  } catch (error) {
    console.error('[audit] failed to write log', error.message)
  }
}
