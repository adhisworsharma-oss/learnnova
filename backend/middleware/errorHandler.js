import { ApiError } from '../utils/helpers.js'

export function notFound(_req, _res, next) {
  next(new ApiError(404, 'Endpoint not found.'))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details })
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That record already exists for this account.' })
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(404).json({ message: 'The requested item does not exist.' })
  }

  console.error(err)
  return res.status(500).json({ message: 'Something went wrong on the server.' })
}