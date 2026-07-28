import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth } from '../../middleware/auth.js'
import { generateTicketNo } from '../../utils/ids.js'

export const supportRouter = Router()
supportRouter.use(requireAuth)

supportRouter.get(
  '/faqs',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin.from('faqs').select('*').or(`portal.eq.${req.user.portal},portal.eq.all`)
    if (req.query.query) q = q.ilike('question', `%${req.query.query}%`)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

supportRouter.get(
  '/tickets',
  asyncHandler(async (req, res) => {
    let q = supabaseAdmin.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (req.user.portal !== 'admin') q = q.eq('user_id', req.user.id)
    const { data, error } = await q
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

supportRouter.post(
  '/tickets',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({ ...req.body, ticket_no: generateTicketNo(), user_id: req.user.id, portal: req.user.portal })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

supportRouter.patch(
  '/tickets/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)

supportRouter.get(
  '/tickets/:id/messages',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: true })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

supportRouter.post(
  '/tickets/:id/messages',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert({ ticket_id: req.params.id, sender_id: req.user.id, message: req.body.message })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)
