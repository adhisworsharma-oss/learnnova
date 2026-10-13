import { useState, useRef, useEffect, useMemo } from 'react'
import './Events.css'

const EVENTS_KEY = 'learnova_events_v1'
export { EVENTS_KEY }
export { DEMO_EVENTS }

/* Existing event records are preserved. dateISO/time mirror the stored display
   date so the same values render as before; uploads/image metadata are added
   as safe, backward-compatible optional fields. */
const DEMO_EVENTS = [
  {
    id: 1,
    title: 'CS Study Group — Algorithms',
    dateISO: '2026-09-05',
    time: '16:00',
    location: 'Library Room 204',
    isOnline: false,
    description: 'Weekly algorithms study session. Bringing practice problems on graph theory and dynamic programming.',
    attendees: 14,
    capacity: 40,
    visibility: 'Public',
    category: 'Study',
    isJoined: true,
  },
  {
    id: 2,
    title: 'Book Discussion: Atomic Habits',
    dateISO: '2026-09-08',
    time: '18:30',
    location: 'Online — Zoom',
    isOnline: true,
    description: 'Wrapping up our read of Atomic Habits. Come share your takeaways and how you\'ve applied the ideas.',
    attendees: 28,
    capacity: 60,
    visibility: 'Public',
    category: 'Discussion',
    isJoined: true,
  },
  {
    id: 3,
    title: 'Data Science Workshop',
    dateISO: '2026-09-12',
    time: '14:00',
    location: 'CS Building Lab 3',
    isOnline: false,
    description: 'Hands-on workshop covering data preprocessing with Python. Bring your laptop.',
    attendees: 22,
    capacity: 30,
    visibility: 'Public',
    category: 'Workshop',
    isJoined: false,
  },
  {
    id: 4,
    title: 'Design Thinking Sprint',
    dateISO: '2026-09-15',
    time: '10:00',
    location: 'Innovation Center',
    isOnline: false,
    description: 'Half-day design thinking workshop. Learn rapid prototyping and user research techniques.',
    attendees: 18,
    capacity: 25,
    visibility: 'Public',
    category: 'Workshop',
    isJoined: false,
  },
  {
    id: 5,
    title: 'End-of-Semester Reading Challenge',
    dateISO: '2026-09-20',
    time: '',
    location: 'Online',
    isOnline: true,
    description: 'Read 5 books in 30 days. Share progress and recommendations with the community.',
    attendees: 45,
    capacity: 100,
    visibility: 'Public',
    category: 'Challenge',
    isJoined: false,
  },
  {
    id: 6,
    title: 'Guest Lecture: AI in Education',
    dateISO: '2026-09-22',
    time: '15:00',
    location: 'Auditorium A',
    isOnline: false,
    description: 'Prof. Sarah Mitchell on how AI is reshaping learning platforms and personalized education.',
    attendees: 62,
    capacity: 120,
    visibility: 'Public',
    category: 'Lecture',
    isJoined: false,
  },
]

const CATEGORIES = ['All', 'Study', 'Discussion', 'Workshop', 'Challenge', 'Lecture']

/* Matcha-mint palette with beige / light-brown / ecru — no blue, purple or pink. */
const CATEGORY_THEME = {
  All: { accent: '#7FA46A', soft: '#EAF1E2', ink: '#455733', glyph: 'spark' },
  Study: { accent: '#7FA46A', soft: '#EAF1E2', ink: '#455733', glyph: 'cap' },
  Discussion: { accent: '#A9886A', soft: '#F1E9DE', ink: '#5C4632', glyph: 'chat' },
  Workshop: { accent: '#5E8C74', soft: '#E4EFE9', ink: '#33503F', glyph: 'tools' },
  Challenge: { accent: '#6FA98C', soft: '#E6F1EB', ink: '#2F5A46', glyph: 'trophy' },
  Lecture: { accent: '#9CAE86', soft: '#EEF1E5', ink: '#505C3C', glyph: 'lecture' },
}

const DEFAULT_THEME = CATEGORY_THEME.All

function themeFor(category) {
  return CATEGORY_THEME[category] || DEFAULT_THEME
}

const POSTER_SPEC = { width: 800, height: 450, fit: 'cover', maxChars: 340000 }
const BANNER_SPEC = { width: 1200, height: 400, fit: 'cover', maxChars: 460000 }
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function formatEventDate(dateISO, time) {
  if (!dateISO) return 'Date to be announced'
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return time ? `${dateStr} · ${to12Hour(time)}` : `${dateStr} · All Day`
}

function to12Hour(time) {
  const [hRaw, mRaw] = String(time).split(':')
  const h = Number(hRaw)
  if (Number.isNaN(h)) return time
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(mRaw || '00').padStart(2, '0')} ${suffix}`
}

function monthDay(dateISO) {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return { month: '', day: '' }
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.toLocaleDateString('en-US', { day: 'numeric' }),
  }
}

/* ------------------- image helpers (reuse established pattern) ------------------- */

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
    img.onerror = () => reject(new Error('That file is not a valid image.'))
    img.src = src
  })
}

function drawImage(img, { width, height, fit }, quality) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (fit === 'cover') {
    canvas.width = width
    canvas.height = height
    ctx.fillStyle = '#FAF7EF'
    ctx.fillRect(0, 0, width, height)
    const scale = Math.max(width / img.width, height / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
  } else {
    const scale = Math.min(1, width / img.width, height / img.height)
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  return canvas.toDataURL('image/jpeg', quality)
}

async function encodeImage(file, spec) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Use a JPG, JPEG, PNG or WebP image.')
  }
  if (file.size > 8 * 1024 * 1024) throw new Error('Image must be smaller than 8 MB.')
  const decoded = await loadImage(await fileToDataUrl(file))
  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = drawImage(decoded, spec, quality)
    if (dataUrl.length <= spec.maxChars) return dataUrl
  }
  throw new Error('That image is too large. Try a smaller one.')
}

/* ------------------- icons ------------------- */

const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.6" /><polyline points="21 15 16 10 5 21" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  check: <><polyline points="20 6 9 17 4 12" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  ticket: <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><line x1="14" y1="6" x2="14" y2="18" strokeDasharray="2 3" /></>,
  spark: <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
  chevron: <polyline points="6 9 12 15 18 9" />,
  arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" /></>,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  tools: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.7-2.7z" /></>,
  trophy: <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>,
  lecture: <><path d="M2 4h20v12H2z" /><path d="M12 16v4" /><path d="M8 20h8" /><path d="M7 9l3 2 7-4" /></>,
}

function Icon({ name, size = 18, stroke = 2, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

/* ------------------- media (poster / banner) ------------------- */

function EventMedia({ event, className, showBadge = true }) {
  const theme = themeFor(event.category)
  const src = event.poster || event.imageUrl || ''
  const { month, day } = monthDay(event.dateISO)

  return (
    <div
      className={`ev-media ${className}`}
      style={{ '--accent': theme.accent, '--accent-soft': theme.soft, '--accent-ink': theme.ink }}
    >
      <div className="ev-media-fallback" aria-hidden="true">
        <Icon name={theme.glyph} size={92} stroke={1.1} className="ev-media-glyph" />
      </div>
      {src && (
        <img
          className="ev-media-img"
          src={src}
          alt={`${event.title} cover`}
          loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      )}
      <div className="ev-media-scrim" aria-hidden="true" />
      {showBadge && (
        <span className="ev-badge" style={{ background: theme.accent }}>
          <Icon name={theme.glyph} size={12} stroke={2.2} />
          {event.category}
        </span>
      )}
      {month && (
        <span className="ev-date-pill">
          <span className="ev-date-month">{month}</span>
          <span className="ev-date-day">{day}</span>
        </span>
      )}
    </div>
  )
}

/* ------------------- event card ------------------- */

function EventCard({ event, onOpen, onJoin, onEdit, pending }) {
  const theme = themeFor(event.category)
  const full = event.capacity ? event.attendees >= event.capacity : false

  return (
    <article
      className="ev-card"
      style={{ '--accent': theme.accent, '--accent-soft': theme.soft, '--accent-ink': theme.ink }}
      onClick={() => onOpen(event)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(event) } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${event.title}`}
    >
      <EventMedia event={event} className="ev-card-media" />

      <div className="ev-card-body">
        <h3 className="ev-card-title">{event.title}</h3>
        <p className="ev-card-desc">{event.description}</p>

        <ul className="ev-card-meta">
          <li><Icon name="calendar" size={15} /> {formatEventDate(event.dateISO, event.time)}</li>
          <li>
            <Icon name={event.isOnline ? 'globe' : 'pin'} size={15} />
            {event.location || (event.isOnline ? 'Online' : 'Location TBA')}
          </li>
          <li><Icon name="users" size={15} /> {event.attendees} going{event.capacity ? ` · ${event.capacity} spots` : ''}</li>
        </ul>

        <div className="ev-card-foot">
          <span className={`ev-status ${event.isJoined ? 'ev-status--going' : full ? 'ev-status--full' : 'ev-status--open'}`}>
            {event.isJoined ? 'You are going' : full ? 'Event full' : 'Registration open'}
          </span>
          <div className="ev-card-actions">
            <button
              className="ev-icon-btn"
              onClick={e => { e.stopPropagation(); onEdit(event) }}
              aria-label={`Edit ${event.title}`}
              title="Edit event"
            >
              <Icon name="edit" size={15} />
            </button>
            <button
              className={`ev-join ${event.isJoined ? 'ev-join--going' : ''}`}
              onClick={e => { e.stopPropagation(); onJoin(event.id) }}
              disabled={pending || (!event.isJoined && full)}
            >
              {pending
                ? 'Saving…'
                : event.isJoined
                  ? <><Icon name="check" size={15} stroke={2.6} /> Going</>
                  : <><Icon name="ticket" size={15} /> Join Event</>}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ------------------- image field ------------------- */

function ImageField({ label, hint, aspect, spec, value, onChange, onError, disabled }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      onChange(await encodeImage(file, spec))
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ev-field">
      <span className="ev-field-label">{label}</span>
      <div className="ev-upload">
        <div className="ev-upload-preview" style={{ aspectRatio: aspect }}>
          {value ? (
            <img src={value} alt={`${label} preview`} />
          ) : (
            <div className="ev-upload-empty">
              <Icon name="image" size={26} stroke={1.6} />
              <span>{hint}</span>
            </div>
          )}
          {busy && <div className="ev-upload-busy"><span className="ev-spinner" /> Processing…</div>}
        </div>
        <div className="ev-upload-actions">
          <button
            type="button"
            className="ev-upload-btn"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
          >
            <Icon name="upload" size={15} />
            {value ? 'Replace' : 'Upload image'}
          </button>
          {value && (
            <button type="button" className="ev-upload-btn ev-upload-btn--ghost" onClick={() => onChange('')} disabled={disabled || busy}>
              <Icon name="x" size={14} /> Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          hidden
          onChange={handleFile}
        />
      </div>
    </div>
  )
}

/* ------------------- create / edit form ------------------- */

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Study',
  dateISO: '',
  time: '',
  location: '',
  isOnline: false,
  capacity: '',
  visibility: 'Public',
  poster: '',
  banner: '',
  imageUrl: '',
}

function formFromEvent(event) {
  if (!event) return { ...EMPTY_FORM }
  return {
    title: event.title || '',
    description: event.description || '',
    category: event.category || 'Study',
    dateISO: event.dateISO || '',
    time: event.time || '',
    location: event.location || '',
    isOnline: Boolean(event.isOnline),
    capacity: event.capacity ? String(event.capacity) : '',
    visibility: event.visibility || 'Public',
    poster: event.poster || '',
    banner: event.banner || '',
    imageUrl: event.imageUrl || '',
  }
}

function EventForm({ event, onSubmit, onCancel, onError }) {
  const [form, setForm] = useState(() => formFromEvent(event))
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Give your event a title.'
    if (!form.dateISO) next.dateISO = 'Pick an event date.'
    if (form.capacity !== '') {
      const n = Number(form.capacity)
      if (!Number.isInteger(n) || n <= 0) next.capacity = 'Capacity must be a positive number.'
    }
    if (form.imageUrl.trim()) {
      try {
        const parsed = new URL(form.imageUrl.trim())
        if (!/^https?:$/.test(parsed.protocol)) next.imageUrl = 'Image URL must start with http or https.'
      } catch {
        next.imageUrl = 'Enter a valid image URL.'
      }
    }
    return next
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) {
      onError('Please fix the highlighted fields.')
      return
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dateISO: form.dateISO,
      time: form.time,
      location: form.location.trim(),
      isOnline: form.isOnline,
      capacity: form.capacity ? Number(form.capacity) : null,
      visibility: form.visibility,
      poster: form.poster,
      banner: form.banner,
      imageUrl: form.imageUrl.trim(),
    })
  }

  return (
    <form className="ev-form" onSubmit={handleSubmit} noValidate>
      <div className="ev-form-section">
        <h3 className="ev-form-heading"><span className="ev-form-step">1</span> Event information</h3>

        <label className="ev-input">
          <span className="ev-field-label">Event title</span>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Calculus Study Jam"
            className={errors.title ? 'is-invalid' : ''}
          />
          {errors.title && <span className="ev-error">{errors.title}</span>}
        </label>

        <label className="ev-input">
          <span className="ev-field-label">Description</span>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What will happen at this event?"
            rows={3}
          />
        </label>

        <div className="ev-input-row">
          <label className="ev-input">
            <span className="ev-field-label">Category</span>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="ev-input">
            <span className="ev-field-label">Date</span>
            <input
              type="date"
              value={form.dateISO}
              onChange={e => set('dateISO', e.target.value)}
              className={errors.dateISO ? 'is-invalid' : ''}
            />
            {errors.dateISO && <span className="ev-error">{errors.dateISO}</span>}
          </label>
        </div>

        <div className="ev-input-row">
          <label className="ev-input">
            <span className="ev-field-label">Time <em>(optional)</em></span>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </label>
          <label className="ev-input">
            <span className="ev-field-label">Visibility</span>
            <span className="ev-select-wrap">
              <Icon name={form.visibility === 'Private' ? 'lock' : 'globe'} size={15} />
              <select value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </span>
          </label>
        </div>

        <label className="ev-input">
          <span className="ev-field-label">Location / meeting details</span>
          <input
            type="text"
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder={form.isOnline ? 'Meeting link (Zoom, Meet…)' : 'Room, building or venue'}
          />
        </label>

        <label className="ev-check">
          <input type="checkbox" checked={form.isOnline} onChange={e => set('isOnline', e.target.checked)} />
          <span>This is an online event</span>
        </label>
      </div>

      <div className="ev-form-section">
        <h3 className="ev-form-heading"><span className="ev-form-step">2</span> Event visuals</h3>

        <ImageField
          label="Event poster / cover"
          hint="JPG, PNG or WebP · 16:9 recommended"
          aspect="16 / 9"
          spec={POSTER_SPEC}
          value={form.poster}
          onChange={v => set('poster', v)}
          onError={onError}
        />

        <ImageField
          label="Event banner (optional)"
          hint="Wide banner image · 3:1 recommended"
          aspect="3 / 1"
          spec={BANNER_SPEC}
          value={form.banner}
          onChange={v => set('banner', v)}
          onError={onError}
        />

        <label className="ev-input">
          <span className="ev-field-label">Image URL <em>(optional alternative to uploading)</em></span>
          <input
            type="url"
            value={form.imageUrl}
            onChange={e => set('imageUrl', e.target.value)}
            placeholder="https://example.com/poster.jpg"
            className={errors.imageUrl ? 'is-invalid' : ''}
          />
          {errors.imageUrl && <span className="ev-error">{errors.imageUrl}</span>}
        </label>
      </div>

      <div className="ev-form-section">
        <h3 className="ev-form-heading"><span className="ev-form-step">3</span> Event settings</h3>
        <label className="ev-input">
          <span className="ev-field-label">Registration capacity <em>(optional)</em></span>
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={e => set('capacity', e.target.value)}
            placeholder="Leave empty for unlimited"
            className={errors.capacity ? 'is-invalid' : ''}
          />
          {errors.capacity && <span className="ev-error">{errors.capacity}</span>}
        </label>
      </div>

      <div className="ev-form-actions">
        <button type="submit" className="ev-submit">
          <Icon name={event ? 'check' : 'plus'} size={16} stroke={2.4} />
          {event ? 'Save changes' : 'Create event'}
        </button>
        {event && (
          <button type="button" className="ev-cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  )
}

/* ------------------- details modal ------------------- */

function EventModal({ event, onClose, onJoin, onEdit, pending }) {
  const theme = themeFor(event.category)
  const full = event.capacity ? event.attendees >= event.capacity : false
  const banner = event.banner

  return (
    <div className="ev-modal" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ev-modal-card" role="dialog" aria-modal="true" aria-label={event.title}>
        <button className="ev-modal-close" onClick={onClose} aria-label="Close">
          <Icon name="x" size={16} />
        </button>

        {banner ? (
          <div className="ev-modal-banner"><img src={banner} alt="" onError={e => { e.currentTarget.style.display = 'none' }} /></div>
        ) : (
          <EventMedia event={event} className="ev-modal-media" />
        )}

        <div className="ev-modal-body">
          <span className="ev-modal-badge" style={{ background: theme.soft, color: theme.ink }}>
            <Icon name={theme.glyph} size={13} stroke={2.2} /> {event.category}
          </span>
          <h2>{event.title}</h2>
          <p className="ev-modal-desc">{event.description}</p>

          <ul className="ev-modal-meta">
            <li><Icon name="calendar" size={16} /> {formatEventDate(event.dateISO, event.time)}</li>
            <li><Icon name={event.isOnline ? 'globe' : 'pin'} size={16} /> {event.location || (event.isOnline ? 'Online' : 'Location TBA')}</li>
            <li><Icon name="users" size={16} /> {event.attendees} going{event.capacity ? ` · ${event.capacity} spots` : ''}</li>
            <li><Icon name={event.visibility === 'Private' ? 'lock' : 'globe'} size={16} /> {event.visibility} event</li>
          </ul>

          <div className="ev-modal-actions">
            <button
              className={`ev-join ev-join--lg ${event.isJoined ? 'ev-join--going' : ''}`}
              onClick={() => onJoin(event.id)}
              disabled={pending || (!event.isJoined && full)}
            >
              {pending
                ? 'Saving…'
                : event.isJoined
                  ? <><Icon name="check" size={16} stroke={2.6} /> You are going</>
                  : full
                    ? 'Event full'
                    : <><Icon name="ticket" size={16} /> Join Event</>}
            </button>
            <button className="ev-edit-lg" onClick={() => onEdit(event)}>
              <Icon name="edit" size={16} /> Edit event
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------- main component ------------------- */

export default function Events() {
  const [events, setEvents] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(EVENTS_KEY) || 'null')
      if (Array.isArray(stored) && stored.length) return stored
    } catch {
      /* fall through to seed */
    }
    return DEMO_EVENTS
  })
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [toast, setToast] = useState(null)
  const asideRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    } catch {
      /* storage may be full; keep working in-memory */
    }
  }, [events])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const counts = useMemo(() => {
    const total = events.reduce((sum, e) => sum + e.attendees, 0)
    const going = events.filter(e => e.isJoined).length
    const online = events.filter(e => e.isOnline).length
    return { total, going, online }
  }, [events])

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    return events.filter(e => {
      const matchCat = filter === 'All' || e.category === filter
      const hay = `${e.title} ${e.description} ${e.location} ${e.category}`.toLowerCase()
      return matchCat && (!term || hay.includes(term))
    })
  }, [events, filter, searchQuery])

  function notify(text, tone = 'neutral') {
    setToast({ text, tone })
  }

  function toggleJoin(id) {
    if (pendingId) return
    const current = events.find(e => e.id === id)
    if (!current) return
    if (!current.isJoined && current.capacity && current.attendees >= current.capacity) {
      notify('This event has reached full capacity.')
      return
    }
    setPendingId(id)
    window.setTimeout(() => {
      setEvents(prev => prev.map(e => {
        if (e.id !== id) return e
        const joined = !e.isJoined
        return { ...e, isJoined: joined, attendees: joined ? e.attendees + 1 : Math.max(0, e.attendees - 1) }
      }))
      setActiveEvent(prev => {
        if (!prev || prev.id !== id) return prev
        const joined = !prev.isJoined
        return { ...prev, isJoined: joined, attendees: joined ? prev.attendees + 1 : Math.max(0, prev.attendees - 1) }
      })
      setPendingId(null)
      notify(current.isJoined ? 'Registration cancelled.' : 'You are registered. See you there!', current.isJoined ? 'neutral' : 'success')
    }, 450)
  }

  function startCreate() {
    setEditing(null)
    setPanelOpen(true)
    window.setTimeout(() => asideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function startEdit(event) {
    setEditing(event)
    setPanelOpen(true)
    setActiveEvent(null)
    window.setTimeout(() => asideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function upsertEvent(payload) {
    if (editing) {
      setEvents(prev => prev.map(e => e.id === editing.id ? { ...e, ...payload } : e))
      setActiveEvent(prev => (prev && prev.id === editing.id ? { ...prev, ...payload } : prev))
      notify('Event updated.', 'success')
      setEditing(null)
      setPanelOpen(false)
      return
    }
    const id = Date.now()
    const created = {
      id,
      ...payload,
      attendees: 0,
      isJoined: false,
    }
    setEvents(prev => [created, ...prev])
    notify('Event created and published.', 'success')
    setPanelOpen(false)
  }

  return (
    <div className="ev-page">
      <header className="ev-header">
        <div className="ev-header-copy">
          <span className="ev-eyebrow"><Icon name="spark" size={13} /> Learnova Events</span>
          <h1>Study sessions, workshops, and meetups</h1>
          <p>Discover vibrant campus events, join a session, and learn together with the community.</p>
        </div>
        <button className="ev-new" onClick={startCreate}>
          <Icon name="plus" size={16} stroke={2.4} />
          New Event
        </button>
      </header>

      <div className="ev-stats">
        <div className="ev-stat">
          <span className="ev-stat-value">{events.length}</span>
          <span className="ev-stat-label">Events</span>
        </div>
        <span className="ev-stat-sep" />
        <div className="ev-stat">
          <span className="ev-stat-value">{counts.total}</span>
          <span className="ev-stat-label">Participants</span>
        </div>
        <span className="ev-stat-sep" />
        <div className="ev-stat">
          <span className="ev-stat-value">{counts.going}</span>
          <span className="ev-stat-label">You’re going to</span>
        </div>
        <span className="ev-stat-sep" />
        <div className="ev-stat">
          <span className="ev-stat-value">{counts.online}</span>
          <span className="ev-stat-label">Online</span>
        </div>
      </div>

      <div className="ev-toolbar">
        <div className="ev-search">
          <Icon name="search" size={17} />
          <input
            type="text"
            placeholder="Search events by title, place or topic…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search events"
          />
          {searchQuery && (
            <button className="ev-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
        <div className="ev-filters" role="tablist" aria-label="Event categories">
          {CATEGORIES.map(c => {
            const theme = themeFor(c)
            const active = filter === c
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                className={`ev-filter ${active ? 'ev-filter--active' : ''}`}
                style={active ? { background: theme.accent, color: '#fff' } : { color: theme.ink, background: theme.soft }}
                onClick={() => setFilter(c)}
              >
                <Icon name={theme.glyph} size={14} stroke={2} />
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <div className="ev-layout">
        <main className="ev-main">
          {filtered.length > 0 ? (
            <div className="ev-grid">
              {filtered.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpen={setActiveEvent}
                  onJoin={toggleJoin}
                  onEdit={startEdit}
                  pending={pendingId === event.id}
                />
              ))}
            </div>
          ) : (
            <div className="ev-empty">
              <div className="ev-empty-icon"><Icon name="calendar" size={34} stroke={1.6} /></div>
              <h3>No events found</h3>
              <p>Try a different search or category — or create a new event.</p>
              <button className="ev-new ev-new--ghost" onClick={startCreate}>
                <Icon name="plus" size={15} stroke={2.4} /> Create an event
              </button>
            </div>
          )}
        </main>

        <aside className={`ev-aside ${panelOpen ? 'ev-aside--open' : ''}`} ref={asideRef}>
          <div className="ev-panel">
            <div className="ev-panel-head">
              <div>
                <span className="ev-panel-kicker">{editing ? 'Edit event' : 'Add new event'}</span>
                <h2>{editing ? 'Update this event' : 'Create an event'}</h2>
              </div>
              <button className="ev-panel-toggle" onClick={() => setPanelOpen(o => !o)} aria-expanded={panelOpen}>
                <Icon name="chevron" size={16} />
              </button>
            </div>
            {panelOpen ? (
              <EventForm
                key={editing ? `edit-${editing.id}` : 'create'}
                event={editing}
                onSubmit={upsertEvent}
                onCancel={() => { setEditing(null); setPanelOpen(false) }}
                onError={msg => notify(msg)}
              />
            ) : (
              <div className="ev-panel-collapsed">
                <Icon name="image" size={26} stroke={1.5} />
                <p>Open the panel to add an event with a poster image, schedule details and registration settings.</p>
                <button className="ev-submit" onClick={() => setPanelOpen(true)}>
                  <Icon name="plus" size={15} stroke={2.4} /> Add new event
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          onJoin={toggleJoin}
          onEdit={startEdit}
          pending={pendingId === activeEvent.id}
        />
      )}

      {toast && (
        <div className={`ev-toast ${toast.tone === 'success' ? 'ev-toast--success' : ''}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      )}
    </div>
  )
}
