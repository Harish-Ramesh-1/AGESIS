import { verifyAccessToken } from '../utils/jwt.js'
import { ApiError } from '../utils/response.js'
import { supabaseAdmin } from '../config/supabaseClient.js'

/** Verifies the JWT and attaches { id, portal, uniqueId, roleId } to req.user. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(new ApiError(401, 'Authentication required'))

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, portal: payload.portal, uniqueId: payload.uniqueId, roleId: payload.role }
    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired session'))
  }
}

/** Restricts a route to one or more portals, e.g. requirePortal('admin', 'accountant'). */
export function requirePortal(...portals) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'))
    if (!portals.includes(req.user.portal)) return next(new ApiError(403, 'Not authorized for this portal'))
    next()
  }
}

/** Loads the full user row onto req.fullUser — use when handlers need email/name/etc. */
export async function attachFullUser(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'Authentication required'))
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', req.user.id).single()
  if (error || !data) return next(new ApiError(401, 'User not found'))
  req.fullUser = data
  next()
}
