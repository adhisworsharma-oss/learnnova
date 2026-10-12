import { Router } from 'express'
import { param } from 'express-validator'
import Book from '../models/Book.js'
import Bookmark from '../models/Bookmark.js'
import ReadingHistory from '../models/ReadingHistory.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()
router.use(protect)

const validateBookId = [param('bookId').isMongoId().withMessage('Invalid book id.')]

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await Bookmark.find({ user: req.userId })
      .sort({ createdAt: -1 })
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
          bookmarkedAt: r.createdAt,
        })),
    })
  })
)

router.post(
  '/:bookId',
  validateBookId,
  asyncHandler(async (req, res) => {
    const bookId = req.params.bookId
    const book = await Book.findById(bookId)
    if (!book) throw new ApiError(404, 'Book not found.')

    await Bookmark.updateOne(
      { user: req.userId, book: book._id },
      { $setOnInsert: { user: req.userId, book: book._id } },
      { upsert: true }
    )
    await ReadingHistory.create({ user: req.userId, book: book._id, action: 'bookmarked' })
    res.status(201).json({ bookId: String(book._id), bookmarked: true })
  })
)

router.delete(
  '/:bookId',
  validateBookId,
  asyncHandler(async (req, res) => {
    const bookId = req.params.bookId
    await Bookmark.deleteOne({ user: req.userId, book: bookId })
    res.json({ bookId, bookmarked: false })
  })
)

export default router