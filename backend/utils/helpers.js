const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateMembershipId() {
  const year = new Date().getFullYear()
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)]
  }
  return `LRN-${year}-${code}`
}

function parseInterests(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return value.interests ?? []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function normalizeUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    email: row.email,
    membershipId: row.membership_id,
    dob: row.dob ? new Date(row.dob).toISOString().slice(0, 10) : null,
    profilePicture: row.profile_picture ?? null,
    interests: parseInterests(row.interests),
    createdAt: row.created_at,
  }
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