import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { GROUPS } from './Groups.jsx'
import { EVENTS_KEY, DEMO_EVENTS } from './Events.jsx'
import './Dashboard.css'

/* ============================================================
   Helpers
   ============================================================ */

const STALE_SLACK = 3 * 60 * 1000

const AVATAR_TONES = ['#687F5C', '#7E6B4F', '#5E8C74', '#8A9B77', '#9A7B57', '#40553B']

function avatarTone(seed) {
  const s = String(seed || '')
  let sum = 0
  for (let i = 0; i < s.length; i += 1) sum += s.charCodeAt(i)
  return AVATAR_TONES[sum % AVATAR_TONES.length]
}

function readStore(key, fb) {
  try {
    const raw = JSON.parse(localStorage.getItem(key))
    return raw ?? fb
  } catch {
    return fb
  }
}

function formatHM(ms) {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (totalMin === 0) return '0m'
  return h === 0 ? `${m}m` : `${h}h ${m}m`
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

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

function formatEventDate(iso) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function todayISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function readingLabel(action) {
  const map = {
    opened: 'opened',
    started: 'started reading',
    completed: 'finished reading',
    favorited: 'favorited',
    bookmarked: 'bookmarked',
  }
  return map[action] || 'explored'
}

/* ------------------- image helpers (established pattern) ------------------- */

const POST_SPEC = { width: 1000, height: 1000, fit: 'fit', maxChars: 850000 }

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
    img.onerror = () => reject(new Error('That file could not be loaded as an image.'))
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
  }
  throw new Error('That image is too large. Try a smaller photo.')
}

/* ============================================================
   Icons
   ============================================================ */

const PATHS = {
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  play: <polygon points="5 3 19 12 5 21 5 3" />,
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  edit: <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />,
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  check: <polyline points="20 6 9 17 4 12" />,
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
}

function Icon({ name, size = 18, stroke = 2, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

function Avatar({ src, name, tone, size = 'md' }) {
  const initial = String(name || 'U').trim().charAt(0).toUpperCase()
  if (src) {
    return <img className={`hm-avatar hm-avatar--img hm-avatar--${size}`} src={src} alt="" />
  }
  return <div className={`hm-avatar hm-avatar--${size}`} style={{ background: tone || '#687F5C' }}>{initial}</div>
}

/* ============================================================
   Study-time tracker (per authenticated user)
   ============================================================ */

function useStudyTracker({ userId }) {
  const cacheKey = userId ? `learnova_study_${userId}` : null
  const goalKey = userId ? `learnova_goal_${userId}` : null

  const [cur, setCur] = useState(() => {
    const cached = cacheKey ? readStore(cacheKey, {}) : {}
    return {
      phase: cached.phase === 'running' || cached.phase === 'paused' ? cached.phase : 'idle',
      serverId: cached.serverId || null,
      trackStart: cached.trackStart || 0,
      pausedAt: cached.pausedAt || null,
    }
  })
  const [sessions, setSessions] = useState([])
  const [synced, setSynced] = useState(false)
  const [nowMs, setNowMs] = useState(0)
  const [goal, setGoalState] = useState(() => {
    const raw = goalKey ? readStore(goalKey, 60) : 60
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : 60
  })

  // Mirror so timers and short-lived handlers can read the latest snapshot
  // without stale closures (never accessed during render).
  const curRef = useRef(cur)
  useEffect(() => {
    curRef.current = cur
  }, [cur])

  // Keep the active-session snapshot in localStorage on every change.
  useEffect(() => {
    if (!cacheKey) return
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cur))
    } catch {
      /* ignore quota/availability errors */
    }
  }, [cacheKey, cur])

  // One-second clock that drives the elapsed timer display.
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const start = useCallback(async () => {
    const now = Date.now()
    setCur((prev) => (prev.phase === 'running' ? prev : { ...prev, phase: 'running', trackStart: now, pausedAt: null }))
    try {
      const res = await api('/study/sessions', { method: 'POST', body: { startedAt: new Date(now).toISOString() } })
      setCur((prev) => (prev.phase === 'running' && !prev.serverId ? { ...prev, serverId: res.session.id } : prev))
    } catch {
      /* keep local-only tracking when offline or blocked */
    }
  }, [])

  const pause = useCallback(async () => {
    const c = curRef.current
    if (c.phase !== 'running') return
    const now = Date.now()
    setCur((prev) => (prev.phase === 'running' ? { ...prev, phase: 'paused', pausedAt: now } : prev))
    if (c.serverId) {
      try {
        await api(`/study/sessions/${c.serverId}/heartbeat`, { method: 'POST', body: { lastActiveAt: new Date(now).toISOString() } })
      } catch {
        /* server optional while tracking locally */
      }
    }
  }, [])

  const resume = useCallback(async () => {
    const c = curRef.current
    if (c.phase !== 'paused') return
    const now = Date.now()
    const gap = Math.max(0, now - (c.pausedAt || now))
    const trackStart = c.trackStart + gap
    setCur((prev) => (prev.phase === 'paused' ? { ...prev, phase: 'running', trackStart } : prev))
    if (c.serverId) {
      try {
        await api(`/study/sessions/${c.serverId}/heartbeat`, {
          method: 'POST',
          body: { lastActiveAt: new Date(now).toISOString(), startedAt: new Date(trackStart).toISOString() },
        })
      } catch {
        /* keep local timer */
      }
    } else {
      try {
        const res = await api('/study/sessions', { method: 'POST', body: { startedAt: new Date(trackStart).toISOString() } })
        setCur((prev) => (prev.phase === 'running' && !prev.serverId ? { ...prev, serverId: res.session.id } : prev))
      } catch {
        /* keep local timer */
      }
    }
  }, [])

  const end = useCallback(async () => {
    const c = curRef.current
    if (c.phase === 'idle') return
    const now = Date.now()
    const dur = Math.max(0, (c.phase === 'running' ? now : (c.pausedAt || now)) - c.trackStart)
    const record = {
      id: c.serverId || String(Date.now()),
      state: 'ended',
      startedAt: new Date(c.trackStart).toISOString(),
      endedAt: new Date(now).toISOString(),
      durationMs: dur,
    }
    setSessions((prev) => [record, ...prev])
    if (c.serverId) {
      try {
        await api(`/study/sessions/${c.serverId}/end`, { method: 'POST', body: { endedAt: record.endedAt, durationMs: dur } })
      } catch {
        /* keep the record locally */
      }
    }
    setCur((prev) => ({ ...prev, phase: 'idle', trackStart: 0, pausedAt: null, serverId: null }))
  }, [])

  // Auto-pause when the tab is hidden so hidden time is never counted.
  useEffect(() => {
    if (cur.phase !== 'running') return
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [cur.phase, pause])

  // Heartbeats keep the server session alive while the timer is running.
  useEffect(() => {
    if (cur.phase !== 'running' || !cur.serverId) return
    const id = setInterval(() => {
      const c = curRef.current
      if (c.phase !== 'running' || !c.serverId) return
      api(`/study/sessions/${c.serverId}/heartbeat`, { method: 'POST', body: { lastActiveAt: new Date().toISOString() } }).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [cur.phase, cur.serverId])

  // Restore an active session and load saved history after a refresh.
  useEffect(() => {
    let cancelled = false
    const extra = []
    async function restore() {
      try {
        const res = await api('/study/summary')
        if (cancelled) return
        setSessions(res.sessions || [])
        const c = curRef.current
        if (c.phase === 'running' && c.trackStart) {
          const gap = Math.max(0, Date.now() - c.trackStart)
          if (gap <= STALE_SLACK) {
            const serverActive = res.active || null
            if (serverActive && serverActive.id !== c.serverId && serverActive.lastActiveAt) {
              const cut = new Date(serverActive.lastActiveAt).getTime()
              extra.push({
                id: `stale-${serverActive.id}`,
                state: 'ended',
                startedAt: serverActive.startedAt,
                endedAt: serverActive.lastActiveAt,
                durationMs: Math.max(0, cut - new Date(serverActive.startedAt).getTime()),
              })
            }
            return
          }
          // Abruptly closed while "running": pause at the last reported activity.
          const serverActive = res.active || null
          const cut = serverActive && serverActive.id === c.serverId && serverActive.lastActiveAt
            ? new Date(serverActive.lastActiveAt).getTime()
            : Date.now() - Math.min(gap, STALE_SLACK)
          setCur((prev) => (prev.phase === 'running' ? { ...prev, phase: 'paused', pausedAt: cut } : prev))
          return
        }
        if (c.phase === 'paused' && res.active && res.active.id !== c.serverId) {
          const cut = new Date(res.active.lastActiveAt).getTime()
          extra.push({
            id: `stale-${res.active.id}`,
            state: 'ended',
            startedAt: res.active.startedAt,
            endedAt: res.active.lastActiveAt,
            durationMs: Math.max(0, cut - new Date(res.active.startedAt).getTime()),
          })
        }
      } catch {
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) {
          if (extra.length) setSessions((prev) => [...extra, ...prev])
          setSynced(true)
        }
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [cacheKey])

  const currentElapsed = useMemo(() => {
    if (cur.phase === 'running') return Math.max(0, nowMs - cur.trackStart)
    if (cur.phase === 'paused') return Math.max(0, (cur.pausedAt || nowMs) - cur.trackStart)
    return 0
  }, [cur, nowMs])

  const totals = useMemo(() => {
    let total = 0
    let week = 0
    let today = 0
    const nowDate = new Date()
    const startOfDay = new Date(nowDate)
    startOfDay.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - 6)
    const days = []
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      days.push({ key: d.toDateString(), label: d.toLocaleDateString('en-US', { weekday: 'short' }), ms: 0 })
    }
    const byDay = new Map(days.map((d) => [d.key, d]))
    for (const s of sessions) {
      const start = s.startedAt ? new Date(s.startedAt) : new Date()
      if (Number.isNaN(start.getTime())) continue
      const ms = Number(s.durationMs) || 0
      total += ms
      if (start >= startOfWeek) week += ms
      if (start >= startOfDay) today += ms
      const entry = byDay.get(start.toDateString())
      if (entry) entry.ms += ms
    }
    today += currentElapsed
    week += currentElapsed
    total += currentElapsed
    const liveEntry = byDay.get(new Date().toDateString())
    if (liveEntry) liveEntry.ms += currentElapsed
    return { total, week, today, days: days.map((d) => ({ ...d })) }
  }, [sessions, currentElapsed])

  const setGoal = useCallback((value) => {
    const clamped = Math.max(5, Math.min(480, Math.round(value)))
    setGoalState(clamped)
    if (goalKey) {
      try {
        localStorage.setItem(goalKey, String(clamped))
      } catch {
        /* ignore storage errors */
      }
    }
  }, [goalKey])

  return { phase: cur.phase, sessions, synced, currentElapsed, totals, goal, setGoal, start, pause, resume, end }
}

/* ============================================================
   Small dashboard sections
   ============================================================ */

function SectionHeading({ icon, title, action, href }) {
  return (
    <div className="hm-section-head">
      <span className="hm-section-icon"><Icon name={icon} size={16} /></span>
      <h2 className="hm-section-title">{title}</h2>
      {action && href && <Link to={href} className="hm-section-link">{action}<Icon name="arrowRight" size={14} /></Link>}
    </div>
  )
}

function StudyCard({ tracker }) {
  const { phase, currentElapsed, totals, goal, setGoal, start, pause, resume, end } = tracker
  const maxDay = Math.max(1, ...totals.days.map((d) => d.ms))
  const goalPct = Math.min(100, (totals.today / (goal * 60000)) * 100)

  return (
    <section className="hm-card hm-study">
      <SectionHeading icon="timer" title="Study Time" />
      <div className="hm-study-body">
        <div className="hm-study-totals">
          <div className="hm-study-stat">
            <span className="hm-study-stat-label">Today</span>
            <strong>{formatHM(totals.today)}</strong>
          </div>
          <div className="hm-study-sep" />
          <div className="hm-study-stat">
            <span className="hm-study-stat-label">This week</span>
            <strong>{formatHM(totals.week)}</strong>
          </div>
          <div className="hm-study-sep" />
          <div className="hm-study-stat hm-study-stat--live">
            <span className="hm-study-stat-label">{phase === 'idle' ? 'Last session' : phase === 'paused' ? 'Paused' : 'Current session'}</span>
            <strong className="hm-timer">
              <span className={`hm-timer-dot ${phase === 'running' ? 'hm-timer-dot--on' : ''}`} />
              {formatClock(currentElapsed)}
            </strong>
          </div>
        </div>

        <div className="hm-study-actions">
          {phase === 'running' ? (
            <>
              <button type="button" className="hm-btn hm-btn--ghost" onClick={pause}><Icon name="pause" size={15} />Pause</button>
              <button type="button" className="hm-btn hm-btn--stop" onClick={end}><Icon name="stop" size={15} />End session</button>
            </>
          ) : phase === 'paused' ? (
            <>
              <button type="button" className="hm-btn hm-btn--primary" onClick={resume}><Icon name="play" size={15} />Resume</button>
              <button type="button" className="hm-btn hm-btn--ghost" onClick={end}><Icon name="stop" size={15} />End</button>
            </>
          ) : (
            <button type="button" className="hm-btn hm-btn--primary" onClick={start}><Icon name="play" size={15} />Start study session</button>
          )}
        </div>

        <div className="hm-study-goal">
          <div className="hm-goal-top">
            <span className="hm-goal-label"><Icon name="target" size={13} />Today's goal</span>
            <span className="hm-goal-value">{formatHM(totals.today)} <em>of</em> {goal} min</span>
          </div>
          <div className="hm-progress hm-progress--goal"><div className="hm-progress-fill" style={{ width: `${goalPct}%` }} /></div>
          <div className="hm-goal-adjust">
            <span>Adjust daily goal</span>
            <div className="hm-goal-adjust-ctr">
              <button type="button" onClick={() => setGoal(goal - 5)} aria-label="Decrease goal">−</button>
              <button type="button" onClick={() => setGoal(goal + 5)} aria-label="Increase goal">+</button>
            </div>
          </div>
        </div>

        <div className="hm-week">
          <div className="hm-week-title">Last 7 days</div>
          <div className="hm-week-bars">
            {totals.days.map((d) => (
              <div key={d.key} className="hm-week-col" title={`${d.label}: ${formatHM(d.ms)}`}>
                <div className="hm-week-bar-track"><div className="hm-week-bar" style={{ height: `${Math.max(4, (d.ms / maxDay) * 100)}%` }} /></div>
                <span className="hm-week-label">{d.label.charAt(0)}</span>
              </div>
            ))}
          </div>
          <p className="hm-study-note">Time is counted only while you're on Learnova with the timer running. Hidden tabs are paused automatically.</p>
        </div>
      </div>
    </section>
  )
}

function QuickActions({ onStartStudy, onOpenComposer }) {
  const items = [
    { id: 'books', label: 'Browse E-books', href: '/books', icon: 'book' },
    { id: 'reading', label: 'Continue Reading', href: '/books', icon: 'bookOpen' },
    { id: 'groups', label: 'Explore Groups', href: '/groups', icon: 'users' },
    { id: 'events', label: 'Upcoming Events', href: '/events', icon: 'calendar' },
    { id: 'post', label: 'Create Post', icon: 'edit', onClick: onOpenComposer },
    { id: 'study', label: 'Start Study Session', icon: 'zap', onClick: onStartStudy },
  ]
  return (
    <section className="hm-card hm-actions">
      <SectionHeading icon="zap" title="Quick Actions" />
      <div className="hm-action-grid">
        {items.map((it) =>
          it.onClick ? (
            <button key={it.id} type="button" className="hm-action" onClick={it.onClick}>
              <span className="hm-action-icon"><Icon name={it.icon} size={17} /></span>
              <span className="hm-action-label">{it.label}</span>
            </button>
          ) : (
            <Link key={it.id} to={it.href} className="hm-action">
              <span className="hm-action-icon"><Icon name={it.icon} size={17} /></span>
              <span className="hm-action-label">{it.label}</span>
            </Link>
          )
        )}
      </div>
    </section>
  )
}

function BookCover({ cover }) {
  const [failed, setFailed] = useState(false)
  if (cover && !failed) {
    return <img className="hm-book-cover" src={cover} alt="" loading="lazy" onError={() => setFailed(true)} />
  }
  return (
    <div className="hm-book-cover hm-book-cover--fallback" aria-hidden="true">
      <Icon name="book" size={20} />
    </div>
  )
}

function ReadingSection({ books, ready }) {
  if (ready && books.length === 0) {
    return (
      <section className="hm-card hm-reading">
        <SectionHeading icon="bookOpen" title="Continue Reading" action="Browse library" href="/books" />
        <div className="hm-reading-empty">
          <span className="hm-empty-icon"><Icon name="bookOpen" size={22} /></span>
          <p>You're not in the middle of any book right now. Head to the Library to pick up where you left off or start something new.</p>
          <Link to="/books" className="hm-btn hm-btn--primary hm-btn--sm">Go to Library</Link>
        </div>
      </section>
    )
  }
  if (!ready) {
    return (
      <section className="hm-card hm-reading">
        <SectionHeading icon="bookOpen" title="Continue Reading" />
        <div className="hm-skeleton hm-skeleton--reading" />
      </section>
    )
  }
  return (
    <section className="hm-card hm-reading">
      <SectionHeading icon="bookOpen" title="Continue Reading" action="Open library" href="/books" />
      <div className="hm-reading-grid">
        {books.slice(0, 3).map((b) => (
          <Link key={b.bookId} to="/books" className="hm-reading-card">
            <BookCover cover={b.cover} />
            <div className="hm-reading-info">
              <strong className="hm-reading-title">{b.title}</strong>
              <span className="hm-reading-author">{b.author}</span>
              <div className="hm-progress"><div className="hm-progress-fill" style={{ width: `${b.percent || 0}%` }} /></div>
              <div className="hm-reading-meta">
                <span>{b.percent || 0}% · {b.currentPage || 0}/{b.pageCount || 0} pages</span>
                <span className="hm-read-cta">Continue<Icon name="arrowRight" size={13} /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StatsSection({ stats, tracker, groupCount, eventCount }) {
  const items = [
    { key: 'reading', label: 'Currently reading', value: stats?.currentlyReading ?? 0, icon: 'bookOpen' },
    { key: 'completed', label: 'Books completed', value: stats?.completedBooks ?? 0, icon: 'check' },
    { key: 'streak', label: 'Day streak', value: stats?.readingStreak ?? 0, icon: 'activity' },
    { key: 'sessions', label: 'Study sessions', value: tracker.sessions.length, icon: 'timer' },
    { key: 'groups', label: 'Groups joined', value: groupCount, icon: 'users' },
    { key: 'events', label: 'Upcoming events', value: eventCount, icon: 'calendar' },
  ]
  return (
    <section className="hm-card hm-stats">
      <SectionHeading icon="activity" title="Learning Overview" />
      <div className="hm-stat-grid">
        {items.map((it) => (
          <div key={it.key} className="hm-stat-tile">
            <span className="hm-stat-tile-icon"><Icon name={it.icon} size={16} /></span>
            <span className="hm-stat-tile-value">{typeof it.value === 'number' ? it.value : '–'}</span>
            <span className="hm-stat-tile-label">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeedCard({ item, meName, onLike, onComment, onShare }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitComment(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || busy) return
    setBusy(true)
    try {
      await onComment(item, value)
      setText('')
    } catch {
      /* error handled upstream */
    } finally {
      setBusy(false)
    }
  }

  const meta = item.kind === 'post'
    ? { name: `${item.author.name || ''} ${item.author.surname || ''}`.trim() || meName, avatar: item.author.profilePicture, tone: avatarTone(item.author.id || item.author.name) }
    : { name: meName, avatar: null, tone: '#5E8C74' }

  return (
    <article className="hm-feed-item">
      <div className="hm-feed-main">
        <Avatar src={meta.avatar} name={meta.name} tone={meta.tone} size="md" />
        <div className="hm-feed-content">
          <div className="hm-feed-top">
            <strong className="hm-feed-name">{meta.name}</strong>
            <time className="hm-feed-time">{timeAgo(item.ts)}</time>
          </div>
          {item.kind === 'post' ? (
            <>
              <p className="hm-feed-text">{item.text}</p>
              {item.image && <img className="hm-feed-img" src={item.image} alt="" loading="lazy" />}
              <div className="hm-feed-actions">
                <button
                  type="button"
                  className={`hm-feed-btn ${item.likedByMe ? 'hm-feed-btn--on' : ''}`}
                  onClick={() => onLike(item)}
                >
                  <Icon name="heart" size={15} fill={item.likedByMe ? 'currentColor' : 'none'} />{item.likes}
                </button>
                <button type="button" className="hm-feed-btn" onClick={() => setOpen((v) => !v)}>
                  <Icon name="message" size={15} />{item.comments.length}
                </button>
                <button type="button" className="hm-feed-btn" onClick={() => onShare(item)}>
                  <Icon name="share" size={15} />Share
                </button>
              </div>
              {open && (
                <form className="hm-comment-form" onSubmit={submitComment}>
                  <input
                    className="hm-comment-input"
                    type="text"
                    placeholder="Write a comment..."
                    value={text}
                    maxLength={600}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button type="submit" className="hm-comment-send" disabled={!text.trim() || busy} aria-label="Send comment">
                    <Icon name="arrowRight" size={14} stroke={2.2} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="hm-feed-text">{item.text} <Link to="/books" className="hm-feed-link">{item.title}</Link></p>
              <div className="hm-feed-tags">
                {item.action !== 'completed' && <span className="hm-feed-tag hm-feed-tag--reading"><Icon name="bookOpen" size={12} />Reading</span>}
              </div>
            </>
          )}
        </div>
      </div>
      {item.comments.length > 0 && (
        <ul className="hm-comments">
          {item.comments.map((c) => (
            <li key={c.id} className="hm-comment">
              <Avatar src={c.author?.profilePicture} name={`${c.author?.name || ''}`} tone={avatarTone(c.author?.id || c.author?.name)} size="xs" />
              <div className="hm-comment-bubble">
                <span className="hm-comment-name">{c.author?.name || 'Someone'}</span>
                <span className="hm-comment-text">{c.text}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function ActivitySection({ items, loading, filter, setFilter, onLike, onComment, onShare, meName }) {
  const shown = items.slice(0, 6)
  const chips = [
    { id: 'all', label: 'All' },
    { id: 'reading', label: 'Reading' },
    { id: 'posts', label: 'Your Posts' },
  ]
  return (
    <section className="hm-card hm-activity">
      <SectionHeading icon="activity" title="Recent Activity" action="View profile" href="/profile" />
      <div className="hm-chip-row" role="tablist" aria-label="Activity filters">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={filter === c.id}
            className={`hm-chip ${filter === c.id ? 'hm-chip--active' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="hm-skeleton hm-skeleton--feed" />
      ) : shown.length === 0 ? (
        <div className="hm-activity-empty">
          <span className="hm-empty-icon"><Icon name="activity" size={22} /></span>
          <p>No activity here yet. Posts you publish or books you open will show up on this dashboard.</p>
        </div>
      ) : (
        <div className="hm-feed-list">
          {shown.map((item) => <FeedCard key={item.id} item={item} meName={meName} onLike={onLike} onComment={onComment} onShare={onShare} />)}
        </div>
      )}
    </section>
  )
}

function GroupsPanel({ groups }) {
  const joined = groups.filter((g) => g.isJoined).slice(0, 3)
  return (
    <section className="hm-card hm-panel">
      <SectionHeading icon="users" title="Your Groups" action="View all" href="/groups" />
      {joined.length === 0 ? (
        <div className="hm-panel-empty">
          <p>You haven't joined any study groups yet.</p>
          <Link to="/groups" className="hm-text-link">Explore groups</Link>
        </div>
      ) : (
        <div className="hm-panel-list">
          {joined.map((g) => (
            <Link key={g.id} to="/groups" className="hm-panel-row">
              <span className="hm-panel-avatar" style={{ background: g.accent || '#687F5C' }}>{g.doodle || g.name.charAt(0)}</span>
              <span className="hm-panel-info">
                <strong>{g.name}</strong>
                <span>{g.members} members{g.activeNow ? ` · ${g.activeNow} active` : ''}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function EventsPanel({ events }) {
  const upcoming = events
    .filter((e) => e.dateISO && e.dateISO >= todayISO())
    .sort((a, b) => (a.dateISO + (a.time || '')).localeCompare(b.dateISO + (b.time || '')))
    .slice(0, 3)
  return (
    <section className="hm-card hm-panel">
      <SectionHeading icon="calendar" title="Upcoming Events" action="All events" href="/events" />
      {upcoming.length === 0 ? (
        <div className="hm-panel-empty">
          <p>No upcoming events on your calendar yet.</p>
          <Link to="/events" className="hm-text-link">Browse events</Link>
        </div>
      ) : (
        <div className="hm-panel-list">
          {upcoming.map((e) => (
            <Link key={e.id} to="/events" className="hm-panel-row">
              <span className="hm-panel-date">
                <strong>{formatEventDate(e.dateISO).split(' ')[1] || ''}</strong>
                <span>{formatEventDate(e.dateISO).split(' ')[0] || ''}</span>
              </span>
              <span className="hm-panel-info">
                <strong>{e.title}</strong>
                <span>{e.isOnline ? 'Online' : e.location || 'Campus'} · {e.time ? `${e.time}` : 'All day'}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function RecommendedPanel({ books, ready }) {
  return (
    <section className="hm-card hm-panel">
      <SectionHeading icon="star" title="Recommended Books" action="Library" href="/books" />
      {!ready ? (
        <div className="hm-skeleton hm-skeleton--list" />
      ) : books.length === 0 ? (
        <div className="hm-panel-empty">
          <p>Recommendations will appear once you've engaged with a few books.</p>
          <Link to="/books" className="hm-text-link">Browse the library</Link>
        </div>
      ) : (
        <div className="hm-panel-list">
          {books.slice(0, 3).map((b) => (
            <Link key={b.id} to="/books" className="hm-panel-row">
              <BookCover cover={b.cover} />
              <span className="hm-panel-info">
                <strong>{b.title}</strong>
                <span>{b.author}{b.category ? ` · ${b.category}` : ''}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function PostDialog({ user, open, onClose, onPublish, onError }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const textRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) {
      setText('')
      setImage(null)
      setBusy(false)
      const t = window.setTimeout(() => textRef.current?.focus(), 60)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [open])

  const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || 'You'

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await encodeImage(file, POST_SPEC)
      setImage(dataUrl)
    } catch (err) {
      onError?.(err.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if ((!text.trim() && !image) || busy) return
    setBusy(true)
    try {
      const post = await onPublish({ text: text.trim(), image })
      if (post) {
        setText('')
        setImage(null)
        onClose()
      }
    } catch {
      /* keep the draft so the user can retry */
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="hm-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="hm-modal" role="dialog" aria-modal="true" aria-labelledby="hm-post-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
        <div className="hm-modal-head">
          <h2 id="hm-post-title"><Icon name="edit" size={17} />Create post</h2>
          <button type="button" className="hm-modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={17} />
          </button>
        </div>
        <form className="hm-composer" onSubmit={submit}>
          <div className="hm-composer-author">
            <Avatar src={user.profilePicture} name={fullName} tone="#687F5C" size="md" />
            <div>
              <strong>{fullName}</strong>
              <span>Sharing a learning update</span>
            </div>
          </div>
          <textarea
            ref={textRef}
            className="hm-composer-input"
            placeholder="Share what you're learning..."
            value={text}
            maxLength={2000}
            rows={4}
            onChange={(e) => setText(e.target.value)}
          />
          {image && (
            <div className="hm-composer-preview">
              <img src={image} alt="" />
              <button type="button" onClick={() => setImage(null)} aria-label="Remove image"><Icon name="x" size={14} /></button>
            </div>
          )}
          <div className="hm-composer-foot">
            <button type="button" className="hm-btn hm-btn--ghost hm-btn--sm" onClick={() => fileRef.current?.click()}>
              <Icon name="camera" size={15} />Add photo
            </button>
            <div className="hm-composer-foot-right">
              <button type="button" className="hm-btn hm-btn--ghost hm-btn--sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="hm-btn hm-btn--primary hm-btn--sm" disabled={(!text.trim() && !image) || busy}>
                {busy ? 'Publishing…' : 'Post'}
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </form>
      </div>
    </div>
  )
}

/* ============================================================
   Dashboard
   ============================================================ */

export default function Dashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('learnova_user') || '{}')
    } catch {
      return {}
    }
  }, [])
  const userId = user.id || user._id || null
  const userName = String(user.name || 'User').trim()
  const firstName = userName.split(' ')[0]

  const [stats, setStats] = useState(null)
  const [reading, setReading] = useState([])
  const [recommended, setRecommended] = useState([])
  const [posts, setPosts] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [composerOpen, setComposerOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const readingRef = useRef(null)

  const tracker = useStudyTracker({ userId })

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }, [])

  const events = useMemo(() => {
    const stored = readStore(EVENTS_KEY, null)
    return Array.isArray(stored) && stored.length > 0 ? stored : DEMO_EVENTS
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const results = await Promise.allSettled([
          api('/dashboard/stats'),
          api('/reading/current'),
          api('/profile/me/posts'),
          api('/reading/history'),
          api('/recommendations?limit=3'),
        ])
        if (cancelled) return
        const value = (i, fallback) => (results[i].status === 'fulfilled' ? results[i].value : fallback)
        setStats(value(0, null)?.stats || null)
        setReading(value(1, {})?.books || [])
        setPosts(value(2, {})?.posts || [])
        setHistory(value(3, {})?.history || [])
        setRecommended(value(4, {})?.recommendations || [])
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const feed = useMemo(() => {
    const readingItems = history.map((h) => ({
      id: `r-${h.id}`,
      kind: 'reading',
      ts: new Date(h.viewedAt).getTime(),
      title: h.title,
      text: `${userName} ${readingLabel(h.action)}`,
      action: h.action,
    }))
    const postItems = posts.map((p) => ({
      id: `p-${p.id}`,
      kind: 'post',
      ts: new Date(p.createdAt).getTime(),
      author: p.author,
      text: p.text,
      image: p.image,
      likes: p.likes,
      likedByMe: p.likedByMe,
      comments: p.comments || [],
    }))
    const all = [...readingItems, ...postItems].sort((a, b) => b.ts - a.ts)
    if (filter === 'reading') return all.filter((i) => i.kind === 'reading')
    if (filter === 'posts') return all.filter((i) => i.kind === 'post')
    return all
  }, [history, posts, filter, userName])

  const joinedGroups = useMemo(() => GROUPS.filter((g) => g.isJoined), [])
  const upcomingCount = useMemo(() => events.filter((e) => e.dateISO && e.dateISO >= todayISO()).length, [events])

  async function publishPost({ text, image }) {
    const res = await api('/profile', { method: 'POST', body: { text, image } })
    setPosts((prev) => [res.post, ...prev])
    showToast('Post published')
    return res.post
  }

  async function likePost(item) {
    try {
      const res = await api(`/profile/post/${item.id.replace('p-', '')}/like`, { method: 'POST' })
      setPosts((prev) => prev.map((p) => (p.id === item.id.replace('p-', '') ? { ...p, likes: res.likes, likedByMe: res.liked } : p)))
    } catch (err) {
      showToast(err.message)
    }
  }

  async function commentPost(item, text) {
    try {
      const res = await api(`/profile/post/${item.id.replace('p-', '')}/comment`, { method: 'POST', body: { text } })
      setPosts((prev) => prev.map((p) => (p.id === item.id.replace('p-', '') ? { ...p, comments: [...p.comments, res.comment] } : p)))
    } catch (err) {
      showToast(err.message)
    }
  }

  async function sharePost() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile`)
      showToast('Profile link copied')
    } catch {
      showToast('Could not copy the link')
    }
  }

  function startStudyFromShortcut() {
    tracker.start()
    readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="hm-page">
      {/* Welcome */}
      <section className="hm-card hm-welcome">
        <div className="hm-welcome-copy">
          <h1>Welcome back, {firstName}!</h1>
          <p>Ready to continue your learning journey?</p>
        </div>
        <div className="hm-welcome-actions">
          <button type="button" className="hm-welcome-chip" onClick={() => readingRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <Icon name="bookOpen" size={15} />Continue Reading
          </button>
          <Link to="/books" className="hm-welcome-chip"><Icon name="book" size={15} />Browse Library</Link>
          <Link to="/groups" className="hm-welcome-chip"><Icon name="users" size={15} />Explore Groups</Link>
          <Link to="/events" className="hm-welcome-chip"><Icon name="calendar" size={15} />View Events</Link>
        </div>
      </section>

      <div className="hm-grid">
        <div className="hm-main">
          <StudyCard tracker={tracker} />
          <QuickActions onStartStudy={startStudyFromShortcut} onOpenComposer={() => setComposerOpen(true)} />
          <div ref={readingRef} className="hm-anchor" />
          <ReadingSection books={reading} ready={!loading} />
          <StatsSection stats={stats} tracker={tracker} groupCount={joinedGroups.length} eventCount={upcomingCount} />
          <ActivitySection
            items={feed}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            onLike={likePost}
            onComment={commentPost}
            onShare={sharePost}
            meName={userName}
          />
        </div>

        <aside className="hm-side">
          <GroupsPanel groups={GROUPS} />
          <EventsPanel events={events} />
          <RecommendedPanel books={recommended} ready={!loading} />
        </aside>
      </div>

      <PostDialog user={user} open={composerOpen} onClose={() => setComposerOpen(false)} onPublish={publishPost} onError={showToast} />

      {toast && <div className="hm-toast" role="status">{toast}</div>}
    </div>
  )
}