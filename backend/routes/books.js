import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import Book from '../models/Book.js'
import ReadingProgress from '../models/ReadingProgress.js'
import ReadingHistory from '../models/ReadingHistory.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { asyncHandler, ApiError, mapBook, escapeRegExp } from '../utils/helpers.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Please check your input.', details: errors.array() })
  }
  next()
}

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = await Book.aggregate([
      { $group: { _id: '$category', bookCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    res.json({ categories: rows.map((r) => ({ category: r._id, bookCount: r.bookCount })) })
  })
)

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { q, category, level, sort = 'title', order = 'asc', page = 1, limit = 24 } = req.query
    const filter = {}

    if (q) {
      const regex = new RegExp(escapeRegExp(q), 'i')
      filter.$or = [{ title: regex }, { author: regex }]
    }
    if (category) filter.category = category
    if (level) filter.level = level

    const sortFields = ['title', 'author', 'rating', 'pageCount', 'page_count', 'category']
    const orderWhitelist = ['asc', 'desc']
    const sortField = sortFields.includes(sort) ? (sort === 'page_count' ? 'pageCount' : sort) : 'title'
    const sortDir = orderWhitelist.includes(order) ? order : 'asc'
    const sortObject = { [sortField]: sortDir === 'desc' ? -1 : 1 }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 24))

    const total = await Book.countDocuments(filter)
    const books = await Book.find(filter)
      .sort(sortObject)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean()

    res.json({
      books: books.map(mapBook),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    })
  })
)

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid book id.')
    const bookId = req.params.id

    const book = await Book.findById(bookId).lean()
    if (!book) throw new ApiError(404, 'Book not found.')

    if (req.userId) {
      await ReadingHistory.create({ user: req.userId, book: book._id, action: 'viewed' })
    }

    let progress = null
    if (req.userId) {
      const doc = await ReadingProgress.findOne({ user: req.userId, book: book._id }).lean()
      if (doc) {
        progress = {
          currentPage: doc.currentPage,
          pageCount: book.pageCount,
          status: doc.status,
          readingTimeMinutes: doc.readingTimeMinutes,
          lastPosition: doc.lastPosition,
          lastReadAt: doc.lastReadAt,
          startedAt: doc.startedAt,
          completedAt: doc.completedAt,
        }
      }
    }

    res.json({ book: mapBook(book), progress })
  })
)

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('author').trim().notEmpty().withMessage('Author is required.'),
    body('pageCount').isInt({ min: 1 }).withMessage('Page count must be a positive number.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { title, author, category, description, pageCount, isbn, rating } = req.body
    const book = await Book.create({
      title,
      author,
      description: description || null,
      category: category || null,
      pageCount,
      isbn: isbn || null,
      rating: rating || null,
      level: req.body.level || 'Beginner',
    })
    res.status(201).json({ book: mapBook(book) })
  })
)

export default router