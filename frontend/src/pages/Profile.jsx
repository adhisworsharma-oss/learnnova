import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, clearToken } from '../api.js'
import './Profile.css'

const INTERESTS = [
  'Computer Science', 'Data Science', 'Design', 'Business & Economics',
  'Literature', 'History', 'Science', 'Self-Development',
]

const COURSES = ['BCA', 'MCA']
const SEMESTERS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
]

const USERNAME_RE = /^[a-z0-9_]{3,30}$/
const PHONE_RE = /^[0-9+\-\s()]{6,24}$/

const AVATAR_SPEC = { width: 480, height: 480, fit: 'cover', maxChars: 350000 }
const COVER_SPEC = { width: 1200, height: 375, fit: 'cover', maxChars: 1000000 }
const POST_SPEC = { width: 1000, height: 1000, fit: 'fit', maxChars: 850000 }

const DOWNLOADS_KEY = 'learnova_downloads_v1'
const PRIVACY_KEY = 'learnova_privacy_v1'
const DEFAULT_PRIVACY = {
  profileVisibility: 'institute',
  showEmail: false,
  showReadingActivity: true,
  allowMessages: true,
}

/* ------------------------------------------------------------------ *
   Icons
 * ------------------------------------------------------------------ */

const ICONS = {
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /></>,
  id: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 9h4" /><path d="M15 13h4" /><path d="M6.5 16.5c.6-1.2 1.6-1.7 2.5-1.7s1.9.5 2.5 1.7" /></>,
  bookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3V12" /></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><line x1="8" y1="6" x2="8.01" y2="6" /><line x1="12" y1="6" x2="12.01" y2="6" /><line x1="16" y1="6" x2="16.01" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" /><line x1="16" y1="10" x2="16.01" y2="10" /><line x1="8" y1="14" x2="8.01" y2="14" /><line x1="12" y1="14" x2="12.01" y2="14" /><line x1="16" y1="14" x2="16.01" y2="14" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  award: <><circle cx="12" cy="8" r="6" /><polyline points="8.5 13.5 7.5 22 12 19.5 16.5 22 15.5 13.5" /></>,
  sparkles: <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3L21 2" /><path d="M17 6l3 3" /><path d="M15 8l2 2" /></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  message: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  rupee: <><path d="M6 3h12M6 8h12M6 13h5a4 4 0 0 0 0-8" /><path d="M6 13l6 8" /></>,
}

function Icon({ name, size = 18, stroke = 1.9, fill = 'none', className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}

/* ------------------------------------------------------------------ *
   Image helpers
 * ------------------------------------------------------------------ */

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not open that image.'))
    img.src = src
  })
}

function drawImage(img, { width, height, fit }, quality) {
  const canvas = document.createElement('canvas')
  if (fit === 'cover') {
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    const scale = Math.max(width / img.width, height / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
  } else {
    const scale = Math.min(1, width / img.width, height / img.height)
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  return canvas.toDataURL('image/jpeg', quality)
}

async function encodeImage(file, spec) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image must be smaller than 8 MB.')

  const img = await loadImage(await fileToDataUrl(file))
  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = drawImage(img, spec, quality)
    if (dataUrl.length <= spec.maxChars) return dataUrl
    if (quality === 0.55) break
  }
  throw new Error('That image is too large. Try a smaller photo.')
}

/* ------------------------------------------------------------------ *
   Small helpers
 * ------------------------------------------------------------------ */

function timeAgo(value) {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000))
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function joinedLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function longDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatWebsite(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n || 0)
}

const HISTORY_LABELS = {
  opened: 'Opened',
  completed: 'Finished',
  bookmarked: 'Saved',
  favorited: 'Favorited',
}

const HISTORY_ICONS = {
  opened: 'bookOpen',
  completed: 'checkCircle',
  bookmarked: 'bookmark',
  favorited: 'heart',
}

/* ------------------------------------------------------------------ *
   Reusable pieces
 * ------------------------------------------------------------------ */

function Avatar({ user, size = 'md', className = '' }) {
  const cls = `pf-avatar pf-avatar--${size} ${className}`.trim()
  if (user?.profilePicture) {
    return <img className={cls} src={user.profilePicture} alt={`${user.name || ''} ${user.surname || ''}`.trim()} />
  }
  return <div className={`${cls} pf-avatar--fallback`}>{(user?.name || 'U').charAt(0).toUpperCase()}</div>
}

function BookCover({ cover, title }) {
  const [failed, setFailed] = useState(false)
  if (cover && !failed) {
    return <img className="pf-book-cover" src={cover} alt={title} loading="lazy" onError={() => setFailed(true)} />
  }
  return (
    <div className="pf-book-cover pf-book-cover--fallback" aria-hidden="true">
      <Icon name="book" size={18} />
    </div>
  )
}

function BookRow({ book, badge, onDownload, onRemove, downloaded }) {
  return (
    <li className="pf-book-row">
      <BookCover cover={book.cover} title={book.title} />
      <div className="pf-book-info">
        <span className="pf-book-title">{book.title}</span>
        <span className="pf-book-author">
          {book.author}{book.category ? ` · ${book.category}` : ''}
        </span>
        {typeof book.percent === 'number' && (
          <div className="pf-progress">
            <div className="pf-progress-bar">
              <div className="pf-progress-fill" style={{ width: `${book.percent || 0}%` }} />
            </div>
            <span className="pf-progress-label">{book.percent || 0}%</span>
          </div>
        )}
      </div>
      {badge && <span className={`pf-badge ${badge.className || ''}`}>{badge.label}</span>}
      <div className="pf-row-actions">
        {onDownload && (
          <button
            type="button"
            className={`pf-icon-btn ${downloaded ? 'pf-icon-btn--active' : ''}`}
            title={downloaded ? 'Remove from downloads' : 'Download resource'}
            aria-label={downloaded ? 'Remove from downloads' : 'Download resource'}
            onClick={() => onDownload(book)}
          >
            <Icon name={downloaded ? 'check' : 'download'} size={16} />
          </button>
        )}
        {onRemove && (
          <button type="button" className="pf-icon-btn pf-icon-btn--danger" title="Remove" aria-label="Remove" onClick={() => onRemove(book)}>
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ *
   Post card + composer (community tab)
 * ------------------------------------------------------------------ */

function PostCard({ post, onLike, onComment, onDelete }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitComment(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || busy) return
    setBusy(true)
    try {
      await onComment(post, value)
      setText('')
    } catch {
      /* toast handled upstream */
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="pf-post">
      <header className="pf-post-head">
        <Avatar user={post.author} size="sm" />
        <div className="pf-post-who">
          <span className="pf-post-name">{post.author.name} {post.author.surname}</span>
          <span className="pf-post-time">{timeAgo(post.createdAt)}</span>
        </div>
        {post.isSelf && (
          <button type="button" className="pf-post-menu" title="Delete post" onClick={() => onDelete(post)}>
            <Icon name="x" size={16} stroke={2.2} />
          </button>
        )}
      </header>

      {post.text && <p className="pf-post-text">{post.text}</p>}
      {post.image && <img className="pf-post-image" src={post.image} alt="" loading="lazy" />}

      <div className="pf-post-stats">
        {post.likes > 0 && (
          <span className="pf-post-likecount">
            <i className="pf-heart-dot"><Icon name="heart" size={11} fill="currentColor" stroke={0} /></i> {post.likes}
          </span>
        )}
        {post.comments.length > 0 && <span>{post.comments.length} comment{post.comments.length === 1 ? '' : 's'}</span>}
      </div>

      <div className="pf-post-actions">
        <button
          type="button"
          className={`pf-post-btn ${post.likedByMe ? 'pf-post-btn--liked' : ''}`}
          onClick={() => onLike(post)}
        >
          <Icon name="heart" size={16} fill={post.likedByMe ? 'currentColor' : 'none'} stroke={2} />
          Like
        </button>
        <button
          type="button"
          className="pf-post-btn"
          onClick={(e) => {
            const el = e.currentTarget.closest('.pf-post')?.querySelector('.pf-comment-input')
            el?.focus()
          }}
        >
          <Icon name="message" size={16} stroke={2} />
          Comment
        </button>
      </div>

      {post.comments.length > 0 && (
        <ul className="pf-comments">
          {post.comments.map((c) => (
            <li key={c.id} className="pf-comment">
              <Avatar user={c.author} size="xs" />
              <div className="pf-comment-bubble">
                <span className="pf-comment-name">{c.author.name} {c.author.surname}</span>
                <span className="pf-comment-text">{c.text}</span>
              </div>
              <span className="pf-comment-time">{timeAgo(c.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}

      <form className="pf-comment-form" onSubmit={submitComment}>
        <input
          className="pf-comment-input"
          type="text"
          placeholder="Write a comment..."
          value={text}
          maxLength={600}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="pf-comment-send" disabled={!text.trim() || busy} aria-label="Send comment">
          <Icon name="arrowRight" size={15} stroke={2} />
        </button>
      </form>
    </article>
  )
}

function Composer({ me, onPost, onToast }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setImage(await encodeImage(file, POST_SPEC))
    } catch (err) {
      onToast(err.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if ((!text.trim() && !image) || posting) return
    setPosting(true)
    try {
      await onPost({ text: text.trim(), image })
      setText('')
      setImage(null)
    } catch (err) {
      onToast(err.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <form className="pf-card pf-composer" onSubmit={submit}>
      <div className="pf-composer-row">
        <Avatar user={me} size="sm" />
        <textarea
          className="pf-composer-input"
          placeholder={`Share an update, ${me.name || 'friend'}...`}
          value={text}
          maxLength={2000}
          rows={text.length > 60 ? 4 : 2}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {image && (
        <div className="pf-composer-preview">
          <img src={image} alt="" />
          <button type="button" onClick={() => setImage(null)} aria-label="Remove image">
            <Icon name="x" size={14} stroke={2.4} />
          </button>
        </div>
      )}
      <div className="pf-composer-actions">
        <button type="button" className="pf-composer-photo" onClick={() => fileRef.current?.click()}>
          <Icon name="camera" size={16} stroke={2} />
          Photo
        </button>
        <button type="submit" className="pf-btn pf-btn--primary" disabled={(!text.trim() && !image) || posting}>
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </form>
  )
}

/* ------------------------------------------------------------------ *
   Edit modal
 * ------------------------------------------------------------------ */

function EditModal({ profile, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    surname: profile.surname || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    dob: profile.dob || '',
    phone: profile.phone || '',
    studentId: profile.studentId || '',
    course: profile.course || '',
    semester: profile.semester || '',
    department: profile.department || '',
    university: profile.university || '',
    interests: [...(profile.interests || [])],
  })
  const [formError, setFormError] = useState('')

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  function toggleInterest(interest) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  function submit(e) {
    e.preventDefault()
    const name = form.name.trim()
    const surname = form.surname.trim()
    const username = form.username.trim().toLowerCase()

    if (name.length < 2 || surname.length < 2) {
      return setFormError('Name and surname must be at least 2 characters.')
    }
    if (!USERNAME_RE.test(username)) {
      return setFormError('Username must be 3-30 characters: lowercase letters, numbers and underscores.')
    }
    if (form.bio.length > 255) return setFormError('Bio must be 255 characters or fewer.')
    if (form.location.length > 80) return setFormError('Location must be 80 characters or fewer.')
    if (form.phone && !PHONE_RE.test(form.phone.trim())) {
      return setFormError('Enter a valid phone number.')
    }

    let website = form.website.trim()
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
    if (website) {
      try {
        const parsed = new URL(website)
        if (!parsed.hostname.includes('.')) throw new Error('bad host')
      } catch {
        return setFormError('Enter a valid website URL.')
      }
    }

    setFormError('')
    onSave({ ...form, name, surname, username, website, phone: form.phone.trim() })
  }

  return (
    <div className="pf-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="pf-modal" onSubmit={submit}>
        <header className="pf-modal-head">
          <h2>Edit profile</h2>
          <button type="button" className="pf-modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} stroke={2.1} />
          </button>
        </header>

        <div className="pf-modal-body">
          <p className="pf-modal-section-title">Personal information</p>
          <div className="pf-modal-row">
            <div className="pf-field">
              <label className="pf-label">First name</label>
              <input className="pf-input" type="text" value={form.name} maxLength={80} onChange={set('name')} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Last name</label>
              <input className="pf-input" type="text" value={form.surname} maxLength={80} onChange={set('surname')} />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label">Username</label>
            <input className="pf-input" type="text" value={form.username} maxLength={30} onChange={set('username')} placeholder="lowercase, numbers, underscores" />
          </div>

          <div className="pf-field">
            <label className="pf-label">Bio <em className="pf-count">{form.bio.length}/255</em></label>
            <textarea
              className="pf-textarea"
              value={form.bio}
              maxLength={255}
              rows={3}
              placeholder="Tell people about yourself..."
              onChange={set('bio')}
            />
          </div>

          <p className="pf-modal-section-title">Academic details</p>
          <div className="pf-modal-row">
            <div className="pf-field">
              <label className="pf-label">Student ID</label>
              <input className="pf-input" type="text" value={form.studentId} maxLength={30} placeholder="e.g. BCA-2081-045" onChange={set('studentId')} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Course</label>
              <select className="pf-select" value={form.course} onChange={set('course')}>
                <option value="">Select course</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="pf-modal-row">
            <div className="pf-field">
              <label className="pf-label">Semester</label>
              <select className="pf-select" value={form.semester} onChange={set('semester')}>
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="pf-field">
              <label className="pf-label">Department</label>
              <input className="pf-input" type="text" value={form.department} maxLength={120} placeholder="Department of Computer Applications" onChange={set('department')} />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label">University</label>
            <input className="pf-input" type="text" value={form.university} maxLength={160} placeholder="e.g. Tribhuvan University" onChange={set('university')} />
          </div>

          <p className="pf-modal-section-title">Contact</p>
          <div className="pf-modal-row">
            <div className="pf-field">
              <label className="pf-label">Phone</label>
              <input className="pf-input" type="tel" value={form.phone} maxLength={24} placeholder="+977 98XXXXXXXX" onChange={set('phone')} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Date of birth</label>
              <input className="pf-input" type="date" value={form.dob} onChange={set('dob')} />
            </div>
          </div>

          <div className="pf-modal-row">
            <div className="pf-field">
              <label className="pf-label">Location</label>
              <input className="pf-input" type="text" value={form.location} maxLength={80} placeholder="City, Country" onChange={set('location')} />
            </div>
            <div className="pf-field">
              <label className="pf-label">Website</label>
              <input className="pf-input" type="text" value={form.website} maxLength={200} placeholder="yoursite.com" onChange={set('website')} />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label">Interests</label>
            <div className="pf-chip-row">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`pf-chip ${form.interests.includes(interest) ? 'pf-chip--on' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {formError && <div className="pf-form-error">{formError}</div>}
        </div>

        <footer className="pf-modal-foot">
          <button type="button" className="pf-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </footer>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ *
   Password form (settings tab)
 * ------------------------------------------------------------------ */

function PasswordForm({ onToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.currentPassword || !form.newPassword || !form.confirm) {
      return setMsg({ type: 'error', text: 'All fields are required.' })
    }
    if (form.newPassword.length < 8) {
      return setMsg({ type: 'error', text: 'New password must be at least 8 characters.' })
    }
    if (form.newPassword !== form.confirm) {
      return setMsg({ type: 'error', text: 'Passwords do not match.' })
    }
    setBusy(true)
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      })
      setMsg({ type: 'success', text: 'Password updated successfully.' })
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      onToast('Password updated')
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pf-password-form" onSubmit={submit}>
      <div className="pf-field">
        <label className="pf-label">Current password</label>
        <input className="pf-input" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="Enter current password" />
      </div>
      <div className="pf-modal-row">
        <div className="pf-field">
          <label className="pf-label">New password</label>
          <input className="pf-input" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} placeholder="Minimum 8 characters" />
        </div>
        <div className="pf-field">
          <label className="pf-label">Confirm new password</label>
          <input className="pf-input" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter new password" />
        </div>
      </div>
      {msg && <div className={`pf-msg ${msg.type === 'error' ? 'pf-msg--error' : 'pf-msg--success'}`}>{msg.text}</div>}
      <button type="submit" className="pf-btn pf-btn--primary" disabled={busy}>
        {busy ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ *
   Profile page
 * ------------------------------------------------------------------ */

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const handle = username || 'me'

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [reading, setReading] = useState([])
  const [completed, setCompleted] = useState([])
  const [history, setHistory] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [downloads, setDownloads] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const [privacy, setPrivacy] = useState(() => {
    try {
      return { ...DEFAULT_PRIVACY, ...JSON.parse(localStorage.getItem(PRIVACY_KEY) || '{}') }
    } catch {
      return DEFAULT_PRIVACY
    }
  })

  const avatarInput = useRef(null)
  const coverInput = useRef(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }, [])

  useEffect(() => {
    try {
      setDownloads(JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]'))
    } catch {
      setDownloads([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setNotFound(false)
      setPageError('')
      setProfile(null)
      setPosts([])
      setStats(null)
      setReading([])
      setCompleted([])
      setHistory([])
      setBookmarks([])
      setFavorites([])
      try {
        const [{ profile: loaded }, postsRes] = await Promise.all([
          api(`/profile/${handle}`),
          api(`/profile/${handle}/posts`),
        ])
        if (cancelled) return
        setProfile(loaded)
        setPosts(postsRes.posts || [])
        setTab(loaded.isSelf ? 'overview' : 'community')

        if (loaded.isSelf) {
          const results = await Promise.allSettled([
            api('/dashboard/stats'),
            api('/reading/current'),
            api('/reading/completed'),
            api('/reading/history'),
            api('/bookmarks'),
            api('/favorites'),
          ])
          if (cancelled) return
          const value = (i, fallback) => (results[i].status === 'fulfilled' ? results[i].value : fallback)
          setStats(value(0, null)?.stats || null)
          setReading(value(1, {}).books || [])
          setCompleted(value(2, {}).books || [])
          setHistory(value(3, {}).history || [])
          setBookmarks(value(4, {}).books || [])
          setFavorites(value(5, {}).books || [])
        }
      } catch (err) {
        if (cancelled) return
        if (/not found/i.test(err.message)) setNotFound(true)
        else setPageError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [handle])

  function applyMyProfile(updated) {
    setProfile((prev) => ({ ...prev, ...updated }))
    try {
      const cached = JSON.parse(localStorage.getItem('learnova_user') || '{}')
      localStorage.setItem('learnova_user', JSON.stringify({ ...cached, ...updated }))
    } catch {
      /* ignore cache errors */
    }
  }

  async function saveProfile(form) {
    setSaving(true)
    try {
      const body = {
        name: form.name,
        surname: form.surname,
        username: form.username,
        bio: form.bio,
        location: form.location,
        website: form.website,
        dob: form.dob || '',
        phone: form.phone || '',
        studentId: form.studentId || '',
        course: form.course || '',
        semester: form.semester || '',
        department: form.department || '',
        university: form.university || '',
        interests: form.interests,
      }
      const { profile: updated } = await api('/profile', { method: 'PUT', body })
      applyMyProfile(updated)
      setEditOpen(false)
      showToast('Profile updated')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleImage(event, spec, field) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || saving) return
    setSaving(true)
    try {
      const dataUrl = await encodeImage(file, spec)
      const { profile: updated } = await api('/profile', { method: 'PUT', body: { [field]: dataUrl } })
      applyMyProfile(updated)
      showToast(field === 'coverPhoto' ? 'Cover photo updated' : 'Profile photo updated')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSaving(false)
    }
  }

  function updatePrivacy(patch) {
    setPrivacy((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(PRIVACY_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function persistDownloads(next) {
    setDownloads(next)
    try {
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  function isDownloaded(bookId) {
    return downloads.some((d) => d.bookId === bookId)
  }

  function toggleDownload(book) {
    if (isDownloaded(book.bookId)) {
      persistDownloads(downloads.filter((d) => d.bookId !== book.bookId))
      showToast(`Removed “${book.title}” from downloads`)
      return
    }
    persistDownloads([
      {
        bookId: book.bookId,
        title: book.title,
        author: book.author,
        cover: book.cover ?? null,
        category: book.category ?? null,
        pageCount: book.pageCount ?? 0,
        savedAt: new Date().toISOString(),
      },
      ...downloads,
    ])
    showToast(`Saved “${book.title}” for offline reading`)
  }

  async function toggleFollow() {
    if (!profile || followBusy) return
    setFollowBusy(true)
    try {
      const res = await api(`/profile/${handle}/follow`, { method: profile.isFollowing ? 'DELETE' : 'POST' })
      setProfile((prev) => ({ ...prev, followers: res.followers, isFollowing: res.isFollowing }))
      showToast(res.isFollowing ? `Following ${profile.name}` : 'Unfollowed')
    } catch (err) {
      showToast(err.message)
    } finally {
      setFollowBusy(false)
    }
  }

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Profile link copied')
    } catch {
      showToast('Could not copy the link')
    }
  }

  function handleLogout() {
    clearToken()
    localStorage.removeItem('learnova_user')
    navigate('/login')
  }

  async function createPost({ text, image }) {
    const { post } = await api('/profile', { method: 'POST', body: { text, image } })
    setPosts((prev) => [post, ...prev])
    setProfile((prev) => ({ ...prev, postCount: (prev.postCount || 0) + 1 }))
    showToast('Post published')
  }

  async function likePost(post) {
    try {
      const res = await api(`/profile/post/${post.id}/like`, { method: 'POST' })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes: res.likes, likedByMe: res.liked } : p)))
    } catch (err) {
      showToast(err.message)
    }
  }

  async function commentPost(post, text) {
    const res = await api(`/profile/post/${post.id}/comment`, { method: 'POST', body: { text } })
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, comments: [...p.comments, res.comment] } : p)))
  }

  async function deletePost(post) {
    if (!window.confirm('Delete this post?')) return
    try {
      await api(`/profile/post/${post.id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      setProfile((prev) => ({ ...prev, postCount: Math.max(0, (prev.postCount || 1) - 1) }))
      showToast('Post deleted')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function removeBookmark(book) {
    try {
      await api(`/bookmarks/${book.bookId}`, { method: 'DELETE' })
      setBookmarks((prev) => prev.filter((b) => b.bookId !== book.bookId))
      showToast('Bookmark removed')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function removeFavorite(book) {
    try {
      await api(`/favorites/${book.bookId}`, { method: 'DELETE' })
      setFavorites((prev) => prev.filter((b) => b.bookId !== book.bookId))
      showToast('Removed from favorites')
    } catch (err) {
      showToast(err.message)
    }
  }

  /* ---------- derived data ---------- */

  const derived = useMemo(() => {
    const s = stats || {}
    const completedHistory = history.filter((h) => h.action === 'completed').length
    const returned = completedHistory || completed.length
    return {
      borrowed: reading.length + completed.length,
      issued: reading.length,
      returned,
      wishlist: bookmarks.length,
      favorites: favorites.length,
      historyCount: history.length,
      completedCount: completed.length,
      fines: 0,
      pagesRead: s.pagesRead ?? 0,
      readingMinutes: s.readingMinutes ?? 0,
      readingStreak: s.readingStreak ?? 0,
    }
  }, [stats, reading, completed, bookmarks, favorites, history])

  const achievements = useMemo(() => {
    const list = [
      { id: 'first', icon: 'sparkles', title: 'First Steps', desc: 'Start your first book', unlocked: derived.borrowed >= 1 },
      { id: 'pages', icon: 'activity', title: 'Page Turner', desc: 'Read 100 pages', unlocked: derived.pagesRead >= 100 },
      { id: 'bookworm', icon: 'book', title: 'Bookworm', desc: 'Finish 5 books', unlocked: derived.completedCount >= 5 },
      { id: 'scholar', icon: 'cap', title: 'Scholar', desc: 'Finish 10 books', unlocked: derived.completedCount >= 10 },
      { id: 'collector', icon: 'bookmark', title: 'Collector', desc: 'Save 5 bookmarks', unlocked: derived.wishlist >= 5 },
      { id: 'curator', icon: 'heart', title: 'Curator', desc: 'Favorite 5 books', unlocked: derived.favorites >= 5 },
      { id: 'streak', icon: 'trending', title: 'Consistent', desc: '3-day reading streak', unlocked: derived.readingStreak >= 3 },
      { id: 'marathon', icon: 'clock', title: 'Marathon', desc: 'Read for 10 hours', unlocked: derived.readingMinutes >= 600 },
    ]
    return list
  }, [derived])

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const notifications = useMemo(() => {
    const items = []
    if (derived.readingStreak >= 2) {
      items.push({ id: 'streak', icon: 'trending', tone: 'info', text: `You're on a ${derived.readingStreak}-day reading streak. Keep it up!` })
    }
    completed.slice(0, 2).forEach((book) => {
      items.push({ id: `done-${book.bookId}`, icon: 'checkCircle', tone: 'success', text: `You finished “${book.title}”.` })
    })
    if (derived.wishlist > 0) {
      items.push({ id: 'wishlist', icon: 'bookmark', tone: 'info', text: `${derived.wishlist} book${derived.wishlist === 1 ? '' : 's'} in your wishlist.` })
    }
    if (reading.length > 0) {
      items.push({ id: 'reading', icon: 'bookOpen', tone: 'info', text: `You have ${reading.length} book${reading.length === 1 ? '' : 's'} in progress.` })
    }
    items.push({ id: 'fines', icon: 'rupee', tone: 'success', text: 'No pending dues on your account.' })
    return items.slice(0, 6)
  }, [derived, completed, reading])

  const recentActivity = useMemo(() => history.slice(0, 6), [history])

  /* ---------- render states ---------- */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="pf-card pf-hero pf-skeleton-hero">
          <div className="pf-skeleton pf-skeleton--cover" />
          <div className="pf-hero-body">
            <div className="pf-skeleton pf-skeleton--avatar" />
            <div className="pf-skeleton-lines">
              <div className="pf-skeleton pf-skeleton--line w-40" />
              <div className="pf-skeleton pf-skeleton--line w-60" />
              <div className="pf-skeleton pf-skeleton--line w-30" />
            </div>
          </div>
        </div>
        <div className="pf-kpis">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="pf-card pf-skeleton pf-skeleton--kpi" />)}
        </div>
        <div className="pf-card pf-skeleton pf-skeleton--block" />
      </div>
    )
  }

  if (notFound || pageError) {
    return (
      <div className="profile-page">
        <div className="pf-card pf-message-card">
          <h2>{notFound ? 'Profile not found' : 'Something went wrong'}</h2>
          <p>{notFound ? 'This person may have changed their username.' : pageError}</p>
          <Link className="pf-btn pf-btn--primary" to="/home">Back to home</Link>
        </div>
      </div>
    )
  }

  const isSelf = profile.isSelf
  const postCount = posts.length || profile.postCount || 0
  const fullName = `${profile.name} ${profile.surname}`.trim()

  const tabs = isSelf
    ? [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'library', label: 'My Library', icon: 'book' },
        { id: 'academics', label: 'Academics', icon: 'cap' },
        { id: 'community', label: 'Community', icon: 'users' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ]
    : [
        { id: 'community', label: 'Community', icon: 'users' },
        { id: 'academics', label: 'Academics', icon: 'cap' },
      ]

  const academicRows = [
    { label: 'Student ID', value: profile.studentId, icon: 'user' },
    { label: 'Course', value: profile.course, icon: 'cap' },
    { label: 'Semester', value: profile.semester, icon: 'calendar' },
    { label: 'Department', value: profile.department, icon: 'building' },
    { label: 'University', value: profile.university, icon: 'building' },
    { label: 'Membership ID', value: profile.membershipId, icon: 'id' },
    { label: 'Member since', value: joinedLabel(profile.createdAt), icon: 'clock' },
    { label: 'Membership status', value: 'Active', icon: 'checkCircle', badge: true },
  ]

  const personalRows = [
    { label: 'Full name', value: fullName },
    { label: 'Username', value: profile.username ? `@${profile.username}` : '' },
    ...(isSelf ? [
      { label: 'Email', value: profile.email },
      { label: 'Phone', value: profile.phone },
      { label: 'Date of birth', value: profile.dob ? longDate(profile.dob) : '' },
    ] : []),
    { label: 'Location', value: profile.location },
    { label: 'Website', value: profile.website, href: profile.website },
    { label: 'Bio', value: profile.bio },
  ]

  const kpis = [
    { key: 'borrowed', icon: 'layers', label: 'Books Borrowed', value: derived.borrowed, tone: 'navy' },
    { key: 'issued', icon: 'bookOpen', label: 'Currently Issued', value: derived.issued, tone: 'blue' },
    { key: 'returned', icon: 'checkCircle', label: 'Books Returned', value: derived.returned, tone: 'green' },
    { key: 'wishlist', icon: 'bookmark', label: 'Wishlist', value: derived.wishlist, tone: 'amber' },
    { key: 'favorites', icon: 'heart', label: 'Favorites', value: derived.favorites, tone: 'rose' },
    { key: 'history', icon: 'clock', label: 'Reading History', value: derived.historyCount, tone: 'indigo' },
    { key: 'completed', icon: 'award', label: 'Completed Books', value: derived.completedCount, tone: 'teal' },
    { key: 'fines', icon: 'rupee', label: 'Fines Due', value: `₹${derived.fines}`, tone: 'slate', hint: derived.fines === 0 ? 'All clear' : 'Payment due' },
  ]

  const quickActions = [
    { key: 'browse', icon: 'library', label: 'Browse Library', to: '/books' },
    { key: 'continue', icon: 'bookOpen', label: 'Continue Reading', to: '/books' },
    { key: 'borrowed', icon: 'layers', label: 'My Borrowed Books', tab: 'library' },
    { key: 'favorites', icon: 'heart', label: 'Favorites', tab: 'library' },
    { key: 'downloads', icon: 'download', label: 'Downloaded Resources', tab: 'library' },
    { key: 'help', icon: 'message', label: 'Help & Support', href: 'mailto:support@learnova.app' },
  ]

  return (
    <div className="profile-page">
      {/* ---------------- hero ---------------- */}
      <section className="pf-card pf-hero">
        <div className="pf-cover">
          {profile.coverPhoto
            ? <img className="pf-cover-img" src={profile.coverPhoto} alt="" />
            : <div className="pf-cover-default" />}
          {isSelf && (
            <button type="button" className="pf-cam pf-cam--cover" onClick={() => coverInput.current?.click()} title="Change cover photo">
              <Icon name="camera" size={15} stroke={2} />
              <span>Edit cover</span>
            </button>
          )}
        </div>

        <div className="pf-hero-body">
          <div className="pf-avatar-wrap">
            <Avatar user={profile} size="xl" />
            {isSelf && (
              <button type="button" className="pf-cam pf-cam--avatar" onClick={() => avatarInput.current?.click()} title="Change profile photo">
                <Icon name="camera" size={15} stroke={2} />
              </button>
            )}
          </div>

          <div className="pf-identity">
            <div className="pf-name-row">
              <h1>{fullName}</h1>
              {profile.username && <span className="pf-handle">@{profile.username}</span>}
              <span className="pf-status"><i className="pf-status-dot" />Active member</span>
            </div>

            <p className="pf-academic-line">
              {[profile.course, profile.semester, profile.department].filter(Boolean).join(' · ')
                || 'Add your course and semester in Edit profile'}
            </p>
            {profile.university && (
              <p className="pf-university"><Icon name="cap" size={14} />{profile.university}</p>
            )}
            {profile.bio && <p className="pf-bio">{profile.bio}</p>}

            <div className="pf-meta">
              {profile.studentId && (
                <span className="pf-meta-item pf-meta-id">ID {profile.studentId}</span>
              )}
              <span className="pf-meta-item pf-meta-id">{profile.membershipId}</span>
              {profile.email && (
                <span className="pf-meta-item"><Icon name="mail" size={13} stroke={2} />{profile.email}</span>
              )}
              {profile.phone && (
                <span className="pf-meta-item"><Icon name="phone" size={13} stroke={2} />{profile.phone}</span>
              )}
              {profile.location && (
                <span className="pf-meta-item"><Icon name="pin" size={13} stroke={2} />{profile.location}</span>
              )}
              {profile.website && (
                <a className="pf-meta-item pf-meta-link" href={profile.website} target="_blank" rel="noreferrer">
                  <Icon name="globe" size={13} stroke={2} />{formatWebsite(profile.website)}
                </a>
              )}
              <span className="pf-meta-item"><Icon name="calendar" size={13} stroke={2} />Joined {joinedLabel(profile.createdAt)}</span>
            </div>
          </div>

          <div className="pf-actions">
            {isSelf ? (
              <>
                <button type="button" className="pf-btn pf-btn--primary" onClick={() => setEditOpen(true)}>
                  <Icon name="edit" size={15} stroke={2} />
                  Edit profile
                </button>
                <button type="button" className="pf-btn" onClick={shareProfile}>
                  <Icon name="share" size={15} stroke={2} />
                  Share
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`pf-btn ${profile.isFollowing ? '' : 'pf-btn--primary'}`}
                  onClick={toggleFollow}
                  disabled={followBusy}
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </button>
                <button type="button" className="pf-btn" onClick={shareProfile}>
                  <Icon name="share" size={15} stroke={2} />
                  Share
                </button>
              </>
            )}
          </div>
        </div>

        <input ref={avatarInput} type="file" accept="image/*" hidden onChange={(e) => handleImage(e, AVATAR_SPEC, 'profilePicture')} />
        <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => handleImage(e, COVER_SPEC, 'coverPhoto')} />
      </section>

      {/* ---------------- tabs ---------------- */}
      <nav className="pf-tabs" aria-label="Profile sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pf-tab ${tab === t.id ? 'pf-tab--active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={16} stroke={2} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* ---------------- content ---------------- */}
      <div className="pf-content">
        {tab === 'overview' && isSelf && (
          <div className="pf-overview">
            <section className="pf-kpis" aria-label="Library dashboard">
              {kpis.map((k) => (
                <article key={k.key} className={`pf-kpi pf-kpi--${k.tone}`}>
                  <span className="pf-kpi-icon"><Icon name={k.icon} size={18} stroke={2} /></span>
                  <div className="pf-kpi-body">
                    <strong className="pf-kpi-value">{typeof k.value === 'number' ? formatNumber(k.value) : k.value}</strong>
                    <span className="pf-kpi-label">{k.label}</span>
                    {k.hint && <span className="pf-kpi-hint">{k.hint}</span>}
                  </div>
                </article>
              ))}
            </section>

            <section className="pf-card pf-quick" aria-label="Quick actions">
              <div className="pf-card-head">
                <h2 className="pf-card-title">Quick actions</h2>
              </div>
              <div className="pf-quick-grid">
                {quickActions.map((q) => {
                  if (q.to) {
                    return (
                      <Link key={q.key} to={q.to} className="pf-quick-btn">
                        <span className="pf-quick-icon"><Icon name={q.icon} size={17} stroke={2} /></span>
                        {q.label}
                        <Icon name="chevronRight" size={15} stroke={2} className="pf-quick-arrow" />
                      </Link>
                    )
                  }
                  if (q.href) {
                    return (
                      <a key={q.key} href={q.href} className="pf-quick-btn">
                        <span className="pf-quick-icon"><Icon name={q.icon} size={17} stroke={2} /></span>
                        {q.label}
                        <Icon name="chevronRight" size={15} stroke={2} className="pf-quick-arrow" />
                      </a>
                    )
                  }
                  return (
                    <button key={q.key} type="button" className="pf-quick-btn" onClick={() => setTab(q.tab)}>
                      <span className="pf-quick-icon"><Icon name={q.icon} size={17} stroke={2} /></span>
                      {q.label}
                      <Icon name="chevronRight" size={15} stroke={2} className="pf-quick-arrow" />
                    </button>
                  )
                })}
              </div>
            </section>

            <div className="pf-overview-grid">
              <div className="pf-col">
                <section className="pf-card">
                  <div className="pf-card-head">
                    <h2 className="pf-card-title"><Icon name="activity" size={16} stroke={2} />Recent activity</h2>
                    {history.length > 0 && <button type="button" className="pf-link-btn" onClick={() => setTab('library')}>View all</button>}
                  </div>
                  {recentActivity.length === 0 ? (
                    <p className="pf-empty">Your reading activity will appear here.</p>
                  ) : (
                    <ul className="pf-activity-list">
                      {recentActivity.map((item) => (
                        <li key={item.id} className="pf-activity-item">
                          <span className={`pf-activity-dot pf-activity-dot--${item.action}`}>
                            <Icon name={HISTORY_ICONS[item.action] || 'book'} size={14} stroke={2} />
                          </span>
                          <div className="pf-activity-text">
                            <span>
                              <strong>{HISTORY_LABELS[item.action] || 'Viewed'}</strong> “{item.title}”
                            </span>
                            <span className="pf-activity-sub">{item.author}</span>
                          </div>
                          <span className="pf-activity-time">{timeAgo(item.viewedAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="pf-card">
                  <div className="pf-card-head">
                    <h2 className="pf-card-title"><Icon name="award" size={16} stroke={2} />Achievements</h2>
                    <span className="pf-card-count">{unlockedCount}/{achievements.length} unlocked</span>
                  </div>
                  <div className="pf-badge-grid">
                    {achievements.map((a) => (
                      <div key={a.id} className={`pf-badge-item ${a.unlocked ? 'pf-badge-item--on' : ''}`}>
                        <span className="pf-badge-medal"><Icon name={a.icon} size={17} stroke={2} /></span>
                        <div className="pf-badge-text">
                          <strong>{a.title}</strong>
                          <span>{a.desc}</span>
                        </div>
                        {a.unlocked && <Icon name="check" size={15} stroke={2.4} className="pf-badge-check" />}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="pf-col">
                <section className="pf-card">
                  <div className="pf-card-head">
                    <h2 className="pf-card-title"><Icon name="cap" size={16} stroke={2} />Academic details</h2>
                    <button type="button" className="pf-link-btn" onClick={() => setEditOpen(true)}>
                      <Icon name="edit" size={14} stroke={2} />Edit
                    </button>
                  </div>
                  <ul className="pf-info-list">
                    {academicRows.map((row) => (
                      <li key={row.label} className="pf-info-row">
                        <span className="pf-info-label">{row.label}</span>
                        {row.badge ? (
                          <span className="pf-pill pf-pill--success">{row.value}</span>
                        ) : (
                          <span className={`pf-info-value ${row.value ? '' : 'pf-info-value--muted'}`}>
                            {row.value || 'Not set'}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="pf-card">
                  <div className="pf-card-head">
                    <h2 className="pf-card-title"><Icon name="bell" size={16} stroke={2} />Notifications</h2>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="pf-empty">You're all caught up.</p>
                  ) : (
                    <ul className="pf-notif-list">
                      {notifications.map((n) => (
                        <li key={n.id} className="pf-notif-item">
                          <span className={`pf-notif-icon pf-notif-icon--${n.tone}`}><Icon name={n.icon} size={15} stroke={2} /></span>
                          <span>{n.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {tab === 'library' && isSelf && (
          <div className="pf-library">
            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="bookOpen" size={16} stroke={2} />Currently issued ({reading.length})</h2>
                <Link className="pf-link-btn" to="/books">Continue reading</Link>
              </div>
              {reading.length === 0 ? (
                <p className="pf-empty">No books in progress. Pick one from the library!</p>
              ) : (
                <ul className="pf-book-list">
                  {reading.map((book) => (
                    <BookRow
                      key={book.bookId}
                      book={book}
                      badge={{ label: 'reading', className: 'pf-badge--reading' }}
                      onDownload={toggleDownload}
                      downloaded={isDownloaded(book.bookId)}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="checkCircle" size={16} stroke={2} />Returned &amp; completed ({completed.length})</h2>
              </div>
              {completed.length === 0 ? (
                <p className="pf-empty">Books you finish will appear here.</p>
              ) : (
                <ul className="pf-book-list">
                  {completed.map((book) => (
                    <BookRow
                      key={book.bookId}
                      book={book}
                      badge={{ label: 'completed', className: 'pf-badge--done' }}
                      onDownload={toggleDownload}
                      downloaded={isDownloaded(book.bookId)}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="clock" size={16} stroke={2} />Borrowing history ({history.length})</h2>
              </div>
              {history.length === 0 ? (
                <p className="pf-empty">Your borrowing history will show up here.</p>
              ) : (
                <ul className="pf-history-list">
                  {history.map((item) => (
                    <li key={item.id} className="pf-history-row">
                      <BookCover cover={item.cover} title={item.title} />
                      <div className="pf-book-info">
                        <span className="pf-book-title">{item.title}</span>
                        <span className="pf-book-author">{item.author}{item.category ? ` · ${item.category}` : ''}</span>
                      </div>
                      <span className="pf-history-action">{HISTORY_LABELS[item.action] || 'Viewed'}</span>
                      <span className="pf-history-time">{timeAgo(item.viewedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="pf-section-grid">
              <section className="pf-card">
                <div className="pf-card-head">
                  <h2 className="pf-card-title"><Icon name="bookmark" size={16} stroke={2} />Bookmarked books ({bookmarks.length})</h2>
                </div>
                {bookmarks.length === 0 ? (
                  <p className="pf-empty">Saved books will show up here.</p>
                ) : (
                  <ul className="pf-book-list">
                    {bookmarks.map((book) => (
                      <BookRow
                        key={book.bookId}
                        book={book}
                        onDownload={toggleDownload}
                        downloaded={isDownloaded(book.bookId)}
                        onRemove={removeBookmark}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <section className="pf-card">
                <div className="pf-card-head">
                  <h2 className="pf-card-title"><Icon name="heart" size={16} stroke={2} />Favorites ({favorites.length})</h2>
                </div>
                {favorites.length === 0 ? (
                  <p className="pf-empty">Books you favorite will show up here.</p>
                ) : (
                  <ul className="pf-book-list">
                    {favorites.map((book) => (
                      <BookRow
                        key={book.bookId}
                        book={book}
                        onDownload={toggleDownload}
                        downloaded={isDownloaded(book.bookId)}
                        onRemove={removeFavorite}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="download" size={16} stroke={2} />Downloaded resources ({downloads.length})</h2>
                <span className="pf-card-count">Saved for offline reading</span>
              </div>
              {downloads.length === 0 ? (
                <p className="pf-empty">Download a book from any list to read it offline.</p>
              ) : (
                <ul className="pf-book-list">
                  {downloads.map((book) => (
                    <BookRow
                      key={book.bookId}
                      book={book}
                      onDownload={toggleDownload}
                      downloaded
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {tab === 'academics' && (
          <div className="pf-academics">
            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="user" size={16} stroke={2} />Personal information</h2>
                {isSelf && (
                  <button type="button" className="pf-link-btn" onClick={() => setEditOpen(true)}>
                    <Icon name="edit" size={14} stroke={2} />Edit
                  </button>
                )}
              </div>
              <ul className="pf-info-list">
                {personalRows.map((row) => (
                  <li key={row.label} className="pf-info-row">
                    <span className="pf-info-label">{row.label}</span>
                    {row.href && row.value ? (
                      <a className="pf-info-value pf-info-link" href={row.href} target="_blank" rel="noreferrer">{formatWebsite(row.value)}</a>
                    ) : (
                      <span className={`pf-info-value ${row.value ? '' : 'pf-info-value--muted'} ${row.label === 'Bio' ? 'pf-info-value--wrap' : ''}`}>
                        {row.value || 'Not set'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="cap" size={16} stroke={2} />Academic details</h2>
                {isSelf && (
                  <button type="button" className="pf-link-btn" onClick={() => setEditOpen(true)}>
                    <Icon name="edit" size={14} stroke={2} />Edit
                  </button>
                )}
              </div>
              <ul className="pf-info-list">
                {academicRows.map((row) => (
                  <li key={row.label} className="pf-info-row">
                    <span className="pf-info-label">{row.label}</span>
                    {row.badge ? (
                      <span className="pf-pill pf-pill--success">{row.value}</span>
                    ) : (
                      <span className={`pf-info-value ${row.value ? '' : 'pf-info-value--muted'}`}>
                        {row.value || 'Not set'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {profile.interests?.length > 0 && (
              <section className="pf-card">
                <div className="pf-card-head">
                  <h2 className="pf-card-title"><Icon name="star" size={16} stroke={2} />Interests</h2>
                </div>
                <div className="pf-chip-row">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="pf-chip pf-chip--on">{interest}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === 'community' && (
          <>
            {isSelf && <Composer me={profile} onPost={createPost} onToast={showToast} />}
            {posts.length === 0 ? (
              <div className="pf-card pf-empty-card">
                <p>{isSelf ? 'You have not posted anything yet.' : `${profile.name} has not posted anything yet.`}</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={likePost} onComment={commentPost} onDelete={deletePost} />
              ))
            )}
          </>
        )}

        {tab === 'settings' && isSelf && (
          <div className="pf-settings">
            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="user" size={16} stroke={2} />Account</h2>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Profile details</strong>
                  <span>Update your personal and academic information.</span>
                </div>
                <button type="button" className="pf-btn" onClick={() => setEditOpen(true)}>Edit profile</button>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Profile photo</strong>
                  <span>Upload a clear photo to personalize your account.</span>
                </div>
                <button type="button" className="pf-btn" onClick={() => avatarInput.current?.click()}>
                  <Icon name="camera" size={15} stroke={2} />Upload photo
                </button>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Cover photo</strong>
                  <span>Choose a banner image for your profile header.</span>
                </div>
                <button type="button" className="pf-btn" onClick={() => coverInput.current?.click()}>
                  <Icon name="camera" size={15} stroke={2} />Change cover
                </button>
              </div>
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="lock" size={16} stroke={2} />Change password</h2>
              </div>
              <PasswordForm onToast={showToast} />
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="shield" size={16} stroke={2} />Privacy settings</h2>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Profile visibility</strong>
                  <span>Who can view your academic profile and reading stats.</span>
                </div>
                <select className="pf-select pf-select--inline" value={privacy.profileVisibility} onChange={(e) => updatePrivacy({ profileVisibility: e.target.value })}>
                  <option value="institute">My institute</option>
                  <option value="course">My course</option>
                  <option value="private">Only me</option>
                </select>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Show email address</strong>
                  <span>Display your email on your public profile.</span>
                </div>
                <button
                  type="button"
                  className={`pf-toggle ${privacy.showEmail ? 'pf-toggle--on' : ''}`}
                  role="switch"
                  aria-checked={privacy.showEmail}
                  aria-label="Show email address"
                  onClick={() => updatePrivacy({ showEmail: !privacy.showEmail })}
                >
                  <span className="pf-toggle-knob" />
                </button>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Show reading activity</strong>
                  <span>Let others see what you are reading.</span>
                </div>
                <button
                  type="button"
                  className={`pf-toggle ${privacy.showReadingActivity ? 'pf-toggle--on' : ''}`}
                  role="switch"
                  aria-checked={privacy.showReadingActivity}
                  aria-label="Show reading activity"
                  onClick={() => updatePrivacy({ showReadingActivity: !privacy.showReadingActivity })}
                >
                  <span className="pf-toggle-knob" />
                </button>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Allow messages</strong>
                  <span>Let other members send you direct messages.</span>
                </div>
                <button
                  type="button"
                  className={`pf-toggle ${privacy.allowMessages ? 'pf-toggle--on' : ''}`}
                  role="switch"
                  aria-checked={privacy.allowMessages}
                  aria-label="Allow messages"
                  onClick={() => updatePrivacy({ allowMessages: !privacy.allowMessages })}
                >
                  <span className="pf-toggle-knob" />
                </button>
              </div>
            </section>

            <section className="pf-card">
              <div className="pf-card-head">
                <h2 className="pf-card-title"><Icon name="logout" size={16} stroke={2} />Session</h2>
              </div>
              <div className="pf-setting-row">
                <div className="pf-setting-info">
                  <strong>Log out</strong>
                  <span>Sign out of Learnova on this device.</span>
                </div>
                <button type="button" className="pf-btn pf-btn--danger" onClick={handleLogout}>
                  <Icon name="logout" size={15} stroke={2} />Log out
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {editOpen && (
        <EditModal
          profile={profile}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSave={saveProfile}
        />
      )}

      {toast && <div className="pf-toast">{toast}</div>}
    </div>
  )
}
