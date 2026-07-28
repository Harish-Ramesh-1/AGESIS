import { ApiError } from '../utils/response.js'
import { env } from '../config/env.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Response shape is a flat { message, details? } — the frontend's fetch helpers
// read `data?.message` directly off the error body (see auth.service.js).
// 5xx messages are genericized in production — unhandled errors can otherwise
// leak internals (Postgres constraint names, file paths, etc.) to the client.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err instanceof ApiError ? err.status : err.status || 500
  if (status >= 500) console.error(err)

  const exposeMessage = status < 500 || env.nodeEnv !== 'production'
  res.status(status).json({
    message: exposeMessage ? err.message || 'Internal server error' : 'Something went wrong. Please try again.',
    details: err instanceof ApiError ? err.details : undefined,
  })
}
