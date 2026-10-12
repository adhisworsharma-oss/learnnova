import { Router } from 'express'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError, parseInterests } from '../utils/helpers.js'

const router = Router()

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

// Gemini periodically returns 503 "high demand" on its newest flash models, so
// Nova walks this list until one model answers. Tried in order.
const MODEL_FALLBACKS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
const MODELS = [...new Set([MODEL, ...MODEL_FALLBACKS])]

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_TURNS = 20
const MAX_MESSAGE_CHARS = 2000
const REQUEST_TIMEOUT_MS = 25000

const SYSTEM_PROMPT = `You are Nova, the reading assistant for Learnova, a digital e-library platform for university students.

Your job is to help students find books, build study habits, and get the most out of the library. Keep answers concise (2-4 sentences) and practical. Use short bullet lists when covering several options. Never invent book titles, authors, or availability that you are not confident about - if you are unsure whether a title is in the Learnova library, say so and suggest how to search for it.

You can help with: book recommendations, study and focus techniques, understanding reading stats, and how to use Learnova (Library, Groups, Events, Profile pages).`

function cleanHistory(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.from === 'user' || m.from === 'bot') && typeof m.text === 'string')
    .map((m) => ({
      role: m.from === 'user' ? 'user' : 'model',
      text: m.text.trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((m) => m.text.length > 0)
    .slice(-MAX_TURNS)
}

async function loadUserContext(userId) {
  const [[user]] = await pool.query(
    'SELECT name, interests FROM users WHERE id = ?',
    [userId]
  )
  if (!user) return ''

  const [current] = await pool.query(
    `SELECT b.title, b.author, rp.current_page AS currentPage, b.page_count AS pageCount
     FROM reading_progress rp JOIN books b ON b.id = rp.book_id
     WHERE rp.user_id = ? AND rp.status = 'reading'
     ORDER BY rp.last_read_at DESC LIMIT 3`,
    [userId]
  )
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS completed FROM reading_progress WHERE user_id = ? AND status = 'completed'`,
    [userId]
  )

  const interests = parseInterests(user.interests)

  const lines = [`Member: ${user.name}.`]
  if (interests.length) lines.push(`Stated interests: ${interests.join(', ')}.`)
  if (stats?.completed) lines.push(`Books completed so far: ${stats.completed}.`)
  if (current.length) {
    lines.push(
      `Currently reading: ${current
        .map((b) => `"${b.title}" by ${b.author} (page ${b.currentPage}/${b.pageCount})`)
        .join('; ')}.`
    )
  }
  return lines.join('\n')
}

async function requestGemini(model, systemInstruction, contents) {
  const res = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error(`Gemini ${model} error ${res.status}: ${detail.slice(0, 300)}`)
    const err = new ApiError(502, 'Could not reach Nova right now. Please try again.')
    err.status = res.status
    throw err
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || ''
}

async function callGemini(systemInstruction, contents) {
  let lastError = null

  for (const model of MODELS) {
    try {
      const reply = await requestGemini(model, systemInstruction, contents)
      if (reply) return reply
      lastError = new ApiError(502, 'Nova had nothing to say about that. Try rephrasing your question.')
    } catch (err) {
      lastError = err
      const retryable = err.status === 404 || err.status === 429 || err.status === 503 || err.name === 'TimeoutError'
      if (!retryable) throw err
    }
  }

  if (lastError?.status === 429) {
    throw new ApiError(429, 'Nova is getting a lot of questions right now. Try again in a moment.')
  }
  throw lastError || new ApiError(502, 'Could not reach Nova right now. Please try again.')
}

router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'Nova is not configured on this server.')
    }

    const history = cleanHistory(req.body.messages)
    if (!history.length || history[history.length - 1].role !== 'user') {
      throw new ApiError(400, 'Send at least one message to chat with Nova.')
    }

    const context = await loadUserContext(req.userId)
    const systemInstruction = context ? `${SYSTEM_PROMPT}\n\nMember context:\n${context}` : SYSTEM_PROMPT

    const reply = await callGemini(
      systemInstruction,
      history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }))
    )

    res.json({ reply })
  })
)

export default router
