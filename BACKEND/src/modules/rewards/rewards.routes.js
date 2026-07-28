import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'

export const rewardsRouter = Router()
rewardsRouter.use(requireAuth)

rewardsRouter.get(
  '/',
  requirePortal('parent'),
  asyncHandler(async (req, res) => {
    const { data: children, error: childrenError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('parent_user_id', req.user.id)
    if (childrenError) throw new ApiError(500, childrenError.message)

    const ids = children.map((c) => c.id)
    if (!ids.length) return res.json({ data: { totalPoints: 0, entries: [] } })

    const { data, error } = await supabaseAdmin
      .from('rewards_ledger')
      .select('*, students(full_name)')
      .in('student_id', ids)
      .order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)

    res.json({ data: { totalPoints: data.reduce((sum, r) => sum + r.points, 0), entries: data } })
  }),
)
