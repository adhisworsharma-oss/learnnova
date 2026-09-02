import jwt from 'jsonwebtoken'
import { asyncHandler, ApiError } from '../utils/helpers.js'

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.')
  }

  req.userId = payload.sub
  req.membershipId = payload.mid
  next()
})

export const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    req.membershipId = payload.mid
  } catch {
    // ignore invalid token; treat as anonymous
  }
  next()
}