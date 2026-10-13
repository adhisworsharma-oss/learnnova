import { Router } from 'express'
import mongoose from 'mongoose'
import StudySession from '../models/StudySession.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()
router.use(protect)

/* Sessions that have not reported activity for this long are considered
   abandoned. They are finalized on read so no unclosed session runs forever. */
const STALE_MS = 6 * 60 * 60 * 1000

function mapSession(row) {
  return {
    id: String(row._id),
    state: row.state,
    startedAt: row.startedAt,
    lastActiveAt: row.lastActiveAt,
    endedAt: row.endedAt,
    durationMs: row.durationMs || 0,
  }
}

function isValidObjectId(value) {
  return mongoose.isValidObjectId(value)
}

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.userId)

    // Finalize abandoned sessions, counting up to their last reported activity.
    const stale = await StudySession.find({ user: userId, state: 'active', lastActiveAt: { $lt: new Date(Date.now() - STALE_MS) } }).lean()
    for (const row of stale) {
      await StudySession.updateOne(
        { _id: row._id },
        { $set: { state: 'ended', endedAt: row.lastActiveAt, durationMs: Math.max(0, row.lastActiveAt.getTime() - row.startedAt.getTime()) } }
      )
    }

    const active = await StudySession.findOne({ user: userId, state: 'active' }).sort({ startedAt: -1 }).lean()
    const ended = await StudySession.find({ user: userId, state: 'ended' })
      .sort({ endedAt: -1 })
      .limit(400)
      .lean()

    res.json({
      active: active ? mapSession(active) : null,
      sessions: ended.map(mapSession),
    })
  })
)

router.post(
  '/sessions',
  asyncHandler(async (req, res) => {
    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : new Date()
    if (Number.isNaN(startedAt.getTime())) throw new ApiError(422, 'Invalid start time.')

    const existing = await StudySession.findOne({ user: req.userId, state: 'active' }).lean()
    if (existing) {
      const age = Date.now() - new Date(existing.lastActiveAt).getTime()
      if (age < STALE_MS) {
        throw new ApiError(409, 'A study session is already running.')
      }
      await StudySession.updateOne(
        { _id: existing._id },
        {
          $set: {
            state: 'ended',
            endedAt: existing.lastActiveAt,
            durationMs: Math.max(0, existing.lastActiveAt.getTime() - existing.startedAt.getTime()),
          },
        }
      )
    }

    const session = await StudySession.create({ user: req.userId, state: 'active', startedAt, lastActiveAt: new Date() })
    res.status(201).json({ session: mapSession(session) })
  })
)

router.post(
  '/sessions/:id/heartbeat',
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid session id.')
    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId, state: 'active' })
    if (!session) throw new ApiError(404, 'Active session not found.')

    const update = { lastActiveAt: new Date() }
    if (req.body.startedAt) {
      const startedAt = new Date(req.body.startedAt)
      if (Number.isNaN(startedAt.getTime())) throw new ApiError(422, 'Invalid start time.')
      update.startedAt = startedAt
    }
    Object.assign(session, update)
    await session.save()

    res.json({ session: mapSession(session) })
  })
)

router.post(
  '/sessions/:id/end',
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid session id.')

    const durationMs = Number(req.body.durationMs)
    if (!Number.isFinite(durationMs) || durationMs < 0) throw new ApiError(422, 'Invalid duration.')

    const endedAt = req.body.endedAt ? new Date(req.body.endedAt) : new Date()
    if (Number.isNaN(endedAt.getTime())) throw new ApiError(422, 'Invalid end time.')

    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId })
    if (!session) throw new ApiError(404, 'Session not found.')

    session.state = 'ended'
    session.endedAt = endedAt
    session.durationMs = Math.min(durationMs, 24 * 60 * 60 * 1000)
    session.lastActiveAt = endedAt
    await session.save()

    res.json({ session: mapSession(session) })
  })
)

export default router