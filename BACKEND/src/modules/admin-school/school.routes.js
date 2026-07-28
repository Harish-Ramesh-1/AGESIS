import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'
import { crudRouter } from '../../utils/crudRouter.js'

export const schoolRouter = Router()
schoolRouter.use(requireAuth, requirePortal('accountant', 'admin'))

// Uses its own 'school_profile' category — deliberately separate from the
// 'general' category owned by /admin/settings/general so the two features
// (school identity vs. system-wide config) can't clobber each other.
schoolRouter.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('app_settings').select('*').eq('category', 'school_profile').maybeSingle()
    if (error) throw new ApiError(500, error.message)
    res.json({ data: data?.value || {} })
  }),
)

schoolRouter.put(
  '/profile',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('app_settings')
      .select('id, value')
      .eq('category', 'school_profile')
      .maybeSingle()
    if (fetchError) throw new ApiError(500, fetchError.message)

    const value = { ...(existing?.value || {}), ...req.body }
    const query = existing
      ? supabaseAdmin.from('app_settings').update({ value, updated_by: req.user.id, updated_at: new Date().toISOString() }).eq('id', existing.id)
      : supabaseAdmin.from('app_settings').insert({ category: 'school_profile', value, updated_by: req.user.id })
    const { data, error } = await query.select().single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: data.value })
  }),
)

schoolRouter.use('/academic-years', crudRouter({ table: 'academic_years', orderBy: 'start_date', ascending: false }))
schoolRouter.use(
  '/classes-sections',
  crudRouter({ table: 'classes_sections', orderBy: 'class_name', ascending: true, filterableFields: ['academic_year_id'] }),
)
schoolRouter.use('/calendar', crudRouter({ table: 'calendar_events', orderBy: 'start_date', ascending: true }))
