import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'

export const systemSettingsRouter = Router()
systemSettingsRouter.use(requireAuth, requirePortal('admin'))

const CATEGORIES = ['general', 'branding', 'academic_config', 'notification_config']

function settingsFor(category) {
  const router = Router()

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { data, error } = await supabaseAdmin.from('app_settings').select('*').eq('category', category).maybeSingle()
      if (error) throw new ApiError(500, error.message)
      res.json({ data: data?.value || {} })
    }),
  )

  router.patch(
    '/',
    asyncHandler(async (req, res) => {
      const { data: existing } = await supabaseAdmin.from('app_settings').select('value').eq('category', category).maybeSingle()
      const merged = { ...(existing?.value || {}), ...req.body }
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .update({ value: merged, updated_by: req.user.id, updated_at: new Date().toISOString() })
        .eq('category', category)
        .select()
        .single()
      if (error) throw new ApiError(400, error.message)
      res.json({ data: data.value })
    }),
  )

  return router
}

for (const category of CATEGORIES) {
  systemSettingsRouter.use(`/${category.replace(/_/g, '-')}`, settingsFor(category))
}
