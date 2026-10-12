import { ApiError } from '../utils/helpers.js'

export function notFound(_req, _res, next) {
  next(new ApiError(404, 'Endpoint not found.'))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details })
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'That record already exists for this account.' })
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ message: 'Please check your input.' })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format.' })
  }

  console.error(err)
  return res.status(500).json({ message: 'Something went wrong on the server.' })
}