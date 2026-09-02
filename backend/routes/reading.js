import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import pool from '../config/db.js'
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

const validateBookId = [param('bookId').isInt({ min: 1 }).withMessage('Invalid book id.')]

async function ensureBook(bookId) {
  const [[book]] = await pool.query('SELECT id, page_count AS pageCount FROM books WHERE id = ?', [bookId])
  if (!book) throw new ApiError(404, 'Book not found.')
  return book
}

router.post(
  '/start',
  [body('bookId').isInt({ min: 1 }).withMessage('Invalid book id.')],
  validate,
  asyncHandler(async (req, res) => {
    const bookId = Number(req.body.bookId)
    await ensureBook(bookId)

    await pool.query(
      `INSERT INTO reading_progress (user_id, book_id, current_page, status)
       VALUES (?, ?, 0, 'reading')
       ON DUPLICATE KEY UPDATE status = IF(status = 'completed', status, 'reading')`,
      [req.userId, bookId]
    )
    await pool.query(
      'INSERT INTO reading_history (user_id, book_id, action) VALUES (?, ?, ?)',
      [req.userId, bookId, 'opened']
    )

    const [[progress]] = await pool.query(
      `SELECT rp.*, b.page_count AS totalPages FROM reading_progress rp
       JOIN books b ON b.id = rp.book_id WHERE rp.user_id = ? AND rp.book_id = ?`,
      [req.userId, bookId]
    )
    res.status(201).json({
      progress: {
        bookId: progress.book_id,
        currentPage: progress.current_page,
        totalPages: progress.totalPages,
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
    const bookId = Number(req.params.bookId)
    const book = await ensureBook(bookId)

    const [existing] = await pool.query(
      'SELECT id, reading_time_minutes AS minutes FROM reading_progress WHERE user_id = ? AND book_id = ?',
      [req.userId, bookId]
    )
    if (existing.length === 0) throw new ApiError(404, 'Start reading this book first.')

    let page = Number(req.body.currentPage)
    if (page > book.pageCount) page = book.pageCount
    const isCompleted = page >= book.pageCount
    const status = isCompleted ? 'completed' : 'reading'
    const minutes = existing[0].minutes + (Number(req.body.minutesRead) || 0)

    await pool.query(
      `UPDATE reading_progress
       SET current_page = ?, status = ?, reading_time_minutes = ?, last_read_at = NOW(),
           completed_at = IF(? = 'completed', NOW(), completed_at)
       WHERE user_id = ? AND book_id = ?`,
      [page, status, minutes, status, req.userId, bookId]
    )

    if (isCompleted) {
      await pool.query(
        'INSERT INTO reading_history (user_id, book_id, action) VALUES (?, ?, ?)',
        [req.userId, bookId, 'completed']
      )
    }

    res.json({ progress: { bookId, currentPage: page, totalPages: book.pageCount, status, readingTimeMinutes: minutes } })
  })
)

router.post(
  '/:bookId/complete',
  validateBookId,
  validate,
  asyncHandler(async (req, res) => {
    const bookId = Number(req.params.bookId)
    const book = await ensureBook(bookId)

    const [existing] = await pool.query(
      'SELECT id FROM reading_progress WHERE user_id = ? AND book_id = ?',
      [req.userId, bookId]
    )
    if (existing.length === 0) throw new ApiError(404, 'Start reading this book first.')

    await pool.query(
      `UPDATE reading_progress SET current_page = ?, status = 'completed',
         last_read_at = NOW(), completed_at = NOW()
       WHERE user_id = ? AND book_id = ?`,
      [book.pageCount, req.userId, bookId]
    )
    await pool.query(
      'INSERT INTO reading_history (user_id, book_id, action) VALUES (?, ?, ?)',
      [req.userId, bookId, 'completed']
    )
    res.json({ progress: { bookId, currentPage: book.pageCount, totalPages: book.pageCount, status: 'completed' } })
  })
)

router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT b.id AS bookId, b.title, b.author, b.cover, b.category,
              rp.current_page AS currentPage, b.page_count AS pageCount, rp.status,
              ROUND(rp.current_page / b.page_count * 100) AS percent,
              rp.reading_time_minutes AS readingTimeMinutes,
              rp.last_position AS lastPosition, rp.last_read_at AS lastReadAt
       FROM reading_progress rp
       JOIN books b ON b.id = rp.book_id
       WHERE rp.user_id = ? AND rp.status = 'reading'
       ORDER BY rp.last_read_at DESC`,
      [req.userId]
    )
    res.json({ books: rows })
  })
)

router.get(
  '/completed',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT b.id AS bookId, b.title, b.author, b.cover, b.category, b.page_count AS pageCount,
              rp.completed_at AS completedAt, rp.reading_time_minutes AS readingTimeMinutes
       FROM reading_progress rp JOIN books b ON b.id = rp.book_id
       WHERE rp.user_id = ? AND rp.status = 'completed'
       ORDER BY rp.completed_at DESC`,
      [req.userId]
    )
    res.json({ books: rows })
  })
)

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT rh.id, rh.book_id AS bookId, rh.action, rh.viewed_at AS viewedAt, b.title, b.author, b.cover, b.category,
              rp.current_page AS currentPage, b.page_count AS pageCount, rp.status AS readingStatus
       FROM reading_history rh
       JOIN books b ON b.id = rh.book_id
       LEFT JOIN reading_progress rp ON rp.user_id = rh.user_id AND rp.book_id = rh.book_id
       WHERE rh.user_id = ?
       ORDER BY rh.viewed_at DESC
       LIMIT 60`,
      [req.userId]
    )

    const seen = new Set()
    const unique = []
    for (const row of rows) {
      if (seen.has(row.bookId)) continue
      seen.add(row.bookId)
      unique.push(row)
    }
    res.json({ history: unique })
  })
)

export default router