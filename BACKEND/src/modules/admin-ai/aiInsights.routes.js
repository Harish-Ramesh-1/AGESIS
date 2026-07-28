import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'

export const aiInsightsRouter = Router()
aiInsightsRouter.use(requireAuth, requirePortal('admin'))

aiInsightsRouter.get(
  '/preview',
  asyncHandler(async (req, res) => {
    const [{ data: dues }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('dues').select('amount_due, amount_paid, status'),
      supabaseAdmin.from('payments').select('amount, status').eq('status', 'success'),
    ])
    const outstanding = (dues || []).filter((d) => d.status !== 'paid').reduce((sum, d) => sum + Number(d.amount_due) - Number(d.amount_paid), 0)
    const collected = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
    res.json({
      data: {
        headline: outstanding > collected * 0.3 ? 'Outstanding dues are trending high this term.' : 'Fee collection is on track this term.',
        outstanding,
        collected,
        comingSoon: true,
      },
    })
  }),
)

aiInsightsRouter.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const { email } = req.body
    const { data, error } = await supabaseAdmin.from('ai_insights_subscribers').upsert({ email }, { onConflict: 'email' }).select().single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)
