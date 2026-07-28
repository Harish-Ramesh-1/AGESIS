import { Router } from 'express'
import { supabaseAdmin } from '../config/supabaseClient.js'
import { asyncHandler } from './asyncHandler.js'
import { ApiError } from './response.js'

/**
 * Generic REST router over a single Supabase table, for the many admin/accountant
 * settings-style resources (faqs, academic years, templates, allowed IPs, etc.)
 * that just need list/create/update/delete without bespoke business logic.
 *
 * @param {object} opts
 * @param {string} opts.table - table name
 * @param {string} [opts.orderBy] - column to order list results by (default created_at desc)
 * @param {boolean} [opts.ascending]
 * @param {string[]} [opts.filterableFields] - query params allowed as exact-match filters
 * @param {(row:any, req:import('express').Request)=>Promise<any>} [opts.beforeCreate]
 * @param {(row:any, req:import('express').Request)=>Promise<any>} [opts.beforeUpdate]
 */
export function crudRouter({
  table,
  orderBy = 'created_at',
  ascending = false,
  filterableFields = [],
  beforeCreate,
  beforeUpdate,
}) {
  const router = Router()

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      let query = supabaseAdmin.from(table).select('*').order(orderBy, { ascending })
      for (const field of filterableFields) {
        if (req.query[field] !== undefined) query = query.eq(field, req.query[field])
      }
      const { data, error } = await query
      if (error) throw new ApiError(500, error.message)
      res.json({ data })
    }),
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const { data, error } = await supabaseAdmin.from(table).select('*').eq('id', req.params.id).single()
      if (error) throw new ApiError(404, 'Not found')
      res.json({ data })
    }),
  )

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const payload = beforeCreate ? await beforeCreate(req.body, req) : req.body
      const { data, error } = await supabaseAdmin.from(table).insert(payload).select().single()
      if (error) throw new ApiError(400, error.message)
      res.status(201).json({ data })
    }),
  )

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const payload = beforeUpdate ? await beforeUpdate(req.body, req) : req.body
      const { data, error } = await supabaseAdmin
        .from(table)
        .update(payload)
        .eq('id', req.params.id)
        .select()
        .single()
      if (error) throw new ApiError(400, error.message)
      res.json({ data })
    }),
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const { error } = await supabaseAdmin.from(table).delete().eq('id', req.params.id)
      if (error) throw new ApiError(400, error.message)
      res.status(204).send()
    }),
  )

  return router
}
