import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import pool from './config/db.js'
import authRoutes from './routes/auth.js'
import bookRoutes from './routes/books.js'
import readingRoutes from './routes/reading.js'
import bookmarkRoutes from './routes/bookmarks.js'
import favoriteRoutes from './routes/favorites.js'
import recommendationRoutes from './routes/recommendations.js'
import dashboardRoutes from './routes/dashboard.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
})
app.use('/api', apiLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please wait a few minutes.' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'learnova-api' }))

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/reading', readingRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 5000

async function start() {
  try {
    const conn = await pool.getConnection()
    await conn.query('SELECT 1')
    conn.release()
    console.log('Database connection established.')
  } catch (err) {
    console.error('Failed to connect to database:', err.message)
    console.error('Check backend/.env DB_* settings and that MySQL is running.')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`Learnova API listening on http://localhost:${PORT}`)
  })
}

start()