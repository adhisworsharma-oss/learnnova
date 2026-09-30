const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateMembershipId() {
  const year = new Date().getFullYear()
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]
  }
  return `LRN-${year}-${code}`
}

function toDateOnly(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function plain(doc) {
  if (!doc) return null
  return typeof doc.toObject === 'function' ? doc.toObject() : doc
}

export function normalizeUser(doc) {
  const user = plain(doc)
  if (!user) return null
  return {
    id: String(user._id),
    name: user.name,
    surname: user.surname,
    email: user.email,
    membershipId: user.membershipId,
    dob: toDateOnly(user.dob),
    profilePicture: user.profilePicture ?? null,
    interests: Array.isArray(user.interests) ? user.interests : [],
    createdAt: user.createdAt,
  }
}

export function mapBook(doc) {
  const book = plain(doc)
  if (!book) return null
  return {
    id: String(book._id),
    title: book.title,
    author: book.author,
    cover: book.cover ?? null,
    description: book.description ?? null,
    category: book.category ?? null,
    pageCount: book.pageCount,
    isbn: book.isbn ?? null,
    rating: book.rating ?? null,
    language: book.language,
    level: book.level ?? null,
    addedAt: book.addedAt,
  }
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}