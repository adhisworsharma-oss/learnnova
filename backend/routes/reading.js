import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import Book from '../models/Book.js'
import ReadingProgress from '../models/ReadingProgress.js'
import ReadingHistory from '../models/ReadingHistory.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()
router.use(protect)

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Please check your input.', details: errors.array() })
  }
  next()
}

const validateBookId = [param('bookId').isMongoId().withMessage('Invalid book id.')]

async function ensureBook(bookId) {
  if (!mongoose.isValidObjectId(bookId)) throw new ApiError(400, 'Invalid book id.')
  const book = await Book.findById(bookId).lean()
  if (!book) throw new ApiError(404, 'Book not found.')
  return book
}

router.post(
  '/start',
  [body('bookId').isMongoId().withMessage('Invalid book id.')],
  validate,
  asyncHandler(async (req, res) => {
    const book = await ensureBook(req.body.bookId)

    const existing = await ReadingProgress.findOne({ user: req.userId, book: book._id })
    if (!existing) {
      await ReadingProgress.create({ user: req.userId, book: book._id, currentPage: 0, status: 'reading' })
    } else if (existing.status !== 'completed') {
      existing.status = 'reading'
      await existing.save()
    }
    await ReadingHistory.create({ user: req.userId, book: book._id, action: 'opened' })

    const progress = await ReadingProgress.findOne({ user: req.userId, book: book._id }).lean()
    res.status(201).json({
      progress: {
        bookId: String(progress.book),
        currentPage: progress.currentPage,
        totalPages: book.pageCount,
        status: progress.status,
      },
    })
  })
)

router.put(
  '/:bookId/progress',
  validateBookId,
  [
    body('currentPage').isInt({ min: 0 }).withMessage('Current page must be a positive number.'),
    body('minutesRead').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid minutes.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const book = await ensureBook(req.params.bookId)

    const progress = await ReadingProgress.findOne({ user: req.userId, book: book._id })
    if (!progress) throw new ApiError(404, 'Start reading this book first.')

    let page = Number(req.body.currentPage)
    if (page > book.pageCount) page = book.pageCount
    const isCompleted = page >= book.pageCount
    const status = isCompleted ? 'completed' : 'reading'

    progress.currentPage = page
    progress.status = status
    progress.readingTimeMinutes = progress.readingTimeMinutes + (Number(req.body.minutesRead) || 0)
    progress.lastReadAt = new Date()
    if (isCompleted) progress.completedAt = new Date()
    await progress.save()

    if (isCompleted) {
      await ReadingHistory.create({ user: req.userId, book: book._id, action: 'completed' })
    }

    res.json({
      progress: {
        bookId: String(book._id),
        currentPage: page,
        totalPages: book.pageCount,
        status,
        readingTimeMinutes: progress.readingTimeMinutes,
      },
    })
  })
)

router.post(
  '/:bookId/complete',
  validateBookId,
  validate,
  asyncHandler(async (req, res) => {
    const book = await ensureBook(req.params.bookId)

    const progress = await ReadingProgress.findOne({ user: req.userId, book: book._id })
    if (!progress) throw new ApiError(404, 'Start reading this book first.')

    progress.currentPage = book.pageCount
    progress.status = 'completed'
    progress.lastReadAt = new Date()
    progress.completedAt = new Date()
    await progress.save()

    await ReadingHistory.create({ user: req.userId, book: book._id, action: 'completed' })
    res.json({
      progress: {
        bookId: String(book._id),
        currentPage: book.pageCount,
        totalPages: book.pageCount,
        status: 'completed',
      },
    })
  })
)

router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const rows = await ReadingProgress.find({ user: req.userId, status: 'reading' })
      .sort({ lastReadAt: -1 })
      .populate('book')
      .lean()

    res.json({
      books: rows
        .filter((r) => r.book)
        .map((r) => ({
          bookId: String(r.book._id),
          title: r.book.title,
          author: r.book.author,
          cover: r.book.cover,
          category: r.book.category,
          currentPage: r.currentPage,
          pageCount: r.book.pageCount,
          status: r.status,
          percent: r.book.pageCount ? Math.round((r.currentPage / r.book.pageCount) * 100) : 0,
          readingTimeMinutes: r.readingTimeMinutes,
          lastPosition: r.lastPosition,
          lastReadAt: r.lastReadAt,
        })),
    })
  })
)

router.get(
  '/completed',
  asyncHandler(async (req, res) => {
    const rows = await ReadingProgress.find({ user: req.userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .populate('book')
      .lean()

    res.json({
      books: rows
        .filter((r) => r.book)
        .map((r) => ({
          bookId: String(r.book._id),
          title: r.book.title,
          author: r.book.author,
          cover: r.book.cover,
          category: r.book.category,
          pageCount: r.book.pageCount,
          completedAt: r.completedAt,
          readingTimeMinutes: r.readingTimeMinutes,
        })),
    })
  })
)

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const history = await ReadingHistory.find({ user: req.userId })
      .sort({ viewedAt: -1 })
      .limit(60)
      .populate('book')
      .lean()

    const bookIds = [...new Set(history.filter((h) => h.book).map((h) => h.book._id))]
    const progressDocs = await ReadingProgress.find({
      user: req.userId,
      book: { $in: bookIds },
    }).lean()
    const progressMap = new Map(progressDocs.map((p) => [String(p.book), p]))

    const seen = new Set()
    const unique = []
    for (const h of history) {
      if (!h.book || seen.has(String(h.book._id))) continue
      seen.add(String(h.book._id))
      const p = progressMap.get(String(h.book._id))
      unique.push({
        id: String(h._id),
        bookId: String(h.book._id),
        action: h.action,
        viewedAt: h.viewedAt,
        title: h.book.title,
        author: h.book.author,
        cover: h.book.cover,
        category: h.book.category,
        currentPage: p?.currentPage ?? 0,
        pageCount: h.book.pageCount,
        readingStatus: p?.status ?? null,
      })
    }

    res.json({ history: unique })
  })
)

export default router