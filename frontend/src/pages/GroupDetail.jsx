import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Groups.css'
import { GROUPS } from './Groups.jsx'

/* ============================================================
   Learnova — Study Groups (Group workspace)
   Calm header · clean tabs · elegant composer · discussion feed.
   ============================================================ */

/* ------------------- seed posts ------------------- */

const SEED_POSTS = [
  {
    id: 1,
    author: 'Alex Chen',
    initials: 'AC',
    color: '#7046C5',
    time: '2h ago',
    type: 'text',
    content: 'Weekly code review is on! Drop your PRs and we will do a live walkthrough on Saturday. Focus this week: binary search on answers — a personal favourite 🤓',
    likes: 24,
    comments: 9,
    liked: false,
  },
  {
    id: 2,
    author: 'Sara Park',
    initials: 'SP',
    color: '#5a9a8f',
    time: '4h ago',
    type: 'file',
    content: 'Refreshed the cheat sheet after yesterday’s session. Feel free to download and scribble all over it.',
    file: { name: 'dsa-cheatsheet-v3.pdf', size: '1.2 MB', ext: 'PDF' },
    likes: 41,
    comments: 13,
    liked: true,
  },
  {
    id: 3,
    author: 'Maya Torres',
    initials: 'MT',
    color: '#8a5aa8',
    time: '7h ago',
    type: 'poll',
    content: '',
    pollQuestion: 'Which format works best for the weekend mock interview?',
    options: [
      { label: 'Pair coding', votes: 18 },
      { label: 'Solo + review', votes: 11 },
      { label: 'Group whiteboard', votes: 7 },
    ],
    baseVotes: 36,
    voted: false,
    likes: 18,
    comments: 5,
    liked: false,
  },
  {
    id: 4,
    author: 'Raj Patel',
    initials: 'RP',
    color: '#b06a3c',
    time: '1d ago',
    type: 'audio',
    content: 'A 2-minute recap from our last session — the dynamic programming patterns bit. Slides are in Resources.',
    duration: '2:04',
    likes: 32,
    comments: 7,
    liked: false,
  },
  {
    id: 5,
    author: 'Nina Kim',
    initials: 'NK',
    color: '#3c7a8a',
    time: '1d ago',
    type: 'video',
    content: 'Screen-cast of today’s group whiteboard session. The stitching is a little rough but the algorithm part is gold.',
    video: { title: 'Group whiteboard session', length: '18:24' },
    likes: 57,
    comments: 21,
    liked: false,
  },
]

const MEMBERS_LIST = [
  { name: 'Alex Chen', initials: 'AC', color: '#7046C5', role: 'Admin', online: true },
  { name: 'Sara Park', initials: 'SP', color: '#5a9a8f', role: 'Moderator', online: true },
  { name: 'Raj Patel', initials: 'RP', color: '#b06a3c', role: 'Member', online: true },
  { name: 'Maya Torres', initials: 'MT', color: '#8a5aa8', role: 'Member', online: false },
  { name: 'Wei Zhang', initials: 'WZ', color: '#5a7a9a', role: 'Member', online: false },
  { name: 'Nina Kim', initials: 'NK', color: '#3c7a8a', role: 'Member', online: true },
]

const RESOURCES_LIST = [
  { icon: '📄', bg: '#ede6f8', title: 'DSA Cheat Sheet v3', type: 'PDF · 12 pages', author: 'Alex Chen' },
  { icon: '🎧', bg: '#e4ebe0', title: 'Focus playlist — study mix', type: 'Spotify link', author: 'Sara Park' },
  { icon: '🗂️', bg: '#efe8db', title: 'Past papers, 2025 edition', type: 'Folder · 8 files', author: 'Maya Torres' },
  { icon: '📘', bg: '#e4eaf0', title: 'Distributed Systems notes', type: 'Notion doc', author: 'Raj Patel' },
]

const EVENTS_LIST = [
  { month: 'SEP', day: '18', title: 'Algorithms Night', time: 'Fri · 6:00 PM', desc: 'Pair up and grind medium problems together.', attendees: 21 },
  { month: 'SEP', day: '24', title: 'Problem Set Party', time: 'Thu · 5:30 PM', desc: 'Bring past-paper roadblocks — we solve them live.', attendees: 32 },
  { month: 'OCT', day: '02', title: 'Mock Interview Sprint', time: 'Sat · 10:00 AM', desc: 'Full-length mocks with peer feedback.', attendees: 18 },
]

/* ------------------- icons ------------------- */

const PlayIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4l13 8-13 8z" />
  </svg>
)

const PauseIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

const StopIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

const HeartIcon = ({ size = 14, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CommentIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const ReplyIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
)

const ShareIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const BookmarkIcon = ({ size = 14, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const ArrowLeftIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
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

const DownloadIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const XIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ------------------- audio waveform ------------------- */

const WAVE_BARS = Array.from({ length: 44 }, (_, i) =>
  7 + Math.abs(Math.sin(i * 0.7) * 11 + Math.sin(i * 1.9) * 4)
)

function AudioPlayer({ duration }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)

  function toggle() {
    if (playing) {
      clearInterval(timerRef.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      const startedAt = Date.now() - progress * 120
      timerRef.current = setInterval(() => {
        const next = ((Date.now() - startedAt) / 120) * 100
        if (next >= 100) {
          clearInterval(timerRef.current)
          setPlaying(false)
        }
        setProgress(Math.min(100, next))
      }, 80)
    }
  }

  return (
    <div className="grp-audio-player">
      <button className="grp-audio-play" onClick={toggle} aria-label={playing ? 'Pause audio' : 'Play audio'}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="grp-audio-waveform">
        {WAVE_BARS.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}px` }}
            className={i / WAVE_BARS.length <= progress / 100 ? 'played' : ''}
          />
        ))}
      </div>
      <span className="grp-audio-duration">{duration}</span>
    </div>
  )
}

/* ------------------- post card ------------------- */

function PostCard({ post }) {
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [saved, setSaved] = useState(false)
  const [voted, setVoted] = useState(post.voted)
  const [votes, setVotes] = useState(post.options)

  function toggleLike() {
    setLiked(prev => {
      setLikeCount(c => (prev ? c - 1 : c + 1))
      return !prev
    })
  }

  function castVote(index) {
    if (voted) return
    setVoted(true)
    setVotes(prev => prev.map((o, i) => (i === index ? { ...o, votes: o.votes + 1 } : o)))
  }

  const hasContent = post.type === 'text' || (post.content && post.type !== 'poll')

  return (
    <article className="grp-post">
      <div className="grp-post-header">
        <div className="grp-post-avatar" style={{ background: post.color }}>{post.initials}</div>
        <div>
          <div className="grp-post-author">{post.author}</div>
          <div className="grp-post-time">{post.time}</div>
        </div>
        <button className="grp-post-more" aria-label="More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      </div>

      {hasContent && <div className="grp-post-content">{post.content}</div>}

      {post.type === 'file' && post.file && (
        <div className="grp-file-card">
          <div className="grp-file-card-icon">{post.file.ext}</div>
          <div className="grp-file-card-info">
            <div className="grp-file-card-name">{post.file.name}</div>
            <div className="grp-file-card-meta">{post.file.size} · shared by {post.author}</div>
          </div>
          <button className="grp-file-card-action">
            <DownloadIcon />
            Open
          </button>
        </div>
      )}

      {post.type === 'video' && post.video && (
        <div className="grp-post-media">
          <div className="grp-video-preview">
            <span style={{ fontSize: '2.4rem', position: 'absolute', top: 18, right: 24, opacity: 0.4 }} aria-hidden="true">🎬</span>
            <button className="grp-video-play" aria-label={`Play ${post.video.title}`}>
              <PlayIcon size={20} />
            </button>
            <span className="grp-video-label">{post.video.title}</span>
          </div>
        </div>
      )}

      {post.type === 'audio' && <AudioPlayer duration={post.duration} />}

      {post.type === 'poll' && (
        <div className="grp-poll">
          <div className="grp-poll-question">{post.pollQuestion}</div>
          {votes.map((opt, i) => {
            const total = votes.reduce((s, o) => s + o.votes, 0)
            const pct = total ? Math.round((opt.votes / total) * 100) : 0
            return (
              <div
                key={opt.label}
                className={`grp-poll-option ${voted && i === 0 ? 'grp-poll-option--selected' : ''}`}
                onClick={() => castVote(i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') castVote(i) }}
              >
                <div className="grp-poll-fill" style={{ width: voted ? `${pct}%` : 0 }} />
                <span className="grp-poll-label">{opt.label}</span>
                {voted && <span className="grp-poll-pct">{pct}%</span>}
              </div>
            )
          })}
          <div className="grp-poll-votes">
            {voted
              ? `You voted · ${votes.reduce((s, o) => s + o.votes, 0)} votes`
              : `${votes.reduce((s, o) => s + o.votes, 0)} votes so far — tap to vote`}
          </div>
        </div>
      )}

      <div className="grp-post-actions">
        <button className={`grp-post-action ${liked ? 'grp-post-action--liked' : ''}`} onClick={toggleLike} aria-pressed={liked}>
          <HeartIcon filled={liked} />
          {likeCount}
        </button>
        <button className="grp-post-action">
          <CommentIcon />
          {post.comments}
        </button>
        <button className="grp-post-action">
          <ReplyIcon />
          Reply
        </button>
        <button className="grp-post-action">
          <ShareIcon />
          Share
        </button>
        <button className="grp-post-action" onClick={() => setSaved(s => !s)} aria-pressed={saved}>
          <BookmarkIcon filled={saved} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  )
}

/* ------------------- audio composer ------------------- */

const REC_WAVE = Array.from({ length: 10 }, (_, i) => 10 + (i % 3) * 6)

function AudioComposer({ onAttached, onCancel }) {
  const [phase, setPhase] = useState('idle') // idle | recording | recording-paused | ready
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (phase !== 'recording') return undefined
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  if (phase === 'idle') return null

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className={`grp-audio-recorder ${phase === 'ready' ? 'grp-audio-recorder--preview' : ''}`}>
      <span className="grp-audio-rec-dot" style={phase === 'ready' ? { background: 'var(--grp-purple)', animation: 'none' } : undefined} />
      <span className="grp-audio-rec-timer" style={phase === 'ready' ? { color: 'var(--grp-purple)' } : undefined}>
        {mm}:{ss}
      </span>

      {phase === 'ready' ? (
        <div className="grp-audio-rec-preview-label">
          <PlayIcon size={12} />
          Preview
        </div>
      ) : (
        <div className="grp-audio-rec-waveform">
          {REC_WAVE.map((h, i) => (
            <span key={i} style={{ height: h, animationPlayState: phase === 'recording-paused' ? 'paused' : 'running' }} />
          ))}
        </div>
      )}

      {phase === 'ready' ? (
        <>
          <button className="grp-audio-rec-btn grp-audio-rec-btn--cancel" onClick={onCancel} aria-label="Delete recording">
            <XIcon size={13} />
          </button>
          <button className="grp-composer-submit" onClick={onAttached} style={{ height: 32 }}>
            <CheckIcon size={13} />
            Post Audio
          </button>
        </>
      ) : (
        <>
          {/* pause/resume */}
          <button
            className="grp-audio-rec-btn grp-audio-rec-btn--cancel"
            onClick={() => setPhase(p => (p === 'recording' ? 'recording-paused' : 'recording'))}
            aria-label={phase === 'recording' ? 'Pause recording' : 'Resume recording'}
          >
            {phase === 'recording' ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
          </button>
          <button className="grp-audio-rec-btn grp-audio-rec-btn--cancel" onClick={onCancel} aria-label="Delete recording">
            <XIcon size={13} />
          </button>
          <button className="grp-audio-rec-btn grp-audio-rec-btn--stop" onClick={() => setPhase('ready')} aria-label="Stop recording">
            <StopIcon size={13} />
          </button>
        </>
      )}
    </div>
  )
}

/* ------------------- post composer ------------------- */

function PostComposer({ onPost }) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [toast, setToast] = useState('')

  function toastMsg(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function handlePost() {
    if (!text.trim() && !recording) {
      toastMsg('Write something or record a voice note first 🙂')
      return
    }
    onPost(text)
    setText('')
    setRecording(false)
    toastMsg('Discussion started! 🎉')
  }

  return (
    <div className="grp-composer">
      <div className="grp-composer-top">
        <div className="grp-composer-avatar">U</div>
        <textarea
          className="grp-composer-input"
          placeholder="Share something with your study group…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={1}
          aria-label="Share something with your study group"
        />
      </div>

      {recording && (
        <AudioComposer
          onAttached={() => {
            setRecording(false)
            toastMsg('Voice note attached ✨')
          }}
          onCancel={() => setRecording(false)}
        />
      )}

      <div className="grp-composer-actions">
        <div className="grp-composer-tools">
          <button className="grp-composer-tool" data-tip="Attach a photo" onClick={() => toastMsg('Photo upload coming right up 📷')} aria-label="Add photo">
            <span className="emoji">📷</span> Photo
          </button>
          <button className="grp-composer-tool" data-tip="Attach a video" onClick={() => toastMsg('Video upload is ready 🎥')} aria-label="Add video">
            <span className="emoji">🎥</span> Video
          </button>
          <button
            className={`grp-composer-tool ${recording ? 'grp-composer-tool--recording' : ''}`}
            data-tip="Record a voice note"
            onClick={() => setRecording(r => !r)}
            aria-label="Record audio"
          >
            <span className="emoji">🎙️</span> Audio
          </button>
          <button className="grp-composer-tool" data-tip="Attach a file" onClick={() => toastMsg('File picker opened 📎')} aria-label="Add file">
            <span className="emoji">📎</span> File
          </button>
          <button className="grp-composer-tool" data-tip="Create a poll" onClick={() => toastMsg('Poll builder opened 📊')} aria-label="Create a poll">
            <span className="emoji">📊</span> Poll
          </button>
        </div>
        <button className="grp-composer-submit" onClick={handlePost}>
          Post
        </button>
      </div>

      {toast && <div className="grp-composer-toast">{toast}</div>}
    </div>
  )
}

/* ------------------- detail sidebar ------------------- */

function DetailSidebar() {
  return (
    <aside className="grp-detail-sidebar">
      <div className="grp-sidebar-card">
        <h3 className="grp-sidebar-title"><span aria-hidden="true">🗓️</span> Upcoming</h3>
        {EVENTS_LIST.slice(0, 2).map(ev => (
          <div className="grp-event-item" key={ev.title}>
            <div className="grp-event-date">
              <span className="grp-event-date-month">{ev.month}</span>
              <span className="grp-event-date-day">{ev.day}</span>
            </div>
            <div className="grp-event-info">
              <div className="grp-event-name">{ev.title}</div>
              <div className="grp-event-group">{ev.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grp-sidebar-card">
        <h3 className="grp-sidebar-title"><span aria-hidden="true">🟢</span> Active members</h3>
        {MEMBERS_LIST.slice(0, 4).map(m => (
          <div className="grp-member-row" key={m.name}>
            <div className="grp-member-avatar" style={{ background: m.color }}>
              {m.initials}
              {m.online && <span className="grp-member-online" style={{ width: 9, height: 9 }} />}
            </div>
            <div>
              <div className="grp-member-name">{m.name}</div>
              <div className="grp-member-role">{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grp-sidebar-card">
        <h3 className="grp-sidebar-title"><span aria-hidden="true">📚</span> Popular resources</h3>
        {RESOURCES_LIST.slice(0, 2).map(r => (
          <div className="grp-resource-item" key={r.title}>
            <div className="grp-resource-icon" style={{ background: r.bg }}>{r.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div className="grp-resource-title-sidebar">{r.title}</div>
              <div className="grp-resource-meta">by {r.author}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grp-sidebar-card">
        <h3 className="grp-sidebar-title"><span aria-hidden="true">📢</span> Announcements</h3>
        <div className="grp-announcement">
          <div className="grp-announcement-text">Mock interview slots are open — grab yours before they fly.</div>
          <div className="grp-announcement-time">posted by Alex Chen · 2h ago</div>
        </div>
        <div className="grp-announcement">
          <div className="grp-announcement-text">Cheat sheet v3 just landed in Resources.</div>
          <div className="grp-announcement-time">1d ago</div>
        </div>
      </div>

      <div className="grp-sidebar-card">
        <h3 className="grp-sidebar-title"><span aria-hidden="true">🔥</span> Study streak</h3>
        <div className="grp-streak">
          <div className="grp-streak-count">12 days</div>
          <div className="grp-streak-label">Study with the group to keep it alive</div>
          <div className="grp-streak-bar">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className={`grp-streak-day ${i < 5 ? 'grp-streak-day--done' : ''} ${i === 5 ? 'grp-streak-day--today' : ''}`}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ------------------- main component ------------------- */

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const group = GROUPS.find(g => g.id === Number(id)) || GROUPS[0]

  const [isJoined, setIsJoined] = useState(group.isJoined)
  const [membersCount, setMembersCount] = useState(group.members)
  const [activeTab, setActiveTab] = useState('discussions')
  const [posts, setPosts] = useState(SEED_POSTS)
  const [showEmpty, setShowEmpty] = useState(false)

  function toggleJoin() {
    setIsJoined(prev => {
      setMembersCount(c => (prev ? c - 1 : c + 1))
      return !prev
    })
  }

  function composerPost(text) {
    if (!text.trim()) return
    setPosts(prev => [
      {
        id: Date.now(),
        author: 'You',
        initials: 'U',
        color: '#7046C5',
        time: 'Just now',
        type: 'text',
        content: text,
        likes: 0,
        comments: 0,
        liked: false,
      },
      ...prev,
    ])
  }

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: <TalkIcon size={14} />, count: posts.length },
    { id: 'resources', label: 'Resources', icon: <span aria-hidden="true">📚</span>, count: RESOURCES_LIST.length },
    { id: 'events', label: 'Events', icon: <span aria-hidden="true">🗓️</span>, count: EVENTS_LIST.length },
    { id: 'members', label: 'Members', icon: <UsersIcon size={14} />, count: membersCount },
  ]

  return (
    <div className="groups-page grp-detail">
      {/* ---------- Group header ---------- */}
      <section className="grp-detail-header">
        <div className={`grp-detail-banner grp-tint--${group.tint}`}>
          <div className="grp-detail-banner-pattern" aria-hidden="true" />
          <div className="grp-detail-banner-doodle" style={{ top: 22, right: 260, transform: 'rotate(-8deg)' }} aria-hidden="true">
            {group.doodle}
          </div>
          <div className="grp-detail-banner-doodle" style={{ bottom: 0, right: 96, transform: 'rotate(14deg)', fontSize: '1.8rem' }} aria-hidden="true">
            ⭐
          </div>
          <div className="grp-detail-banner-doodle" style={{ top: 40, right: 40, fontSize: '1.7rem', transform: 'rotate(-4deg)' }} aria-hidden="true">
            ✏️
          </div>
        </div>

        <div className="grp-detail-header-body">
          <div className="grp-detail-avatar" style={{ background: group.accent }}>
            {group.name.charAt(0)}
          </div>
          <div className="grp-detail-info">
            <div className="grp-detail-cat">
              <span className="grp-detail-subject">{group.subject}</span>
              <span>{group.activeNow > 0 ? `${group.activeNow} studying now` : 'quiet right now'}</span>
            </div>
            <h1 className="grp-detail-name">{group.name}</h1>
            <p className="grp-detail-desc">{group.description}</p>
            <div className="grp-detail-stats">
              <span className="grp-detail-stat"><UsersIcon /> <strong>{membersCount}</strong> members</span>
              <span className="grp-detail-stat"><TalkIcon /> <strong>{posts.length}</strong> discussions</span>
            </div>
          </div>
          <div className="grp-detail-actions">
            <button className="grp-detail-back" onClick={() => navigate('/groups')}>
              <ArrowLeftIcon />
              All groups
            </button>
            <button
              className={`grp-detail-join ${isJoined ? 'grp-detail-join--joined' : 'grp-detail-join--join'}`}
              onClick={toggleJoin}
              aria-pressed={isJoined}
            >
              {isJoined ? <><CheckIcon size={14} /> Joined</> : 'Join group'}
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Tabs ---------- */}
      <div className="grp-tabs" role="tablist" aria-label="Group sections">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`grp-tab ${activeTab === tab.id ? 'grp-tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setShowEmpty(false) }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="grp-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ---------- Content ---------- */}
      <div className="grp-detail-layout">
        <div className="grp-main">
          {activeTab === 'discussions' && (
            <>
              <PostComposer onPost={composerPost} />
              {posts.length > 0 && !showEmpty ? (
                <div className="grp-feed">
                  {posts.map(p => <PostCard key={p.id} post={p} />)}
                </div>
              ) : (
                <div className="grp-feed-empty">
                  <div className="grp-empty-doodle" aria-hidden="true">💡</div>
                  <h3 className="grp-empty-title">No conversations yet</h3>
                  <p className="grp-empty-text">Be the first one to start the discussion. Big ideas start as tiny sparks.</p>
                  <button className="grp-empty-btn" onClick={() => setShowEmpty(false)}>Start a Discussion</button>
                </div>
              )}
            </>
          )}

          {activeTab === 'resources' && (
            <div className="grp-resources-list">
              {RESOURCES_LIST.map((r, i) => (
                <div className="grp-resource-card" key={r.title} style={{ animation: `grpFadeIn 0.4s ease-out ${i * 50}ms both` }}>
                  <div className="grp-resource-card-icon" style={{ background: r.bg }}>{r.icon}</div>
                  <div className="grp-resource-card-info">
                    <div className="grp-resource-card-title">{r.title}</div>
                    <div className="grp-resource-card-meta">{r.type} · by {r.author}</div>
                  </div>
                  <button className="grp-resource-card-action">
                    <DownloadIcon size={12} />
                    Open
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grp-events-list">
              {EVENTS_LIST.map(ev => (
                <div className="grp-event-card" key={ev.title}>
                  <div className="grp-event-card-date">
                    <span className="grp-event-card-month">{ev.month}</span>
                    <span className="grp-event-card-day">{ev.day}</span>
                  </div>
                  <div className="grp-event-card-info">
                    <div className="grp-event-card-title">{ev.title}</div>
                    <div className="grp-event-card-time">{ev.time}</div>
                    <div className="grp-event-card-desc">{ev.desc}</div>
                    <div className="grp-event-card-attendees">
                      <UsersIcon size={12} />
                      {ev.attendees} attending
                    </div>
                  </div>
                  <button className="grp-file-card-action" style={{ alignSelf: 'center' }}>Join</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="grp-members-grid">
              {MEMBERS_LIST.map(m => (
                <div className="grp-member-card" key={m.name}>
                  <div className="grp-member-card-avatar" style={{ background: m.color }}>
                    {m.initials}
                    {m.online && <span className="grp-member-online" />}
                  </div>
                  <div className="grp-member-card-info">
                    <div className="grp-member-card-name">{m.name}</div>
                    <div className="grp-member-card-role">{m.online ? 'online now' : 'away'}</div>
                  </div>
                  {m.role !== 'Member' && <span className="grp-member-role-tag">{m.role}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Detail sidebar ---------- */}
        <DetailSidebar group={group} />
      </div>
    </div>
  )
}