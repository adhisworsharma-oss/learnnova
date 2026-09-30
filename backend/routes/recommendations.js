import { Router } from 'express'
import mongoose from 'mongoose'
import Book from '../models/Book.js'
import User from '../models/User.js'
import Favorite from '../models/Favorite.js'
import ReadingProgress from '../models/ReadingProgress.js'
import ReadingHistory from '../models/ReadingHistory.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../utils/helpers.js'

const router = Router()
router.use(protect)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean()
    if (!user) throw new ApiError(404, 'User not found.')
    const interests = Array.isArray(user.interests) ? user.interests : []

    const [favoriteRows, progressRows, historyRows] = await Promise.all([
      Favorite.find({ user: req.userId }).populate('book').lean(),
      ReadingProgress.find({ user: req.userId }).populate('book').lean(),
      ReadingHistory.find({ user: req.userId }).distinct('book'),
    ])

    const engagedBookIds = new Set(historyRows.map((id) => String(id)))
    const historyCategories = []
    if (historyRows.length > 0) {
      const historyBooks = await Book.find({ _id: { $in: historyRows } }, { category: 1 }).lean()
      historyBooks.forEach((b) => historyCategories.push(b.category))
    }

    const categoryScore = new Map()
    for (const cat of interests) categoryScore.set(cat, (categoryScore.get(cat) || 0) + 3)
    for (const row of favoriteRows) {
      if (row.book) categoryScore.set(row.book.category, (categoryScore.get(row.book.category) || 0) + 2)
    }
    for (const row of progressRows) {
      if (row.book) categoryScore.set(row.book.category, (categoryScore.get(row.book.category) || 0) + 2)
    }
    for (const cat of historyCategories) categoryScore.set(cat, (categoryScore.get(cat) || 0) + 1)

    const pages = Number(req.query.limit) || 8
    const allBooks = await Book.find().lean()

    const scored = allBooks
      .filter((b) => !engagedBookIds.has(String(b._id)))
      .map((b) => {
        const catScore = categoryScore.get(b.category) || 0
        const ratingBoost = b.rating ? (b.rating - 4) * 0.5 : 0
        const score = catScore + ratingBoost + Math.random() * 0.4
        return {
          id: String(b._id),
          title: b.title,
          author: b.author,
          cover: b.cover,
          category: b.category,
          pageCount: b.pageCount,
          rating: b.rating,
          description: b.description,
          score,
          reason: catScore > 0 ? `Because you like ${b.category}.` : 'Popular in the library.',
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, pages)
      .map(({ score, ...book }) => book)

    res.json({ recommendations: scored })
  })
)

export default router