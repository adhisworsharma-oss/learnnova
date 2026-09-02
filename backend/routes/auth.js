import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError, generateMembershipId, normalizeUser } from '../utils/helpers.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { sub: user.id, mid: user.membership_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Please check your input.', details: errors.array() })
  }
  next()
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
    body('surname').trim().isLength({ min: 2, max: 80 }).withMessage('Surname must be 2-80 characters.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('dob').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date of birth.'),
    body('interests').optional({ values: 'falsy' }).isArray().withMessage('Interests must be an array.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, surname, email, password, dob } = req.body
    let interests = req.body.interests
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) throw new ApiError(409, 'An account with this email already exists.')

    const hash = await bcrypt.hash(password, 12)
    let membershipId = generateMembershipId()
    for (let i = 0; i < 5; i += 1) {
      const [taken] = await pool.query('SELECT id FROM users WHERE membership_id = ?', [membershipId])
      if (taken.length === 0) break
      membershipId = generateMembershipId()
    }
    const serializedInterests = Array.isArray(interests) ? JSON.stringify(interests) : '[]'

    const [result] = await pool.query(
      `INSERT INTO users (name, surname, email, password_hash, membership_id, dob, interests)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, email, hash, membershipId, dob || null, serializedInterests]
    )

    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
    res.status(201).json({ token: signToken(user), user: normalizeUser(user) })
  })
)

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or membership ID is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR membership_id = ? LIMIT 1',
      [identifier, identifier]
    )
    const user = rows[0]
    if (!user) throw new ApiError(401, 'Invalid credentials.')
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) throw new ApiError(401, 'Invalid credentials.')

    res.json({ token: signToken(user), user: normalizeUser(user) })
  })
)

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId])
    if (!user) throw new ApiError(404, 'User not found.')
    res.json({ user: normalizeUser(user) })
  })
)

const INTEREST_WHITELIST = [
  'Computer Science', 'Data Science', 'Design', 'Business & Economics',
  'Literature', 'History', 'Science', 'Self-Development',
]

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
    body('surname').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Surname must be 2-80 characters.'),
    body('dob').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date of birth.'),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL.'),
    body('interests').optional().isArray().withMessage('Interests must be an array.'),
    body('interests.*').isIn(INTEREST_WHITELIST).withMessage('Unknown interest category.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const sets = []
    const values = []
    const { name, surname, dob, profilePicture, interests } = req.body

    if (name !== undefined) { sets.push('name = ?'); values.push(name) }
    if (surname !== undefined) { sets.push('surname = ?'); values.push(surname) }
    if (dob !== undefined) { sets.push('dob = ?'); values.push(dob || null) }
    if (profilePicture !== undefined) { sets.push('profile_picture = ?'); values.push(profilePicture || null) }
    if (interests !== undefined) {
      const clean = [...new Set(interests)].filter((i) => INTEREST_WHITELIST.includes(i))
      sets.push('interests = ?'); values.push(JSON.stringify(clean))
    }
    if (sets.length === 0) throw new ApiError(422, 'Nothing to update.')

    values.push(req.userId)
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values)

    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId])
    res.json({ user: normalizeUser(user) })
  })
)

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId])
    const ok = await bcrypt.compare(req.body.currentPassword, user.password_hash)
    if (!ok) throw new ApiError(401, 'Current password is incorrect.')

    const hash = await bcrypt.hash(req.body.newPassword, 12)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.userId])
    res.json({ message: 'Password updated.' })
  })
)

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out.' })
})

export default router