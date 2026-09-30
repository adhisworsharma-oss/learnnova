import { Router } from 'express'
import mongoose from 'mongoose'
import Book from '../models/Book.js'
import Bookmark from '../models/Bookmark.js'
import Favorite from '../models/Favorite.js'
import ReadingProgress from '../models/ReadingProgress.js'
import ReadingHistory from '../models/ReadingHistory.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../utils/helpers.js'

const router = Router()
router.use(protect)

function dateKey(d) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().slice(0, 10)
}

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.userId)

    const [completedCount, readingCount, bookmarksCount, favoritesCount, progressDocs] = await Promise.all([
      ReadingProgress.countDocuments({ user: userId, status: 'completed' }),
      ReadingProgress.countDocuments({ user: userId, status: 'reading' }),
      Bookmark.countDocuments({ user: userId }),
      Favorite.countDocuments({ user: userId }),
      ReadingProgress.find({ user: userId }).lean(),
    ])

    const bookIds = progressDocs.map((p) => p.book)
    const books = await Book.find({ _id: { $in: bookIds } }, { pageCount: 1 }).lean()
    const pageCountMap = new Map(books.map((b) => [String(b._id), b.pageCount]))

    const pagesRead = progressDocs.reduce((sum, p) => {
      if (p.status === 'completed') {
        return sum + (pageCountMap.get(String(p.book)) || 0)
      }
      return sum + p.currentPage
    }, 0)

    const readingMinutes = progressDocs.reduce((sum, p) => sum + (p.readingTimeMinutes || 0), 0)

    const history = await ReadingHistory.find({ user: userId }, { viewedAt: 1 }).lean()

    const activeDays = new Set(history.map((h) => dateKey(h.viewedAt)))
    const today = new Date()
    let cursor = new Date(today)
    if (!activeDays.has(dateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
    }
    let readingStreak = 0
    while (activeDays.has(dateKey(cursor))) {
      readingStreak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    const activityStart = new Date()
    activityStart.setUTCHours(0, 0, 0, 0)
    activityStart.setDate(activityStart.getDate() - 6)
    const activityMap = new Map()
    for (const h of history) {
      if (h.viewedAt >= activityStart) {
        const key = dateKey(h.viewedAt)
        activityMap.set(key, (activityMap.get(key) || 0) + 1)
      }
    }
    const activity = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = dateKey(d)
      activity.push({ date: key, events: activityMap.get(key) || 0 })
    }

    res.json({
      stats: {
        completedBooks: completedCount,
        currentlyReading: readingCount,
        bookmarks: bookmarksCount,
        favorites: favoritesCount,
        pagesRead,
        readingMinutes,
        readingStreak,
        activity,
      },
    })
  })
)

export default router