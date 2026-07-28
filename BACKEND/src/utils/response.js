export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function ok(res, data, meta) {
  return res.json(meta ? { data, meta } : { data })
}

export function created(res, data) {
  return res.status(201).json({ data })
}
