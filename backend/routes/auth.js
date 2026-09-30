import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler, ApiError, generateMembershipId, normalizeUser } from '../utils/helpers.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), mid: user.membershipId },
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
    const interests = Array.isArray(req.body.interests) ? [...new Set(req.body.interests)] : []

    const existing = await User.exists({ email })
    if (existing) throw new ApiError(409, 'An account with this email already exists.')

    const hash = await bcrypt.hash(password, 12)
    let membershipId = generateMembershipId()
    for (let i = 0; i < 5; i += 1) {
      const taken = await User.exists({ membershipId })
      if (!taken) break
      membershipId = generateMembershipId()
    }

    const user = await User.create({
      name,
      surname,
      email,
      passwordHash: hash,
      membershipId,
      dob: dob || null,
      interests,
    })

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
    const user = await User.findOne({
      $or: [{ email: { $in: [identifier, identifier.toLowerCase()] } }, { membershipId: identifier }],
    })
    if (!user) throw new ApiError(401, 'Invalid credentials.')
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new ApiError(401, 'Invalid credentials.')

    res.json({ token: signToken(user), user: normalizeUser(user) })
  })
)

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId)
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
    const { name, surname, dob, profilePicture, interests } = req.body
    const update = {}

    if (name !== undefined) update.name = name
    if (surname !== undefined) update.surname = surname
    if (dob !== undefined) update.dob = dob || null
    if (profilePicture !== undefined) update.profilePicture = profilePicture || null
    if (interests !== undefined) {
      update.interests = [...new Set(interests)].filter((i) => INTEREST_WHITELIST.includes(i))
    }
    if (Object.keys(update).length === 0) throw new ApiError(422, 'Nothing to update.')

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true })
    if (!user) throw new ApiError(404, 'User not found.')
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
    const user = await User.findById(req.userId)
    if (!user) throw new ApiError(404, 'User not found.')
    const ok = await bcrypt.compare(req.body.currentPassword, user.passwordHash)
    if (!ok) throw new ApiError(401, 'Current password is incorrect.')

    const hash = await bcrypt.hash(req.body.newPassword, 12)
    user.passwordHash = hash
    await user.save()
    res.json({ message: 'Password updated.' })
  })
)

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out.' })
})

export default router