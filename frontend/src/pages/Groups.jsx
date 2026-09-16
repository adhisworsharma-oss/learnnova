import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Groups.css'

/* ============================================================
   Learnova — Study Groups (Digital Study Lounge · discovery)
   Show less initially, reveal more when needed.
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

/* ------------------- small icons ------------------- */

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChevronIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const UsersIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TalkIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const XIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

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
        {icon && <span aria-hidden="true">{icon}</span>}
        {valueLabel && valueLabel !== label ? <em>{label}: {valueLabel}</em> : label}
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

/* ------------------- group cards ------------------- */

function MindsBadge({ count }) {
  return (
    <span className="grp-mine-minds">🔥 {count} minds studying here</span>
  )
}

function MyGroupCard({ group, onOpen }) {
  return (
    <article className={`grp-mine-card grp-tint--${group.tint}`} onClick={() => onOpen(group.id)}>
      <span className="grp-mine-doodle" aria-hidden="true">{group.doodle}</span>

      <div className="grp-mine-card-top">
        <span className="grp-mine-subject">{group.subject}</span>
        <span className="grp-mine-active">
          <span className="grp-live-dot" />
          {group.activeNow} studying
        </span>
      </div>

      <h3 className="grp-mine-name">{group.name}</h3>
      <p className="grp-mine-desc">{group.description}</p>

      <div className="grp-mine-stats">
        <span className="grp-mine-stat"><UsersIcon /> <strong>{group.members}</strong> members</span>
        <span className="grp-mine-stat"><TalkIcon /> <strong>{group.posts}</strong> discussions</span>
        <div className="grp-stacked-avatars" aria-hidden="true">
          {group.memberAvatars.map(([initials, color], i) => (
            <span key={i} className="grp-stack-avatar" style={{ background: color }}>{initials}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <MindsBadge count={group.activeNow} />
        <button className="grp-mine-open" onClick={e => { e.stopPropagation(); onOpen(group.id) }}>
          Open Group
          <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}

function DiscoverCard({ group, onOpen, onToggleJoin }) {
  return (
    <article className="grp-discover-card" onClick={() => onOpen(group.id)}>
      <div className="grp-discover-head">
        <div className="grp-discover-avatar" style={{ background: group.accent }}>{group.name.charAt(0)}</div>
        <div className="grp-discover-id">
          <div className="grp-discover-subject">{group.subject}</div>
          <div className="grp-discover-name">{group.name}</div>
        </div>
      </div>

      <p className="grp-discover-desc">{group.description}</p>

      <div className="grp-discover-footer">
        <div className="grp-discover-meta">
          <span><UsersIcon size={13} /> {group.members}</span>
          {group.activeNow > 0 && (
            <span className="grp-live-tag">
              <span className="grp-live-dot" />
              {group.activeNow}
            </span>
          )}
        </div>
        <button
          className={`grp-join-btn ${group.isJoined ? 'grp-join-btn--joined' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleJoin(group.id) }}
          aria-pressed={group.isJoined}
        >
          {group.isJoined ? 'Joined' : 'Join Group'}
        </button>
      </div>
    </article>
  )
}

function TrendCard({ group, onOpen }) {
  return (
    <article className="grp-trend-card" onClick={() => onOpen(group.id)}>
      <div className="grp-trend-emoji" aria-hidden="true">{group.doodle}</div>
      <div className="grp-trend-info">
        <div className="grp-trend-label">{group.trendingLabel}</div>
        <div className="grp-trend-name">{group.name}</div>
        <div className="grp-trend-metrics">{group.members} members · {group.activeNow} studying now</div>
      </div>
    </article>
  )
}

/* ------------------- community pulse ------------------- */

const PULSE_EVENTS = [
  { month: 'SEP', day: '18', name: 'Algorithms Night', group: 'Computer Science Hub' },
  { month: 'SEP', day: '21', name: 'Group Q&A', group: 'Book Club' },
]

function CommunityPulse({ onOpenGroup }) {
  return (
    <aside className="grp-pulse">
      <div className="grp-pulse-card">
        <h3 className="grp-pulse-title"><span aria-hidden="true">🎈</span> Community Pulse</h3>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title">Upcoming</div>
          {PULSE_EVENTS.map(ev => (
            <div className="grp-pulse-event" key={ev.name}>
              <div className="grp-pulse-date">
                <span className="grp-pulse-date-month">{ev.month}</span>
                <span className="grp-pulse-date-day">{ev.day}</span>
              </div>
              <div>
                <div className="grp-pulse-event-name">{ev.name}</div>
                <div className="grp-pulse-event-group">{ev.group}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title">Activity</div>
          <div className="grp-pulse-activity"><span className="emoji">🔥</span> 24 students studying now</div>
          <div className="grp-pulse-activity"><span className="emoji">💡</span> 8 new discussions today</div>
        </div>

        <div className="grp-pulse-block">
          <div className="grp-pulse-block-title">Popular</div>
          <div className="grp-pulse-popular" onClick={() => onOpenGroup(1)}>
            <span className="grp-pulse-rank">1</span>
            <div>
              <div className="grp-pulse-popular-name">Computer Science Hub</div>
              <div className="grp-pulse-popular-meta">24 active · 128 members</div>
            </div>
            <div className="grp-pulse-popular-avatar" style={{ background: '#7046C5' }}>C</div>
          </div>
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
            <div className="grp-modal-success-icon">🎉</div>
            <h3>Group created!</h3>
            <p>{`"${name}" is ready. Invite your classmates and start the first discussion.`}</p>
            <button className="grp-create-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
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

  const [myFilter, setMyFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [more, setMore] = useState({ public: false, level: 'all', events: false, active: false })

  function toggleJoin(groupId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 }
        : g
    ))
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

      {/* ---------- Filter Dashboard ---------- */}
      <div className="grp-filters">
        <FilterDropdown
          label="All Groups"
          valueLabel={MY_FILTERS[myFilter].label}
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

      {/* ---------- Community Summary ---------- */}
      <div className="grp-summary">
        <span className="grp-summary-label"><span aria-hidden="true">🪴</span> Your study community</span>
        <span className="grp-summary-sep" aria-hidden="true" />
        <span className="grp-summary-item"><strong>{groups.length}</strong> groups</span>
        <span className="grp-summary-item"><strong>887</strong> members</span>
        <span className="grp-summary-item"><strong>2.1k</strong> discussions</span>
        <span className="grp-summary-item"><span aria-hidden="true">🔥</span> <strong>153</strong> studying now</span>
      </div>

      {/* ---------- Content ---------- */}
      <div className="grp-layout">
        <div className="grp-main">
          {filtersActive ? (
            filtered.length > 0 ? (
              <div className="grp-section" style={{ marginTop: '44px' }}>
                <div className="grp-section-head">
                  <div>
                    <div className="grp-section-kicker">Results</div>
                    <h2 className="grp-section-title" style={{ fontFamily: 'var(--grp-font-display)', fontSize: '1.15rem' }}>
                      {searchQuery ? `Search: "${searchQuery}"` : showFilteredLabel()}
                    </h2>
                  </div>
                  <span className="grp-section-link" onClick={clearAll}>Reset filters</span>
                </div>
                <div className="grp-discover-grid">{filtered.map(g => (
                  <DiscoverCard key={g.id} group={g} onOpen={openGroup} onToggleJoin={toggleJoin} />
                ))}</div>
              </div>
            ) : (
              <div className="grp-empty" style={{ marginTop: '44px' }}>
                <div className="grp-empty-doodle" aria-hidden="true">🔍</div>
                <h3 className="grp-empty-title">Nothing matched</h3>
                <p className="grp-empty-text">Try a different keyword or remove a filter or two — the right community is out there.</p>
                <button className="grp-empty-btn" onClick={clearAll}>Clear filters</button>
              </div>
            )
          ) : (
            <>
              {/* My Groups */}
              <section className="grp-section">
                <div className="grp-section-head">
                  <div>
                    <div className="grp-section-kicker">Your spaces</div>
                    <h2 className="grp-section-title">My Groups</h2>
                    <p className="grp-section-sub">Your spaces for learning, discussing, and collaborating.</p>
                  </div>
                  <button className="grp-section-link" onClick={() => { setMyFilter('mine'); setSearchQuery(''); }}>
                    View all →
                  </button>
                </div>
                {myGroups.length > 0 ? (
                  <div className="grp-mine-grid">
                    {myGroups.map(g => <MyGroupCard key={g.id} group={g} onOpen={openGroup} />)}
                  </div>
                ) : (
                  <div className="grp-empty">
                    <div className="grp-empty-doodle" aria-hidden="true">🎒</div>
                    <h3 className="grp-empty-title">Your study circle is waiting</h3>
                    <p className="grp-empty-text">Find a group that matches what you are learning right now.</p>
                    <button className="grp-empty-btn" onClick={() => { setMyFilter('all'); setSubjectFilter('all'); }}>Discover groups</button>
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
                      <div key={g.id} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                        <DiscoverCard group={g} onOpen={openGroup} onToggleJoin={toggleJoin} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending */}
              <section className="grp-section">
                <div className="grp-section-head">
                  <div>
                    <div className="grp-section-kicker">What is hot</div>
                    <h2 className="grp-section-title">Trending in Learnova</h2>
                    <p className="grp-section-sub">A peek at where the community is gathering right now.</p>
                  </div>
                </div>
                <div className="grp-trend-list">
                  {trending.slice(0, 3).map(g => <TrendCard key={g.id} group={g} onOpen={openGroup} />)}
                </div>
              </section>
            </>
          )}
        </div>

        {/* ---------- Community Pulse ---------- */}
        <CommunityPulse onOpenGroup={openGroup} />
      </div>

      {/* ---------- Create Group modal ---------- */}
      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}
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