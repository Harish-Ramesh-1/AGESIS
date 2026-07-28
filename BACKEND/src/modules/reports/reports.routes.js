import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'

export const reportsRouter = Router()
reportsRouter.use(requireAuth, requirePortal('accountant', 'admin'))

reportsRouter.get(
  '/daily-collection',
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data, error } = await supabaseAdmin.from('payments').select('amount, paid_at').eq('status', 'success').gte('paid_at', since)
    if (error) throw new ApiError(500, error.message)

    const byDay = {}
    for (const p of data) {
      const day = p.paid_at.slice(0, 10)
      byDay[day] = (byDay[day] || 0) + Number(p.amount)
    }
    res.json({ data: Object.entries(byDay).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)) })
  }),
)

reportsRouter.get(
  '/monthly-revenue',
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 365 * 86400000).toISOString()
    const { data, error } = await supabaseAdmin.from('payments').select('amount, paid_at').eq('status', 'success').gte('paid_at', since)
    if (error) throw new ApiError(500, error.message)

    const byMonth = {}
    for (const p of data) {
      const month = p.paid_at.slice(0, 7)
      byMonth[month] = (byMonth[month] || 0) + Number(p.amount)
    }
    res.json({ data: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)) })
  }),
)

reportsRouter.get(
  '/outstanding-dues',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('dues')
      .select('amount_due, amount_paid, status, students(class_name)')
      .neq('status', 'paid')
    if (error) throw new ApiError(500, error.message)

    const byClass = {}
    for (const d of data) {
      const cls = d.students?.class_name || 'Unknown'
      byClass[cls] = (byClass[cls] || 0) + (Number(d.amount_due) - Number(d.amount_paid))
    }
    res.json({ data: Object.entries(byClass).map(([className, amount]) => ({ className, amount })) })
  }),
)

reportsRouter.get(
  '/collection-analytics',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('payments').select('amount, method, status')
    if (error) throw new ApiError(500, error.message)

    const successful = data.filter((p) => p.status === 'success')
    const byMethod = successful.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
      return acc
    }, {})
    res.json({
      data: {
        totalCollected: successful.reduce((sum, p) => sum + Number(p.amount), 0),
        successRate: data.length ? successful.length / data.length : 0,
        byMethod,
      },
    })
  }),
)

reportsRouter.get(
  '/payment-analytics',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('payments').select('amount, status, gateway')
    if (error) throw new ApiError(500, error.message)

    res.json({
      data: {
        total: data.length,
        success: data.filter((p) => p.status === 'success').length,
        failed: data.filter((p) => p.status === 'failed').length,
        pending: data.filter((p) => p.status === 'pending').length,
        byGateway: data.reduce((acc, p) => {
          acc[p.gateway] = (acc[p.gateway] || 0) + 1
          return acc
        }, {}),
      },
    })
  }),
)

reportsRouter.post(
  '/export',
  asyncHandler(async (req, res) => {
    const { module, format = 'csv' } = req.body
    const { data, error } = await supabaseAdmin
      .from('export_jobs')
      .insert({ module, format, status: 'completed', requested_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

reportsRouter.get(
  '/export/history',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('export_jobs').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

reportsRouter.get(
  '/scheduled',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('scheduled_reports').select('*').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

reportsRouter.post(
  '/scheduled',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('scheduled_reports')
      .insert({ ...req.body, created_by: req.user.id })
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.status(201).json({ data })
  }),
)

reportsRouter.patch(
  '/scheduled/:id/toggle',
  asyncHandler(async (req, res) => {
    const { data: current, error: fetchError } = await supabaseAdmin.from('scheduled_reports').select('active').eq('id', req.params.id).single()
    if (fetchError) throw new ApiError(404, 'Not found')
    const { data, error } = await supabaseAdmin
      .from('scheduled_reports')
      .update({ active: !current.active })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw new ApiError(400, error.message)
    res.json({ data })
  }),
)
