import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Groups.css'

/* ============================================================
   Learnova — Study Groups (community discovery)
   Data + business logic preserved. Visual layer redesigned:
   sage / peach palette, editorial cards, real-data metrics.
   ============================================================ */

const GROUPS = [
  {
    id: 1,
    name: 'Computer Science Hub',
    subject: 'Computer Science',
    description: 'Algorithms, coding help, system design and interview prep — with weekly code reviews.',
    members: 128,
    posts: 342,
    isJoined: true,
    following: true,
    recentlyVisited: true,
    activeNow: 24,
    admin: 'Alex Chen',
    tint: 'lavender',
    accent: '#7046C5',
    doodle: '💡',
    tag: ['Coding', 'Interviews'],
    level: 'Intermediate',
    isPublic: true,
    hasEvents: true,
    memberAvatars: [['AC', '#7046C5'], ['SP', '#5a9a8f'], ['RP', '#b06a3c']],
  },
  {
    id: 2,
    name: 'Book Club',
    subject: 'Literature',
    description: 'A new book every month, warm discussions, and reading challenges. Currently on "Atomic Habits".',
    members: 85,
    posts: 189,
    isJoined: true,
    following: false,
    recentlyVisited: false,
    activeNow: 12,
    admin: 'Sarah Kim',
    tint: 'sage',
    accent: '#5a8a5e',
    doodle: '📖',
    tag: ['Reading', 'Monthly'],
    level: 'Beginner',
    isPublic: true,
    hasEvents: true,
    memberAvatars: [['SK', '#5a8a5e'], ['EW', '#b06a3c'], ['AL', '#7046C5']],
  },
  {
    id: 3,
    name: 'Math Society',
    subject: 'Mathematics',
    description: 'Calculus walks, linear algebra hangouts, and olympiad problem nights. Proofs encouraged.',
    members: 61,
    posts: 98,
    isJoined: true,
    following: false,
    recentlyVisited: false,
    activeNow: 6,
    admin: 'Priya Nair',
    tint: 'linen',
    accent: '#7a8a3c',
    doodle: '📐',
    tag: ['Proofs', 'Olympiad'],
    level: 'Advanced',
    isPublic: false,
    hasEvents: false,
    memberAvatars: [['PN', '#7a8a3c'], ['OK', '#8a5aa8'], ['ZL', '#5a7a9a']],
  },
  {
    id: 4,
    name: 'Language Exchange',
    subject: 'Languages',
    description: 'Practice Spanish, French and Japanese with native speakers. Convo clubs every Friday.',
    members: 142,
    posts: 305,
    isJoined: true,
    following: true,
    recentlyVisited: false,
    activeNow: 21,
    admin: 'Emilia Fuchs',
    tint: 'bluegray',
    accent: '#3c7a8a',
    doodle: '🗣️',
    tag: ['Spanish', 'French'],
    level: 'Beginner',
    isPublic: true,
    hasEvents: true,
    memberAvatars: [['EF', '#3c7a8a'], ['JR', '#5a8a5e'], ['KM', '#7046C5']],
  },
  {
    id: 5,
    name: 'Data Science Collective',
    subject: 'Data Science',
    description: 'Machine learning, statistics, and projects. Share kernels, datasets, and learn together.',
    members: 96,
    posts: 256,
    isJoined: false,
    following: false,
    recentlyVisited: false,
    activeNow: 18,
    trendingLabel: '🔥 Most active today',
    admin: 'Raj Patel',
    tint: 'sage',
    accent: '#5a7a9a',
    doodle: '🔬',
    tag: ['ML', 'Python'],
    level: 'Intermediate',
    isPublic: true,
    hasEvents: false,
    memberAvatars: [['RP', '#5a7a9a'], ['JW', '#8a5aa8'], ['CY', '#b06a3c']],
  },
  {
    id: 6,
    name: 'Physics Problem Solvers',
    subject: 'Physics',
    description: 'From Newton to quantum — weekly problem sets, derivations, and late-night "aha" moments.',
    members: 73,
    posts: 143,
    isJoined: false,
    following: false,
    recentlyVisited: true,
    activeNow: 9,
    trendingLabel: '💡 Popular discussion',
    admin: 'Dr. Wei Zhang',
    tint: 'bluegray',
    accent: '#8a5aa8',
    doodle: '⚛️',
    tag: ['Mechanics', 'Quantum'],
    level: 'Advanced',
    isPublic: true,
    hasEvents: true,
    memberAvatars: [['WZ', '#8a5aa8'], ['TY', '#5a7a9a'], ['PB', '#b06a3c']],
  },
  {
    id: 7,
    name: 'Exam Warriors',
    subject: 'Exam Prep',
    description: 'Crushing finals together — timers, past papers, flashcards and a metric ton of encouragement.',
    members: 214,
    posts: 512,
    isJoined: false,
    following: false,
    recentlyVisited: false,
    activeNow: 42,
    trendingLabel: '🔥 Most active today',
    admin: 'Maya Torres',
    tint: 'lavender',
    accent: '#b06a3c',
    doodle: '🎯',
    tag: ['Finals', 'Pomodoro'],
    level: 'Beginner',
    isPublic: true,
    hasEvents: false,
    memberAvatars: [['MT', '#b06a3c'], ['NK', '#5a9a8f'], ['BD', '#7046C5']],
  },
  {
    id: 8,
    name: 'Project Builders',
    subject: 'Projects',
    description: 'Side projects, hackathon teams and portfolio builders. Find a teammate, ship the thing.',
    members: 88,
    posts: 176,
    isJoined: false,
    following: false,
    recentlyVisited: false,
    activeNow: 15,
    trendingLabel: '✨ New community',
    admin: 'Jordan Lee',
    tint: 'linen',
    accent: '#a85a5a',
    doodle: '🛠️',
    tag: ['Hackathons', 'Portfolio'],
    level: 'Intermediate',
    isPublic: false,
    hasEvents: false,
    memberAvatars: [['JL', '#a85a5a'], ['HF', '#5a9a8f'], ['BP', '#7046C5']],
  },
  {
    id: 9,
    name: 'Creative Writing Circle',
    subject: 'Literature',
    description: 'Short stories, poems, and gentle feedback. A cozy corner for wordsmiths.',
    members: 54,
    posts: 87,
    isJoined: false,
    following: false,
    recentlyVisited: false,
    activeNow: 7,
    admin: 'Ana Rivera',
    tint: 'sage',
    accent: '#7a8a3c',
    doodle: '✍️',
    tag: ['Writing', 'Feedback'],
    level: 'Beginner',
    isPublic: true,
    hasEvents: false,
    memberAvatars: [['AR', '#7a8a3c'], ['GB', '#5a7a9a'], ['TO', '#a85a5a']],
  },
]

export { GROUPS }

const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Literature',
  'Data Science',
  'Physics',
  'Languages',
  'Exam Prep',
  'Projects',
]

/* ---- per-subject visual identity (presentation layer only) ---- */

const DEFAULT_THEME = { accent: '#526D5B', soft: '#E6EDE4', ink: '#3C4C40', glyph: 'book' }

const SUBJECT_THEME = {
  'Computer Science': { accent: '#6E5AC8', soft: '#ECE8FA', ink: '#443188', glyph: 'code' },
  Literature: { accent: '#6F9A79', soft: '#E4EDE3', ink: '#3F6047', glyph: 'book' },
  Mathematics: { accent: '#6E86C9', soft: '#E6EAF7', ink: '#3D549A', glyph: 'sigma' },
  Languages: { accent: '#4C86A8', soft: '#E2EDF3', ink: '#315F76', glyph: 'globe' },
  'Data Science': { accent: '#4F9E8E', soft: '#DDEEE9', ink: '#2C6C60', glyph: 'chart' },
  Physics: { accent: '#8A6BB8', soft: '#EFEAF8', ink: '#5B4184', glyph: 'atom' },
  'Exam Prep': { accent: '#D98A5B', soft: '#F8E8DC', ink: '#A25B33', glyph: 'target' },
  Projects: { accent: '#C09A34', soft: '#F6EFD8', ink: '#856A1E', glyph: 'tools' },
}

function themeFor(subject) {
  return SUBJECT_THEME[subject] || DEFAULT_THEME
}

function hexA(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* ------------------- small icons ------------------- */

const baseSvg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...baseSvg}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.4" {...baseSvg}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChevronIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...baseSvg}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.6" {...baseSvg}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const UsersIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TalkIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const GridIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
)

const BookOpenIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <path d="M12 7c-2-1.4-4.5-1.6-7-1.2V18c2.5-.4 5-.2 7 1.2 2-1.4 4.5-1.6 7-1.2V5.8c-2.5-.4-5-.2-7 1.2z" />
    <path d="M12 7v12" />
  </svg>
)

const PulseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...baseSvg}>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
)

const SortIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...baseSvg}>
    <path d="M4 6h16M4 12h11M4 18h6" />
  </svg>
)

const SlidersIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
    <circle cx="9" cy="7" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="7" cy="17" r="2.4" fill="currentColor" stroke="none" />
  </svg>
)

const ArrowRightIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...baseSvg}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const FlameIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <path d="M12 3c.6 2.6 3.5 3.7 3.5 7.4a3.5 3.5 0 0 1-7 0c0-1.4.6-2.3 1-3.3.9.9 1.7.6 2.5-4.1z" />
    <path d="M7 14a5 5 0 0 0 10 0" />
  </svg>
)

const CalendarIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.9" {...baseSvg}>
    <rect x="3" y="4.5" width="18" height="16" rx="3" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const SparkIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...baseSvg}>
    <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
)

const XIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.4" {...baseSvg}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const Spinner = () => <span className="grp-btn-spinner" aria-hidden="true" />

/* ------------------- subject line-art (image fallback) ------------------- */

function SubjectArt({ glyph }) {
  const common = {
    className: 'grp-art',
    viewBox: '0 0 160 120',
    'aria-hidden': 'true',
  }
  if (glyph === 'code') {
    return (
      <svg {...common}>
        <rect x="32" y="30" width="96" height="58" rx="9" />
        <path d="M20 96h120l-10-8H30z" />
        <path d="M62 52l-12 11 12 11" />
        <path d="M98 52l12 11-12 11" />
        <path d="M88 47l-12 30" />
      </svg>
    )
  }
  if (glyph === 'sigma') {
    return (
      <svg {...common}>
        <rect x="30" y="28" width="100" height="64" rx="9" />
        <path d="M30 50h100M80 28v64" />
        <path d="M56 40h18l-18 14h18" />
      </svg>
    )
  }
  if (glyph === 'globe') {
    return (
      <svg {...common}>
        <circle cx="80" cy="60" r="34" />
        <ellipse cx="80" cy="60" rx="15" ry="34" />
        <path d="M47 50h66M47 70h66" />
      </svg>
    )
  }
  if (glyph === 'chart') {
    return (
      <svg {...common}>
        <path d="M38 92h84" />
        <rect x="50" y="66" width="14" height="26" rx="3" />
        <rect x="74" y="52" width="14" height="40" rx="3" />
        <rect x="98" y="38" width="14" height="54" rx="3" />
      </svg>
    )
  }
  if (glyph === 'atom') {
    return (
      <svg {...common}>
        <circle cx="80" cy="60" r="6" />
        <ellipse cx="80" cy="60" rx="42" ry="17" />
        <ellipse cx="80" cy="60" rx="42" ry="17" transform="rotate(60 80 60)" />
        <ellipse cx="80" cy="60" rx="42" ry="17" transform="rotate(-60 80 60)" />
      </svg>
    )
  }
  if (glyph === 'target') {
    return (
      <svg {...common}>
        <circle cx="80" cy="60" r="34" />
        <circle cx="80" cy="60" r="20" />
        <circle cx="80" cy="60" r="7" />
      </svg>
    )
  }
  if (glyph === 'tools') {
    return (
      <svg {...common}>
        <path d="M94 40a18 18 0 0 0-22 22L40 94l14 14 32-32a18 18 0 0 0 22-22l-12 12-14-14z" />
        <circle cx="106" cy="102" r="7" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="40" y="28" width="80" height="16" rx="4" />
      <rect x="32" y="52" width="96" height="16" rx="4" />
      <rect x="46" y="76" width="68" height="16" rx="4" />
      <path d="M52 28v16" />
    </svg>
  )
}

/* ------------------- filter dropdown ------------------- */

function FilterDropdown({ label, valueLabel, icon, open, onToggle, onClose, align, children }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, onClose])

  return (
    <div className="grp-dropdown-wrap" ref={wrapRef}>
      <button
        className={`grp-dropdown-toggle ${open ? 'grp-dropdown-toggle--open' : ''}`}
        onClick={open ? onClose : onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {icon && <span className="grp-dropdown-icon" aria-hidden="true">{icon}</span>}
        <span className="grp-dropdown-label">
          {valueLabel && valueLabel !== label ? <><em>{label}:</em> {valueLabel}</> : label}
        </span>
        <ChevronIcon />
      </button>
      {open && (
        <div className={`grp-dropdown-menu ${align === 'right' ? 'grp-dropdown-menu--right' : ''}`} role="menu">
          {children}
        </div>
      )}
    </div>
  )
}

function Option({ selected, onSelect, children }) {
  return (
    <button
      className={`grp-dropdown-option ${selected ? 'grp-dropdown-option--selected' : ''}`}
      onClick={onSelect}
      role="menuitemradio"
      aria-checked={selected}
    >
      {children}
      {selected && <span className="check"><CheckIcon /></span>}
    </button>
  )
}

function CheckOption({ checked, onToggle, children }) {
  return (
    <button
      className={`grp-dropdown-option grp-dropdown-option--plain ${checked ? 'grp-dropdown-option--checked' : ''}`}
      onClick={onToggle}
      role="menuitemcheckbox"
      aria-checked={checked}
    >
      <span className="grp-dropdown-check"><CheckIcon size={11} /></span>
      {children}
    </button>
  )
}

/* ------------------- group card ------------------- */

function cleanTrend(label) {
  return label.replace(/^[^A-Za-z]+/, '').trim()
}

function GroupCard({ group, onOpen, onJoin, pending }) {
  const theme = themeFor(group.subject)
  const shown = group.memberAvatars.slice(0, 3)
  const extra = Math.max(0, group.members - shown.length)
  const joined = group.isJoined

  const mediaStyle = {
    backgroundImage:
      `radial-gradient(90% 130% at 88% 15%, ${hexA(theme.accent, 0.30)}, transparent 62%),` +
      `radial-gradient(80% 120% at 6% 95%, ${hexA(theme.accent, 0.20)}, transparent 58%),` +
      `linear-gradient(140deg, ${theme.soft} 0%, #ffffff 100%)`,
  }

  return (
    <article
      className="grp-card"
      style={{ '--accent': theme.accent, '--accent-soft': theme.soft, '--accent-ink': theme.ink }}
      onClick={() => onOpen(group.id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(group.id)
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Open ${group.name}`}
    >
      <div className="grp-card-media" style={mediaStyle}>
        <SubjectArt glyph={theme.glyph} />
        <span className="grp-card-badge">{group.subject}</span>
        {group.trendingLabel && (
          <span className="grp-card-flag"><FlameIcon /> {cleanTrend(group.trendingLabel)}</span>
        )}
        {group.activeNow > 0 && (
          <span className="grp-card-live"><span className="grp-live-dot" /> {group.activeNow} online</span>
        )}
      </div>

      <div className="grp-card-body">
        <h3 className="grp-card-name">{group.name}</h3>
        <p className="grp-card-desc">{group.description}</p>

        <div className="grp-card-meta">
          <span className="grp-card-stat"><UsersIcon size={14} /> <strong>{group.members}</strong> members</span>
          <span className="grp-card-sep" aria-hidden="true" />
          <span className="grp-card-stat"><TalkIcon size={14} /> <strong>{group.posts}</strong> discussions</span>
        </div>

        <div className="grp-card-foot">
          <div className="grp-avatars" aria-hidden="true">
            {shown.map(([initials, color], i) => (
              <span key={initials + i} className="grp-avatar" style={{ background: color, zIndex: shown.length - i }}>
                {initials}
              </span>
            ))}
            {extra > 0 && <span className="grp-avatar grp-avatar--more">+{extra > 999 ? '999+' : extra}</span>}
          </div>

          {joined ? (
            <button
              className="grp-card-action grp-card-action--open"
              onClick={e => { e.stopPropagation(); onOpen(group.id) }}
            >
              Open Discussion
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              className={`grp-card-action grp-card-action--join ${pending ? 'is-pending' : ''}`}
              onClick={e => { e.stopPropagation(); onJoin(group.id) }}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? <Spinner /> : <PlusIcon size={14} />}
              {pending ? 'Joining' : 'Join Group'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ------------------- community pulse ------------------- */

const PULSE_EVENTS = [
  { month: 'SEP', day: '18', name: 'Algorithms Night', group: 'Computer Science Hub', groupId: 1 },
  { month: 'SEP', day: '21', name: 'Group Q&A', group: 'Book Club', groupId: 2 },
  { month: 'SEP', day: '24', name: 'Problem Set Party', group: 'Physics Problem Solvers', groupId: 6 },
]

function CommunityPulse({ onOpenGroup, popular, totalStudying, trendingCount, totalDiscussions }) {
  return (
    <aside className="grp-pulse" aria-label="Community pulse">
      <div className="grp-pulse-card">
        <div className="grp-pulse-head">
          <span className="grp-pulse-mark" aria-hidden="true"><SparkIcon size={13} /></span>
          <h3 className="grp-pulse-title">Community Pulse</h3>
        </div>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title"><CalendarIcon size={13} /> Upcoming</div>
          {PULSE_EVENTS.map(ev => {
            const g = popular.find(x => x.id === ev.groupId)
            const tone = g ? themeFor(g.subject).accent : DEFAULT_THEME.accent
            return (
              <button className="grp-pulse-event" key={ev.name} onClick={() => onOpenGroup(ev.groupId)}>
                <span className="grp-pulse-date" style={{ '--tone': tone }}>
                  <span className="grp-pulse-date-month">{ev.month}</span>
                  <span className="grp-pulse-date-day">{ev.day}</span>
                </span>
                <span className="grp-pulse-event-info">
                  <span className="grp-pulse-event-name">{ev.name}</span>
                  <span className="grp-pulse-event-group">{ev.group}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title"><PulseIcon size={13} /> Activity</div>
          <div className="grp-pulse-activity"><span className="grp-pulse-activity-dot grp-pulse-activity-dot--live" /> {totalStudying} students studying now</div>
          <div className="grp-pulse-activity"><span className="grp-pulse-activity-dot" /> {trendingCount} groups trending today</div>
          <div className="grp-pulse-activity"><span className="grp-pulse-activity-dot" /> {totalDiscussions.toLocaleString()} discussions shared</div>
        </div>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title"><FlameIcon size={13} /> Popular</div>
          {popular.map((g, i) => {
            const theme = themeFor(g.subject)
            return (
              <button className="grp-pulse-popular" key={g.id} onClick={() => onOpenGroup(g.id)}>
                <span className="grp-pulse-rank">{i + 1}</span>
                <span className="grp-pulse-popular-info">
                  <span className="grp-pulse-popular-name">{g.name}</span>
                  <span className="grp-pulse-popular-meta">{g.activeNow} active · {g.members} members</span>
                </span>
                <span className="grp-pulse-popular-avatar" style={{ background: theme.accent }}>{g.name.charAt(0)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

/* ------------------- create group modal ------------------- */

function CreateGroupModal({ onClose }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [description, setDescription] = useState('')
  const [created, setCreated] = useState(false)

  const theme = themeFor(subject)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreated(true)
  }

  return (
    <div className="grp-modal" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="grp-modal-card" role="dialog" aria-modal="true" aria-label="Create a new study group">
        <button className="grp-modal-close" onClick={onClose} aria-label="Close">
          <XIcon size={14} />
        </button>

        {created ? (
          <div className="grp-modal-success">
            <div className="grp-modal-success-icon" style={{ background: theme.soft, color: theme.accent }}>
              <SparkIcon size={30} />
            </div>
            <h3>Group created!</h3>
            <p>{`"${name}" is ready. Invite your classmates and start the first discussion.`}</p>
            <button className="grp-create-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <span className="grp-modal-eyebrow">New study group</span>
            <h3 className="grp-modal-title">Create a study group</h3>
            <p className="grp-modal-sub">Start a cozy corner for a subject you love — invite a friend too.</p>
            <form onSubmit={handleSubmit}>
              <label className="grp-modal-label">
                Group name
                <input
                  className="grp-modal-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Organic Chemistry Circle"
                  autoFocus
                />
              </label>
              <label className="grp-modal-label">
                Subject
                <select className="grp-modal-input" value={subject} onChange={e => setSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="grp-modal-label">
                Description
                <textarea
                  className="grp-modal-input grp-modal-textarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What will you study, discuss, and share together?"
                />
              </label>
              <button className="grp-create-btn grp-modal-submit" type="submit" disabled={!name.trim()}>
                <PlusIcon size={15} />
                Create group
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------- main component ------------------- */

export default function Groups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState(GROUPS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [pendingJoin, setPendingJoin] = useState({})
  const [toast, setToast] = useState(null)

  const [myFilter, setMyFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [more, setMore] = useState({ public: false, level: 'all', events: false, active: false })

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  function toggleJoin(groupId) {
    if (pendingJoin[groupId]) return
    setPendingJoin(p => ({ ...p, [groupId]: true }))
    window.setTimeout(() => {
      let joined = false
      setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g
        joined = !g.isJoined
        return { ...g, isJoined: joined, members: g.isJoined ? g.members - 1 : g.members + 1 }
      }))
      setPendingJoin(p => ({ ...p, [groupId]: false }))
      setToast({ text: joined ? 'You joined this group.' : 'You left this group.', tone: joined ? 'success' : 'neutral' })
    }, 500)
  }

  function openGroup(id) {
    navigate(`/groups/${id}`)
  }

  function allDefaults() {
    return myFilter === 'all' && subjectFilter === 'all' && activityFilter === 'all'
      && sortBy === 'recommended' && !more.public && more.level === 'all' && !more.events && !more.active
  }

  /* ---- build chips + filtering ---- */

  const chips = []
  if (myFilter !== 'all') chips.push({ key: 'my', value: MY_FILTERS[myFilter].label })
  if (subjectFilter !== 'all') chips.push({ key: 'subject', value: subjectFilter })
  if (activityFilter !== 'all') chips.push({ key: 'activity', value: ACTIVITY_FILTERS[activityFilter].label })
  if (more.public) chips.push({ key: 'public', value: 'Public' })
  if (more.level !== 'all') chips.push({ key: 'level', value: more.level })
  if (more.events) chips.push({ key: 'events', value: 'Has events' })
  if (more.active) chips.push({ key: 'active', value: 'Active discussions' })

  function removeChip(key) {
    if (key === 'my') setMyFilter('all')
    if (key === 'subject') setSubjectFilter('all')
    if (key === 'activity') setActivityFilter('all')
    if (key === 'public') setMore(m => ({ ...m, public: false }))
    if (key === 'level') setMore(m => ({ ...m, level: 'all' }))
    if (key === 'events') setMore(m => ({ ...m, events: false }))
    if (key === 'active') setMore(m => ({ ...m, active: false }))
  }

  function clearAll() {
    setMyFilter('all')
    setSubjectFilter('all')
    setActivityFilter('all')
    setSortBy('recommended')
    setMore({ public: false, level: 'all', events: false, active: false })
    setSearchQuery('')
  }

  let filtered = groups.filter(g => {
    const term = searchQuery.trim().toLowerCase()
    if (term) {
      const hay = `${g.name} ${g.subject} ${g.description}`.toLowerCase()
      if (!hay.includes(term)) return false
    }
    if (myFilter === 'mine' && !g.isJoined) return false
    if (myFilter === 'following' && !g.following) return false
    if (myFilter === 'recent' && !g.recentlyVisited) return false
    if (subjectFilter !== 'all' && g.subject !== subjectFilter) return false
    if (activityFilter === 'active' && !(g.activeNow > 0)) return false
    if (activityFilter === 'new' && !g.trendingLabel) return false
    if (activityFilter === 'events' && !g.hasEvents) return false
    if (activityFilter === 'created' && g.trendingLabel !== '✨ New community') return false
    if (more.public && !g.isPublic) return false
    if (more.level !== 'all' && g.level !== more.level) return false
    if (more.events && !g.hasEvents) return false
    if (more.active && g.posts < 150) return false
    return true
  })

  const sortMap = {
    recommended: [],
    mostActive: (a, b) => b.activeNow - a.activeNow,
    newest: (a, b) => a.id - b.id,
    mostMembers: (a, b) => b.members - a.members,
  }
  if (sortBy !== 'recommended') filtered = [...filtered].sort(sortMap[sortBy])

  const myGroups = filtered.filter(g => g.isJoined)
  const discover = filtered.filter(g => !g.isJoined)
  const trending = groups.filter(g => g.trendingLabel)

  const filtersActive = !allDefaults() || searchQuery.trim() !== ''

  /* ---- real, data-driven community metrics ---- */

  const metrics = useMemo(() => {
    const totalMembers = groups.reduce((s, g) => s + g.members, 0)
    const totalDiscussions = groups.reduce((s, g) => s + g.posts, 0)
    const totalStudying = groups.reduce((s, g) => s + g.activeNow, 0)
    return { totalMembers, totalDiscussions, totalStudying }
  }, [groups])

  const popular = useMemo(
    () => [...groups].sort((a, b) => b.activeNow - a.activeNow || b.members - a.members).slice(0, 3),
    [groups]
  )

  return (
    <div className="groups-page">
      {/* ---------- Header ---------- */}
      <section className="grp-header">
        <div className="grp-header-left">
          <span className="grp-header-eyebrow">
            <span className="dot" />
            Learn together
          </span>
          <h1 className="grp-header-title">Study Groups</h1>
          <p className="grp-header-sub">Find your community, exchange ideas, and learn together.</p>
        </div>
        <div className="grp-header-right">
          <div className="grp-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search groups…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search study groups"
            />
            {searchQuery && (
              <button className="grp-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <XIcon size={11} />
              </button>
            )}
          </div>
          <button className="grp-create-btn" onClick={() => setShowCreateModal(true)}>
            <PlusIcon />
            Create Group
          </button>
        </div>
      </section>

      {/* ---------- Filter dashboard ---------- */}
      <div className="grp-filters">
        <span className="grp-filters-label">Filter</span>
        <FilterDropdown
          label="All Groups"
          valueLabel={MY_FILTERS[myFilter].label}
          icon={<GridIcon size={15} />}
          open={openMenu === 'my'}
          onToggle={() => setOpenMenu(openMenu === 'my' ? null : 'my')}
          onClose={() => setOpenMenu(null)}
        >
          {Object.entries(MY_FILTERS).map(([key, f]) => (
            <Option key={key} selected={myFilter === key} onSelect={() => { setMyFilter(key); setOpenMenu(null) }}>
              {f.label}
            </Option>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Subject"
          valueLabel={subjectFilter === 'all' ? null : subjectFilter}
          icon={<BookOpenIcon size={15} />}
          open={openMenu === 'subject'}
          onToggle={() => setOpenMenu(openMenu === 'subject' ? null : 'subject')}
          onClose={() => setOpenMenu(null)}
        >
          <Option selected={subjectFilter === 'all'} onSelect={() => { setSubjectFilter('all'); setOpenMenu(null) }}>
            All Subjects
          </Option>
          {SUBJECTS.map(s => (
            <Option key={s} selected={subjectFilter === s} onSelect={() => { setSubjectFilter(s); setOpenMenu(null) }}>
              {s}
            </Option>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Activity"
          valueLabel={activityFilter === 'all' ? null : ACTIVITY_FILTERS[activityFilter].label}
          icon={<PulseIcon size={15} />}
          open={openMenu === 'activity'}
          onToggle={() => setOpenMenu(openMenu === 'activity' ? null : 'activity')}
          onClose={() => setOpenMenu(null)}
        >
          {Object.entries(ACTIVITY_FILTERS).map(([key, f]) => (
            <Option key={key} selected={activityFilter === key} onSelect={() => { setActivityFilter(key); setOpenMenu(null) }}>
              {f.label}
            </Option>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Sort by"
          valueLabel={SORT_FILTERS[sortBy].label}
          icon={<SortIcon size={15} />}
          open={openMenu === 'sort'}
          onToggle={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
          onClose={() => setOpenMenu(null)}
        >
          {Object.entries(SORT_FILTERS).map(([key, f]) => (
            <Option key={key} selected={sortBy === key} onSelect={() => { setSortBy(key); setOpenMenu(null) }}>
              {f.label}
            </Option>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="More Filters"
          icon={<SlidersIcon size={15} />}
          open={openMenu === 'more'}
          onToggle={() => setOpenMenu(openMenu === 'more' ? null : 'more')}
          onClose={() => setOpenMenu(null)}
          align="right"
        >
          <CheckOption checked={more.public} onToggle={() => setMore(m => ({ ...m, public: !m.public }))}>
            Public
          </CheckOption>
          <CheckOption checked={more.level === 'Beginner'} onToggle={() => setMore(m => ({ ...m, level: m.level === 'Beginner' ? 'all' : 'Beginner' }))}>
            Beginner
          </CheckOption>
          <CheckOption checked={more.level === 'Advanced'} onToggle={() => setMore(m => ({ ...m, level: m.level === 'Advanced' ? 'all' : 'Advanced' }))}>
            Advanced
          </CheckOption>
          <CheckOption checked={more.events} onToggle={() => setMore(m => ({ ...m, events: !m.events }))}>
            Has events
          </CheckOption>
          <CheckOption checked={more.active} onToggle={() => setMore(m => ({ ...m, active: !m.active }))}>
            Active discussions
          </CheckOption>
        </FilterDropdown>
      </div>

      {/* Filter chips */}
      {chips.length > 0 && (
        <div className="grp-filter-chips">
          {chips.map(chip => (
            <span className="grp-chip" key={chip.key}>
              {chip.value}
              <button onClick={() => removeChip(chip.key)} aria-label={`Remove ${chip.value} filter`}>
                <XIcon size={9} />
              </button>
            </span>
          ))}
          <button className="grp-clear-filters" onClick={clearAll}>Clear filters</button>
        </div>
      )}

      {/* ---------- Community metrics ---------- */}
      <div className="grp-metrics" role="group" aria-label="Community statistics">
        <div className="grp-metric">
          <span className="grp-metric-icon grp-metric-icon--sage" aria-hidden="true"><GridIcon size={17} /></span>
          <span className="grp-metric-body">
            <span className="grp-metric-num">{groups.length}</span>
            <span className="grp-metric-label">Study groups</span>
          </span>
        </div>
        <div className="grp-metric">
          <span className="grp-metric-icon grp-metric-icon--violet" aria-hidden="true"><UsersIcon size={17} /></span>
          <span className="grp-metric-body">
            <span className="grp-metric-num">{metrics.totalMembers.toLocaleString()}</span>
            <span className="grp-metric-label">Members</span>
          </span>
        </div>
        <div className="grp-metric">
          <span className="grp-metric-icon grp-metric-icon--peach" aria-hidden="true"><TalkIcon size={17} /></span>
          <span className="grp-metric-body">
            <span className="grp-metric-num">{metrics.totalDiscussions.toLocaleString()}</span>
            <span className="grp-metric-label">Discussions</span>
          </span>
        </div>
        <div className="grp-metric">
          <span className="grp-metric-icon grp-metric-icon--live" aria-hidden="true"><span className="grp-live-dot" /></span>
          <span className="grp-metric-body">
            <span className="grp-metric-num">{metrics.totalStudying}</span>
            <span className="grp-metric-label">Studying now</span>
          </span>
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="grp-layout">
        <div className="grp-main">
          {filtersActive ? (
            filtered.length > 0 ? (
              <div className="grp-section grp-section--first">
                <div className="grp-section-head">
                  <div>
                    <div className="grp-section-kicker">Results</div>
                    <h2 className="grp-section-title">
                      {searchQuery ? `Search: "${searchQuery}"` : showFilteredLabel()}
                    </h2>
                    <p className="grp-section-sub">{filtered.length} {filtered.length === 1 ? 'group' : 'groups'} found</p>
                  </div>
                  <button className="grp-section-link" onClick={clearAll}>Reset filters</button>
                </div>
                <div className="grp-discover-grid">
                  {filtered.map(g => (
                    <GroupCard key={g.id} group={g} onOpen={openGroup} onJoin={toggleJoin} pending={!!pendingJoin[g.id]} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grp-empty grp-section--first">
                <div className="grp-empty-doodle" aria-hidden="true">🔍</div>
                <h3 className="grp-empty-title">Nothing matched</h3>
                <p className="grp-empty-text">Try a different keyword or remove a filter or two — the right community is out there.</p>
                <button className="grp-empty-btn" onClick={clearAll}>Clear filters</button>
              </div>
            )
          ) : (
            <>
              {/* My Groups */}
              <section className="grp-section grp-section--first">
                <div className="grp-section-head">
                  <div>
                    <div className="grp-section-kicker">Your spaces</div>
                    <h2 className="grp-section-title">My Groups</h2>
                    <p className="grp-section-sub">Your spaces for learning, discussing, and collaborating.</p>
                  </div>
                  <button className="grp-section-link" onClick={() => { setMyFilter('mine'); setSearchQuery('') }}>
                    View all →
                  </button>
                </div>
                {myGroups.length > 0 ? (
                  <div className="grp-discover-grid">
                    {myGroups.map(g => (
                      <GroupCard key={g.id} group={g} onOpen={openGroup} onJoin={toggleJoin} pending={!!pendingJoin[g.id]} />
                    ))}
                  </div>
                ) : (
                  <div className="grp-empty">
                    <div className="grp-empty-doodle" aria-hidden="true">🎒</div>
                    <h3 className="grp-empty-title">Your study circle is waiting</h3>
                    <p className="grp-empty-text">Find a group that matches what you are learning right now.</p>
                    <button className="grp-empty-btn" onClick={() => { setMyFilter('all'); setSubjectFilter('all') }}>Discover groups</button>
                  </div>
                )}
              </section>

              {/* Discover */}
              {discover.length > 0 && (
                <section className="grp-section">
                  <div className="grp-section-head">
                    <div>
                      <div className="grp-section-kicker">Explore more</div>
                      <h2 className="grp-section-title">Discover Groups</h2>
                      <p className="grp-section-sub">Something new to learn is always around the corner.</p>
                    </div>
                  </div>
                  <div className="grp-discover-grid">
                    {discover.map((g, i) => (
                      <div key={g.id} className="grp-card-wrap" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                        <GroupCard group={g} onOpen={openGroup} onJoin={toggleJoin} pending={!!pendingJoin[g.id]} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending */}
              {trending.length > 0 && (
                <section className="grp-section">
                  <div className="grp-section-head">
                    <div>
                      <div className="grp-section-kicker">What is hot</div>
                      <h2 className="grp-section-title">Trending in Learnova</h2>
                      <p className="grp-section-sub">A peek at where the community is gathering right now.</p>
                    </div>
                  </div>
                  <div className="grp-trend-list">
                    {trending.slice(0, 3).map(g => {
                      const theme = themeFor(g.subject)
                      return (
                        <button
                          className="grp-trend-card"
                          key={g.id}
                          onClick={() => openGroup(g.id)}
                          style={{ '--accent': theme.accent, '--accent-soft': theme.soft }}
                        >
                          <span className="grp-trend-emoji" aria-hidden="true">
                            <span className="grp-trend-art"><SubjectArt glyph={theme.glyph} /></span>
                          </span>
                          <span className="grp-trend-info">
                            <span className="grp-trend-label">{cleanTrend(g.trendingLabel)}</span>
                            <span className="grp-trend-name">{g.name}</span>
                            <span className="grp-trend-metrics">{g.members} members · {g.activeNow} studying now</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* ---------- Community Pulse ---------- */}
        <CommunityPulse
          onOpenGroup={openGroup}
          popular={popular}
          totalStudying={metrics.totalStudying}
          trendingCount={trending.length}
          totalDiscussions={metrics.totalDiscussions}
        />
      </div>

      {/* ---------- Create Group modal ---------- */}
      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}

      {/* ---------- Feedback toast ---------- */}
      {toast && (
        <div className={`grp-toast ${toast.tone === 'success' ? 'grp-toast--success' : ''}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      )}
    </div>
  )
}

/* helper to build the filtered-section label (shown when filter chips are active) */
function showFilteredLabel() {
  return 'Filtered groups'
}

const MY_FILTERS = {
  all: { label: 'All Groups' },
  mine: { label: 'My Groups' },
  following: { label: 'Following' },
  recent: { label: 'Recently Visited' },
}

const ACTIVITY_FILTERS = {
  all: { label: 'All Activity' },
  active: { label: 'Active Now' },
  new: { label: 'New Discussions' },
  events: { label: 'Upcoming Events' },
  created: { label: 'Recently Created' },
}

const SORT_FILTERS = {
  recommended: { label: 'Recommended' },
  mostActive: { label: 'Most Active' },
  newest: { label: 'Newest' },
  mostMembers: { label: 'Most Members' },
}
