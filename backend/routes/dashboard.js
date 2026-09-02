import { Router } from 'express'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../utils/helpers.js'

const router = Router()
router.use(protect)

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [[completedRow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM reading_progress WHERE user_id = ? AND status = 'completed'`,
      [req.userId]
    )
    const [[readingRow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM reading_progress WHERE user_id = ? AND status = 'reading'`,
      [req.userId]
    )
    const [[bookmarksRow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?`,
      [req.userId]
    )
    const [[favoritesRow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?`,
      [req.userId]
    )
    const [[pagesRow]] = await pool.query(
      `SELECT COALESCE(SUM(
          CASE WHEN status = 'completed' THEN (SELECT page_count FROM books WHERE id = book_id)
               ELSE current_page END
       ), 0) AS pages FROM reading_progress WHERE user_id = ?`,
      [req.userId]
    )
    const [[minutesRow]] = await pool.query(
      `SELECT COALESCE(SUM(reading_time_minutes), 0) AS minutes FROM reading_progress WHERE user_id = ?`,
      [req.userId]
    )

    const [streakRows] = await pool.query(
      `SELECT DISTINCT DATE(viewed_at) AS d FROM reading_history WHERE user_id = ?`,
      [req.userId]
    )
    const activeDays = new Set(streakRows.map((r) => String(r.d).slice(0, 10)))
    const today = new Date()
    let cursor = new Date(today)
    if (!activeDays.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1)
    }
    let readingStreak = 0
    while (activeDays.has(cursor.toISOString().slice(0, 10))) {
      readingStreak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    const [activityRaw] = await pool.query(
      `SELECT DATE(viewed_at) AS d, COUNT(*) AS events FROM reading_history
       WHERE user_id = ? AND viewed_at >= (CURDATE() - INTERVAL 6 DAY)
       GROUP BY DATE(viewed_at)`,
      [req.userId]
    )
    const activityMap = new Map(activityRaw.map((r) => [String(r.d), r.events]))
    const activity = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      activity.push({ date: key, events: activityMap.get(key) || 0 })
    }

    res.json({
      stats: {
        completedBooks: completedRow.count,
        currentlyReading: readingRow.count,
        bookmarks: bookmarksRow.count,
        favorites: favoritesRow.count,
        pagesRead: pagesRow.pages,
        readingMinutes: minutesRow.minutes,
        readingStreak,
        activity,
      },
    })
  })
)

export default router