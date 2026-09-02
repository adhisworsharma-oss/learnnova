import { Router } from 'express'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../utils/helpers.js'

const router = Router()
router.use(protect)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [[user]] = await pool.query(
      'SELECT name, surname, interests FROM users WHERE id = ?',
      [req.userId]
    )
    const interests = user?.interests ? JSON.parse(user.interests) : []

    const [favoriteRows] = await pool.query(
      `SELECT b.category FROM favorites fv JOIN books b ON b.id = fv.book_id WHERE fv.user_id = ?`,
      [req.userId]
    )
    const [progressRows] = await pool.query(
      `SELECT b.category FROM reading_progress rp JOIN books b ON b.id = rp.book_id WHERE rp.user_id = ?`,
      [req.userId]
    )
    const [historyRows] = await pool.query(
      `SELECT DISTINCT b.id AS bookId, b.category FROM reading_history rh
       JOIN books b ON b.id = rh.book_id WHERE rh.user_id = ?`,
      [req.userId]
    )

    const categoryScore = new Map()
    for (const cat of interests) categoryScore.set(cat, (categoryScore.get(cat) || 0) + 3)
    for (const row of favoriteRows) categoryScore.set(row.category, (categoryScore.get(row.category) || 0) + 2)
    for (const row of progressRows) categoryScore.set(row.category, (categoryScore.get(row.category) || 0) + 2)
    for (const row of historyRows) categoryScore.set(row.category, (categoryScore.get(row.category) || 0) + 1)

    const engagedBookIds = new Set(historyRows.map((r) => r.bookId))

    const pages = Number(req.query.limit) || 8
    const [allBooks] = await pool.query(
      `SELECT b.id, b.title, b.author, b.cover, b.category, b.page_count AS pageCount, b.rating, b.description
       FROM books b`
    )

    const scored = allBooks
      .filter((b) => !engagedBookIds.has(b.id))
      .map((b) => {
        const catScore = categoryScore.get(b.category) || 0
        const ratingBoost = b.rating ? (b.rating - 4) * 0.5 : 0
        const score = catScore + ratingBoost + Math.random() * 0.4
        return { ...b, score, reason: catScore > 0 ? `Because you like ${b.category}.` : 'Popular in the library.' }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, pages)
      .map(({ score, ...book }) => book)

    res.json({ recommendations: scored })
  })
)

export default router