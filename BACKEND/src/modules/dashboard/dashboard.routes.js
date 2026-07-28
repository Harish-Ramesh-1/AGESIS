import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/response.js'
import { requireAuth, requirePortal } from '../../middleware/auth.js'

export const dashboardRouter = Router()
dashboardRouter.use(requireAuth, requirePortal('accountant', 'admin'))

dashboardRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const [{ count: studentCount }, { data: payments }, { data: dues }] = await Promise.all([
      supabaseAdmin.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('payments').select('amount, status, paid_at').eq('status', 'success'),
      supabaseAdmin.from('dues').select('amount_due, amount_paid, status').neq('status', 'paid'),
    ])
    const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
    const outstanding = (dues || []).reduce((sum, d) => sum + Number(d.amount_due) - Number(d.amount_paid), 0)
    const today = new Date().toISOString().slice(0, 10)
    const todayCollected = (payments || []).filter((p) => p.paid_at?.slice(0, 10) === today).reduce((sum, p) => sum + Number(p.amount), 0)

    res.json({
      data: { studentCount: studentCount || 0, totalCollected, outstanding, todayCollected, dueCount: (dues || []).length },
    })
  }),
)

dashboardRouter.get(
  '/performance',
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 90 * 86400000).toISOString()
    const { data, error } = await supabaseAdmin.from('payments').select('amount, paid_at').eq('status', 'success').gte('paid_at', since)
    if (error) throw new ApiError(500, error.message)
    const byWeek = {}
    for (const p of data) {
      const d = new Date(p.paid_at)
      const week = `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}-${d.getMonth() + 1}`
      byWeek[week] = (byWeek[week] || 0) + Number(p.amount)
    }
    res.json({ data: Object.entries(byWeek).map(([period, amount]) => ({ period, amount })) })
  }),
)

dashboardRouter.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    const range = req.query.range || 'month'
    const days = range === 'week' ? 7 : range === 'year' ? 365 : 30
    const since = new Date(Date.now() - days * 86400000).toISOString()
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

dashboardRouter.get(
  '/payment-methods',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('payments').select('amount, method').eq('status', 'success')
    if (error) throw new ApiError(500, error.message)
    const byMethod = data.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
      return acc
    }, {})
    res.json({ data: Object.entries(byMethod).map(([method, amount]) => ({ method, amount })) })
  }),
)

dashboardRouter.get(
  '/pending-dues',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('dues')
      .select('*, students(full_name, admission_no, class_name)')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(10)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

dashboardRouter.get(
  '/overdue-accounts',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('dues')
      .select('*, students(full_name, admission_no, class_name)')
      .eq('status', 'overdue')
      .order('due_date', { ascending: true })
      .limit(10)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

dashboardRouter.get(
  '/recent-transactions',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, students(full_name, admission_no)')
      .order('paid_at', { ascending: false })
      .limit(10)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

dashboardRouter.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${req.user.id},and(user_id.is.null,portal.eq.${req.user.portal})`)
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

dashboardRouter.get(
  '/student-stats',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('students').select('class_name, status')
    if (error) throw new ApiError(500, error.message)
    const byClass = data.reduce((acc, s) => {
      acc[s.class_name] = (acc[s.class_name] || 0) + 1
      return acc
    }, {})
    res.json({ data: { total: data.length, active: data.filter((s) => s.status === 'active').length, byClass } })
  }),
)

// ---- Admin-only extras ----
dashboardRouter.get(
  '/user-distribution',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').select('portal, status')
    if (error) throw new ApiError(500, error.message)
    const byPortal = data.reduce((acc, u) => {
      acc[u.portal] = (acc[u.portal] || 0) + 1
      return acc
    }, {})
    res.json({ data: byPortal })
  }),
)

dashboardRouter.get(
  '/pending-approvals',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('status', 'pending').order('created_at', { ascending: false })
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)

dashboardRouter.get(
  '/recent-activity',
  requirePortal('admin'),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(15)
    if (error) throw new ApiError(500, error.message)
    res.json({ data })
  }),
)
