import { Router } from 'express'
import { param } from 'express-validator'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()
router.use(protect)

const validateBookId = [param('bookId').isInt({ min: 1 }).withMessage('Invalid book id.')]

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT b.id AS bookId, b.title, b.author, b.cover, b.category, b.page_count AS pageCount,
              bm.created_at AS bookmarkedAt
       FROM bookmarks bm JOIN books b ON b.id = bm.book_id
       WHERE bm.user_id = ?
       ORDER BY bm.created_at DESC`,
      [req.userId]
    )
    res.json({ books: rows })
  })
)

router.post(
  '/:bookId',
  validateBookId,
  asyncHandler(async (req, res) => {
    const bookId = Number(req.params.bookId)
    const [[book]] = await pool.query('SELECT id FROM books WHERE id = ?', [bookId])
    if (!book) throw new ApiError(404, 'Book not found.')

    await pool.query(
      'INSERT IGNORE INTO bookmarks (user_id, book_id) VALUES (?, ?)',
      [req.userId, bookId]
    )
    await pool.query(
      'INSERT INTO reading_history (user_id, book_id, action) VALUES (?, ?, ?)',
      [req.userId, bookId, 'bookmarked']
    )
    res.status(201).json({ bookId, bookmarked: true })
  })
)

router.delete(
  '/:bookId',
  validateBookId,
  asyncHandler(async (req, res) => {
    const bookId = Number(req.params.bookId)
    await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND book_id = ?', [req.userId, bookId])
    res.json({ bookId, bookmarked: false })
  })
)

export default router