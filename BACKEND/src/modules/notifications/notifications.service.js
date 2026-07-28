import { supabaseAdmin } from '../../config/supabaseClient.js'

/**
 * Writes an in-app notification. Pass either userId directly, or studentId to
 * resolve and notify that student's parent. Best-effort — never throws.
 */
export async function notifyUser({ userId, studentId, title, message, type = 'info', portal }) {
  try {
    let targetUserId = userId
    let targetPortal = portal
    if (!targetUserId && studentId) {
      const { data: student } = await supabaseAdmin.from('students').select('parent_user_id').eq('id', studentId).single()
      targetUserId = student?.parent_user_id
      targetPortal = targetPortal || 'parent'
    }
    if (!targetUserId) return
    await supabaseAdmin.from('notifications').insert({ user_id: targetUserId, portal: targetPortal, title, message, type })
  } catch (error) {
    console.error('[notifications] failed to write notification', error.message)
  }
}
