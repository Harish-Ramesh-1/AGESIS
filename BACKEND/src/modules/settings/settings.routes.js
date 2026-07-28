import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, attachFullUser } from '../../middleware/auth.js'

export const settingsRouter = Router()
settingsRouter.use(requireAuth)

function sanitizeUser(u) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    twoFactorEnabled: u.two_factor_enabled,
    preferences: u.preferences,
  }
}

settingsRouter.get(
  '/profile',
  attachFullUser,
  asyncHandler(async (req, res) => {
    res.json({ data: sanitizeUser(req.fullUser) })
  }),
)

settingsRouter.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const { fullName, phone, avatarUrl } = req.body
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name: fullName, phone, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: sanitizeUser(data) })
  }),
)

settingsRouter.get(
  '/security',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .is('revoked_at', null)
      .order('last_active_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    const { data: user } = await supabaseAdmin.from('users').select('two_factor_enabled').eq('id', req.user.id).single()
    res.json({ data: { sessions: data, twoFactorEnabled: user?.two_factor_enabled || false } })
  }),
)

settingsRouter.post(
  '/security/change-password',
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const { data: user, error: userError } = await supabaseAdmin.from('users').select('password_hash').eq('id', req.user.id).single()
    if (userError) throw new ApiError(404, 'User not found')

    if (user.password_hash) {
      const valid = await bcrypt.compare(currentPassword || '', user.password_hash)
      if (!valid) throw new ApiError(401, 'Current password is incorrect.')
    }

    const nextHash = await bcrypt.hash(newPassword || crypto.randomBytes(9).toString('hex'), 10)
    const { error } = await supabaseAdmin.from('users').update({ password_hash: nextHash }).eq('id', req.user.id)
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { message: 'Password updated.' } })
  }),
)

settingsRouter.patch(
  '/security/two-factor',
  asyncHandler(async (req, res) => {
    const { enabled } = req.body
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ two_factor_enabled: !!enabled })
      .eq('id', req.user.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { twoFactorEnabled: data.two_factor_enabled } })
  }),
)

settingsRouter.delete(
  '/security/sessions/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { message: 'Session signed out.' } })
  }),
)

settingsRouter.delete(
  '/security/sessions',
  asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .is('revoked_at', null)
    if (error) throw new ApiError(400, error.message)
    res.json({ data: { message: 'All other sessions signed out.' } })
  }),
)

settingsRouter.get(
  '/preferences',
  attachFullUser,
  asyncHandler(async (req, res) => {
    res.json({ data: req.fullUser.preferences || {} })
  }),
)

settingsRouter.patch(
  '/preferences',
  attachFullUser,
  asyncHandler(async (req, res) => {
    const merged = { ...(req.fullUser.preferences || {}), ...req.body }
    const { data, error } = await supabaseAdmin.from('users').update({ preferences: merged }).eq('id', req.user.id).select().single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data: data.preferences })
  }),
)
