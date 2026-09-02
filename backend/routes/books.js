import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import pool from '../config/db.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Please check your input.', details: errors.array() })
  }
  next()
}

const BOOK_SELECT = `
  SELECT b.id, b.title, b.author, b.cover, b.description, b.category, b.page_count AS pageCount,
         b.isbn, b.rating, b.language, b.level, b.added_at AS addedAt
  FROM books b
`

function mapBook(row) {
  return { ...row }
}

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT category, COUNT(*) AS bookCount FROM books GROUP BY category ORDER BY category'
    )
    res.json({ categories: rows })
  })
)

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { q, category, level, sort = 'title', order = 'asc', page = 1, limit = 24 } = req.query
    const where = []
    const params = []

    if (q) {
      where.push('(b.title LIKE ? OR b.author LIKE ?)')
      const like = `%${q}%`
      params.push(like, like)
    }
    if (category) {
      where.push('b.category = ?')
      params.push(category)
    }
    if (level) {
      where.push('b.level = ?')
      params.push(level)
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const sortWhitelist = ['title', 'author', 'rating', 'page_count', 'category']
    const orderWhitelist = ['asc', 'desc']
    const sortCol = sortWhitelist.includes(sort) ? sort : 'title'
    const sortDir = orderWhitelist.includes(order) ? order : 'asc'

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 24))

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM books b ${whereSql}`,
      params
    )
    const [rows] = await pool.query(
      `${BOOK_SELECT} ${whereSql}
       ORDER BY b.${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, (pageNum - 1) * limitNum]
    )

    res.json({
      books: rows.map(mapBook),
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
    const bookId = Number(req.params.id)
    if (!Number.isInteger(bookId) || bookId <= 0) throw new ApiError(400, 'Invalid book id.')

    const [[book]] = await pool.query(`${BOOK_SELECT} WHERE b.id = ?`, [bookId])
    if (!book) throw new ApiError(404, 'Book not found.')

    if (req.userId) {
      await pool.query(
        'INSERT INTO reading_history (user_id, book_id, action) VALUES (?, ?, ?)',
        [req.userId, bookId, 'viewed']
      )
    }

    let progress = null
    if (req.userId) {
      const [rows] = await pool.query(
        `SELECT current_page AS currentPage, page_count AS pageCount, status,
                reading_time_minutes AS readingTimeMinutes, last_position AS lastPosition,
                last_read_at AS lastReadAt, started_at AS startedAt, completed_at AS completedAt
         FROM reading_progress WHERE user_id = ? AND book_id = ?`,
        [req.userId, bookId]
      )
      progress = rows[0] || null
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
    const [result] = await pool.query(
      `INSERT INTO books (title, author, cover, description, category, page_count, isbn, rating, language, level)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'English', ?)`,
      [title, author, description || null, category || null, pageCount, isbn || null, rating || null, req.body.level || 'Beginner']
    )
    const [[book]] = await pool.query(`${BOOK_SELECT} WHERE b.id = ?`, [result.insertId])
    res.status(201).json({ book: mapBook(book) })
  })
)

export default router