import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import ProfilePost from '../models/ProfilePost.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { asyncHandler, ApiError, normalizeUser } from '../utils/helpers.js'

const router = Router()

const INTEREST_WHITELIST = [
  'Computer Science', 'Data Science', 'Design', 'Business & Economics',
  'Literature', 'History', 'Science', 'Self-Development',
]

const COURSE_WHITELIST = ['BCA', 'MCA']
const PHONE_RE = /^[0-9+\-\s()]{6,24}$/

const USERNAME_RE = /^[a-z0-9_]{3,30}$/
const IMAGE_RE = /^(https?:\/\/\S+|data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+)$/
const MAX_AVATAR_CHARS = 350000
const MAX_COVER_CHARS = 1000000
const MAX_POST_IMAGE_CHARS = 850000

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Please check your input.', details: errors.array() })
  }
  next()
}

const isImage = (maxChars) => (value) => IMAGE_RE.test(value) && value.length <= maxChars
const imageMsg = 'Must be an image URL or uploaded image data.'

async function findProfile(param) {
  const byId = /^[0-9a-fA-F]{24}$/.test(param)
  const user = await User.findOne(byId ? { _id: param } : { username: String(param).toLowerCase() })
  if (!user) throw new ApiError(404, 'Profile not found.')
  return user
}

function publicProfile(user, viewerId) {
  const profile = normalizeUser(user)
  const isSelf = Boolean(viewerId) && String(user._id) === viewerId
  if (!isSelf) {
    delete profile.email
    delete profile.dob
    delete profile.phone
  }
  return {
    ...profile,
    isSelf,
    isFollowing: Boolean(viewerId) && (user.followers || []).some((f) => String(f) === viewerId),
  }
}

function mapAuthor(user) {
  if (!user) return { id: null, name: 'Unknown', surname: '', username: null, profilePicture: null }
  return {
    id: String(user._id),
    name: user.name,
    surname: user.surname,
    username: user.username ?? null,
    profilePicture: user.profilePicture ?? null,
  }
}

function mapComment(comment, viewerId) {
  return {
    id: String(comment._id),
    text: comment.text,
    createdAt: comment.createdAt,
    author: mapAuthor(comment.user),
    isSelf: Boolean(viewerId) && comment.user && String(comment.user._id) === viewerId,
  }
}

function mapPost(post, viewerId) {
  return {
    id: String(post._id),
    text: post.text,
    image: post.image ?? null,
    createdAt: post.createdAt,
    likes: (post.likes || []).length,
    likedByMe: Boolean(viewerId) && (post.likes || []).some((l) => String(l) === viewerId),
    comments: (post.comments || []).map((c) => mapComment(c, viewerId)),
    author: mapAuthor(post.user),
    isSelf: Boolean(viewerId) && post.user && String(post.user._id) === viewerId,
  }
}

const postPopulate = [
  { path: 'user', select: 'name surname username profilePicture' },
  { path: 'comments.user', select: 'name surname username profilePicture' },
]

/* ---------------------------------------------------------------
   Own profile
   --------------------------------------------------------------- */

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user) throw new ApiError(404, 'User not found.')
    const postCount = await ProfilePost.countDocuments({ user: user._id })
    res.json({ profile: { ...publicProfile(user, req.userId), postCount } })
  })
)

router.get(
  '/me/posts',
  protect,
  asyncHandler(async (req, res) => {
    const posts = await ProfilePost.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate(postPopulate)
    res.json({ posts: posts.map((p) => mapPost(p, req.userId)) })
  })
)

router.put(
  '/',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
    body('surname').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Surname must be 2-80 characters.'),
    body('username')
      .optional({ values: 'falsy' })
      .trim()
      .toLowerCase()
      .matches(USERNAME_RE)
      .withMessage('Username must be 3-30 characters: lowercase letters, numbers, underscores.')
      .custom((value) => value !== 'me' || Promise.reject(new Error('"me" is reserved.'))),
    body('bio').optional().trim().isLength({ max: 255 }).withMessage('Bio must be 255 characters or fewer.'),
    body('location').optional().trim().isLength({ max: 80 }).withMessage('Location must be 80 characters or fewer.'),
    body('website').optional({ values: 'falsy' }).trim().isURL({ require_protocol: true, require_tld: false }).withMessage('Website must be a valid URL.'),
    body('dob').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date of birth.'),
    body('studentId').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Student ID must be 30 characters or fewer.'),
    body('course').optional({ values: 'falsy' }).trim().isIn(COURSE_WHITELIST).withMessage('Choose a valid course.'),
    body('semester').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Semester must be 30 characters or fewer.'),
    body('department').optional({ values: 'falsy' }).trim().isLength({ max: 120 }).withMessage('Department must be 120 characters or fewer.'),
    body('university').optional({ values: 'falsy' }).trim().isLength({ max: 160 }).withMessage('University must be 160 characters or fewer.'),
    body('phone').optional({ values: 'falsy' }).trim().matches(PHONE_RE).withMessage('Enter a valid phone number.'),
    body('profilePicture').optional({ values: 'falsy' }).custom(isImage(MAX_AVATAR_CHARS)).withMessage(imageMsg),
    body('coverPhoto').optional({ values: 'falsy' }).custom(isImage(MAX_COVER_CHARS)).withMessage(imageMsg),
    body('interests').optional().isArray().withMessage('Interests must be an array.'),
    body('interests.*').isIn(INTEREST_WHITELIST).withMessage('Unknown interest category.'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, surname, username, bio, location, website, dob, profilePicture, coverPhoto, interests, studentId, course, semester, department, university, phone } = req.body
    const update = {}

    if (name !== undefined) update.name = name
    if (surname !== undefined) update.surname = surname
    if (bio !== undefined) update.bio = bio
    if (location !== undefined) update.location = location
    if (website !== undefined) update.website = website
    if (dob !== undefined) update.dob = dob || null
    if (profilePicture !== undefined) update.profilePicture = profilePicture || null
    if (coverPhoto !== undefined) update.coverPhoto = coverPhoto || null
    if (studentId !== undefined) update.studentId = studentId
    if (course !== undefined) update.course = course
    if (semester !== undefined) update.semester = semester
    if (department !== undefined) update.department = department
    if (university !== undefined) update.university = university
    if (phone !== undefined) update.phone = phone
    if (interests !== undefined) {
      update.interests = [...new Set(interests)].filter((i) => INTEREST_WHITELIST.includes(i))
    }

    if (username !== undefined && username !== '') {
      const taken = await User.exists({ username, _id: { $ne: req.userId } })
      if (taken) throw new ApiError(409, 'That username is already taken.')
      update.username = username
    }

    if (Object.keys(update).length === 0) throw new ApiError(422, 'Nothing to update.')

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true })
    if (!user) throw new ApiError(404, 'User not found.')
    const postCount = await ProfilePost.countDocuments({ user: user._id })
    res.json({ profile: { ...publicProfile(user, req.userId), postCount } })
  })
)

/* ---------------------------------------------------------------
   Posts (specific paths first)
   --------------------------------------------------------------- */

router.post(
  '/',
  protect,
  [
    body('text').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('Post must be 2000 characters or fewer.'),
    body('image').optional({ values: 'falsy' }).custom(isImage(MAX_POST_IMAGE_CHARS)).withMessage(imageMsg),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const text = (req.body.text || '').trim()
    const image = req.body.image || null
    if (!text && !image) throw new ApiError(422, 'Write something or add a photo.')

    const post = await ProfilePost.create({ user: req.userId, text, image })
    const populated = await ProfilePost.findById(post._id).populate(postPopulate)
    res.status(201).json({ post: mapPost(populated, req.userId) })
  })
)

router.post(
  '/post/:postId/like',
  protect,
  asyncHandler(async (req, res) => {
    const post = await ProfilePost.findById(req.params.postId)
    if (!post) throw new ApiError(404, 'Post not found.')

    const alreadyLiked = post.likes.some((l) => String(l) === req.userId)
    if (alreadyLiked) post.likes = post.likes.filter((l) => String(l) !== req.userId)
    else post.likes.push(req.userId)
    await post.save()

    res.json({ likes: post.likes.length, liked: !alreadyLiked })
  })
)

router.post(
  '/post/:postId/comment',
  protect,
  [body('text').trim().isLength({ min: 1, max: 600 }).withMessage('Comment must be 1-600 characters.')],
  validate,
  asyncHandler(async (req, res) => {
    const post = await ProfilePost.findById(req.params.postId)
    if (!post) throw new ApiError(404, 'Post not found.')

    post.comments.push({ user: req.userId, text: req.body.text })
    await post.save()
    const populated = await ProfilePost.findById(post._id).populate(postPopulate)
    const comment = populated.comments[populated.comments.length - 1]

    res.status(201).json({ comment: mapComment(comment, req.userId) })
  })
)

router.delete(
  '/post/:postId',
  protect,
  asyncHandler(async (req, res) => {
    const post = await ProfilePost.findById(req.params.postId)
    if (!post) throw new ApiError(404, 'Post not found.')
    if (String(post.user) !== req.userId) throw new ApiError(403, 'You can only delete your own posts.')

    await post.deleteOne()
    res.json({ id: req.params.postId, deleted: true })
  })
)

/* ---------------------------------------------------------------
   Public profile (by username or id)
   --------------------------------------------------------------- */

router.get(
  '/:username',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const user = await findProfile(req.params.username)
    const postCount = await ProfilePost.countDocuments({ user: user._id })
    res.json({ profile: { ...publicProfile(user, req.userId), postCount } })
  })
)

router.get(
  '/:username/posts',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const user = await findProfile(req.params.username)
    const posts = await ProfilePost.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate(postPopulate)
    res.json({ posts: posts.map((p) => mapPost(p, req.userId)) })
  })
)

router.post(
  '/:username/follow',
  protect,
  asyncHandler(async (req, res) => {
    const user = await findProfile(req.params.username)
    if (String(user._id) === req.userId) throw new ApiError(422, 'You cannot follow yourself.')

    const alreadyFollowing = (user.followers || []).some((f) => String(f) === req.userId)
    if (alreadyFollowing) {
      user.followers = user.followers.filter((f) => String(f) !== req.userId)
      await user.save()
      await User.updateOne({ _id: req.userId }, { $pull: { following: user._id } })
    } else {
      user.followers.push(req.userId)
      await user.save()
      await User.updateOne({ _id: req.userId }, { $addToSet: { following: user._id } })
    }

    res.json({ followers: user.followers.length, isFollowing: !alreadyFollowing })
  })
)

router.delete(
  '/:username/follow',
  protect,
  asyncHandler(async (req, res) => {
    const user = await findProfile(req.params.username)
    const wasFollowing = (user.followers || []).some((f) => String(f) === req.userId)
    if (wasFollowing) {
      user.followers = user.followers.filter((f) => String(f) !== req.userId)
      await user.save()
      await User.updateOne({ _id: req.userId }, { $pull: { following: user._id } })
    }
    res.json({ followers: user.followers.length, isFollowing: false })
  })
)

export default router
