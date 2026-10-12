import { useState, useEffect, useMemo } from 'react'
import { api, getToken } from '../api.js'
import './Books.css'

/* ------------------------------------------------------------------
   BCA Digital Library — Learnova
   A modern, course-aligned library for the Bachelor of Computer
   Applications programme. Card-based layout, subject browsing and a
   clean academic interface.

   Data comes from GET /api/books (with a graceful demo catalogue
   fallback), favorites from /api/favorites and reading state from
   /api/reading.
------------------------------------------------------------------- */

const COPY = {
  eyebrow: 'Learnova · BCA Programme',
  title: 'BCA Digital Library',
  subtitle:
    'Course-aligned textbooks and references for the Bachelor of Computer Applications — browse by subject, author, or programming language.',
  searchPlaceholder: 'Search BCA books, subjects, authors, or programming languages...',
}

/* Subjects that make up the BCA reading list. */
const SUBJECTS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'Java', label: 'Java' },
  { id: 'C Programming', label: 'C Programming' },
  { id: 'C++', label: 'C++' },
  { id: 'Python', label: 'Python' },
  { id: 'DBMS', label: 'DBMS' },
  { id: 'Operating Systems', label: 'Operating Systems' },
  { id: 'Computer Networks', label: 'Computer Networks' },
  { id: 'Data Structures', label: 'Data Structures' },
  { id: 'Software Engineering', label: 'Software Engineering' },
  { id: 'Web Development', label: 'Web Development' },
  { id: 'AI', label: 'AI' },
  { id: 'Machine Learning', label: 'Machine Learning' },
  { id: 'Cyber Security', label: 'Cyber Security' },
  { id: 'Cloud Computing', label: 'Cloud Computing' },
]

const COLLECTIONS = [
  { id: 'all', label: 'All Books' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'favorites', label: 'Favorites' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'title', label: 'Title A – Z' },
  { id: 'author', label: 'Author' },
  { id: 'rating', label: 'Top Rated' },
]

/* Per-subject visual identity — used for cover fallbacks, chips and tags. */
const SUBJECT_THEMES = {
  Java: { a: '#f59e0b', b: '#ea580c', soft: '#fff4e6', ink: '#c2410c' },
  'C Programming': { a: '#3b82f6', b: '#1e3a8a', soft: '#eaf1ff', ink: '#1d4ed8' },
  'C++': { a: '#38bdf8', b: '#0c4a6e', soft: '#e6f6fe', ink: '#0369a1' },
  Python: { a: '#facc15', b: '#2563eb', soft: '#eef3ff', ink: '#1d4ed8' },
  DBMS: { a: '#14b8a6', b: '#0f766e', soft: '#e6faf7', ink: '#0f766e' },
  'Operating Systems': { a: '#a855f7', b: '#6d28d9', soft: '#f5edff', ink: '#7c3aed' },
  'Computer Networks': { a: '#06b6d4', b: '#0e7490', soft: '#e6f9fd', ink: '#0e7490' },
  'Data Structures': { a: '#22c55e', b: '#15803d', soft: '#eafaf0', ink: '#15803d' },
  'Software Engineering': { a: '#f59e0b', b: '#b45309', soft: '#fff6e8', ink: '#b45309' },
  'Web Development': { a: '#ec4899', b: '#be185d', soft: '#fdeef5', ink: '#be185d' },
  AI: { a: '#6366f1', b: '#4338ca', soft: '#eef0ff', ink: '#4338ca' },
  'Machine Learning': { a: '#8b5cf6', b: '#5b21b6', soft: '#f4f0ff', ink: '#6d28d9' },
  'Cyber Security': { a: '#ef4444', b: '#991b1b', soft: '#fdecec', ink: '#b91c1c' },
  'Cloud Computing': { a: '#0ea5e9', b: '#0369a1', soft: '#e8f6fe', ink: '#0369a1' },
  __default: { a: '#64748b', b: '#334155', soft: '#f1f5f9', ink: '#475569' },
}

function subjectTheme(subject) {
  return SUBJECT_THEMES[subject] || SUBJECT_THEMES.__default
}

/* Curated BCA course catalogue (demo / offline fallback). */
const BCA_BOOKS = [
  // ---------- Java ----------
  { title: 'Java: The Complete Reference', author: 'Herbert Schildt', subject: 'Java', isbn: '9781260440232', rating: 4.8, pageCount: 1248, level: 'Intermediate', description: 'The definitive guide to Java — the language, the standard library and modern features through the latest Java SE release.' },
  { title: 'Head First Java', author: 'Kathy Sierra & Bert Bates', subject: 'Java', isbn: '9781491910771', rating: 4.7, pageCount: 752, level: 'Beginner', description: 'A brain-friendly introduction that makes object-oriented Java click through visuals, puzzles and real projects.' },
  { title: 'Java: How to Program', author: 'Paul Deitel & Harvey Deitel', subject: 'Java', isbn: '9780134743356', rating: 4.5, pageCount: 1248, level: 'Beginner', description: 'A comprehensive, example-driven introduction to Java and object-oriented application development.' },

  // ---------- C Programming ----------
  { title: 'Let Us C', author: 'Yashavant Kanetkar', subject: 'C Programming', isbn: '9788183331630', rating: 4.6, pageCount: 656, level: 'Beginner', description: 'The classroom favourite for learning C from scratch, with clear explanations and plenty of solved programs.' },
  { title: 'Programming in ANSI C', author: 'E. Balagurusamy', subject: 'C Programming', isbn: '9789352602209', rating: 4.5, pageCount: 616, level: 'Beginner', description: 'A structured, syllabus-friendly text introducing C fundamentals, arrays, pointers, structures and files.' },
  { title: 'The C Programming Language', author: 'Brian W. Kernighan & Dennis M. Ritchie', subject: 'C Programming', isbn: '9780131103627', rating: 4.8, pageCount: 288, level: 'Advanced', description: 'The classic K&R text from the creators of C — concise, precise and timeless.' },

  // ---------- C++ ----------
  { title: 'C++ Primer', author: 'Stanley B. Lippman, José Lajoie & Barbara Moo', subject: 'C++', isbn: '9780321714114', rating: 4.7, pageCount: 976, level: 'Intermediate', description: 'The go-to introduction to modern C++, progressing from fundamentals to generic and object-oriented programming.' },
  { title: 'Effective C++', author: 'Scott Meyers', subject: 'C++', isbn: '9780321334879', rating: 4.7, pageCount: 320, level: 'Advanced', description: '55 specific ways to improve your programs and designs — essential reading for serious C++ developers.' },
  { title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', subject: 'C++', isbn: '9780321563842', rating: 4.6, pageCount: 1376, level: 'Advanced', description: 'The authoritative reference on C++ from its designer, covering the language and standard library in depth.' },

  // ---------- Python ----------
  { title: 'Python Crash Course', author: 'Eric Matthes', subject: 'Python', isbn: '9781593279288', rating: 4.7, pageCount: 544, level: 'Beginner', description: 'A hands-on, project-based introduction to programming with Python for absolute beginners.' },
  { title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', subject: 'Python', isbn: '9781593279929', rating: 4.7, pageCount: 592, level: 'Beginner', description: 'Practical programming for total beginners — write scripts to automate everyday tasks.' },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', subject: 'Python', isbn: '9781098104030', rating: 4.6, pageCount: 579, level: 'Intermediate', description: 'Data wrangling with pandas, NumPy and IPython — the reference for data work in Python.' },

  // ---------- DBMS ----------
  { title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry Korth & S. Sudarshan', subject: 'DBMS', isbn: '9780078022159', rating: 4.7, pageCount: 1376, level: 'Intermediate', description: 'A rigorous yet accessible introduction to database design, SQL, transactions and modern data systems.' },
  { title: 'Fundamentals of Database Systems', author: 'Ramez Elmasri & Shamkant Navathe', subject: 'DBMS', isbn: '9780133970777', rating: 4.6, pageCount: 1272, level: 'Intermediate', description: 'A complete foundation in database modelling, design, implementation and administration.' },

  // ---------- Operating Systems ----------
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz, Peter Galvin & Greg Gagne', subject: 'Operating Systems', isbn: '9781118063330', rating: 4.7, pageCount: 944, level: 'Intermediate', description: 'The classic "dinosaur book" — processes, concurrency, memory management, storage and protection.' },
  { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum & Herbert Bos', subject: 'Operating Systems', isbn: '9780133591620', rating: 4.6, pageCount: 1136, level: 'Advanced', description: 'A comprehensive overview of operating system design, from processes and threads to distributed systems.' },

  // ---------- Computer Networks ----------
  { title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose & Keith Ross', subject: 'Computer Networks', isbn: '9780133594140', rating: 4.7, pageCount: 864, level: 'Intermediate', description: 'Learn networking by working from applications down to the physical layer — a student favourite.' },
  { title: 'Computer Networks', author: 'Andrew S. Tanenbaum & David Wetherall', subject: 'Computer Networks', isbn: '9780132126953', rating: 4.6, pageCount: 960, level: 'Intermediate', description: 'A clear, structured tour of network architecture, protocols and the Internet.' },

  // ---------- Data Structures ----------
  { title: 'Data Structures Using C', author: 'Reema Thareja', subject: 'Data Structures', isbn: '9780198099307', rating: 4.5, pageCount: 656, level: 'Beginner', description: 'A practical guide to implementing linked lists, stacks, queues, trees and graphs in C.' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles Leiserson, Ronald Rivest & Clifford Stein', subject: 'Data Structures', isbn: '9780262046305', rating: 4.8, pageCount: 1312, level: 'Advanced', description: 'The definitive reference on algorithms — design, analysis and implementation, thoroughly explained.' },

  // ---------- Software Engineering ----------
  { title: 'Software Engineering', author: 'Ian Sommerville', subject: 'Software Engineering', isbn: '9780133943030', rating: 4.6, pageCount: 816, level: 'Intermediate', description: 'A balanced introduction to software processes, agile methods, architecture, testing and project management.' },
  { title: "Software Engineering: A Practitioner's Approach", author: 'Roger S. Pressman', subject: 'Software Engineering', isbn: '9780078022128', rating: 4.5, pageCount: 976, level: 'Intermediate', description: 'A practitioner-focused guide to the full software development lifecycle and modern engineering practice.' },

  // ---------- Web Development ----------
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', subject: 'Web Development', isbn: '9781118008188', rating: 4.7, pageCount: 512, level: 'Beginner', description: 'A beautifully illustrated, beginner-friendly introduction to building websites with HTML and CSS.' },
  { title: 'Learning React', author: 'Alex Banks & Eve Porcello', subject: 'Web Development', isbn: '9781492051725', rating: 4.5, pageCount: 310, level: 'Intermediate', description: 'Modern patterns for building web applications with React, hooks and functional programming.' },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', subject: 'Web Development', isbn: '9780596517748', rating: 4.3, pageCount: 176, level: 'Intermediate', description: 'A concise guide to the elegant, reliable features of JavaScript and how to use them well.' },

  // ---------- AI ----------
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', subject: 'AI', isbn: '9780134610993', rating: 4.7, pageCount: 1152, level: 'Advanced', description: 'The leading textbook on AI — search, knowledge, learning, perception and the future of intelligent agents.' },

  // ---------- Machine Learning ----------
  { title: 'Machine Learning', author: 'Tom M. Mitchell', subject: 'Machine Learning', isbn: '9780070428072', rating: 4.5, pageCount: 432, level: 'Advanced', description: 'A foundational text covering supervised learning, reinforcement learning, neural networks and theory.' },
  { title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', author: 'Aurélien Géron', subject: 'Machine Learning', isbn: '9781098125974', rating: 4.8, pageCount: 856, level: 'Intermediate', description: 'Practical, code-first concepts and tools for building intelligent systems with Python.' },

  // ---------- Cyber Security ----------
  { title: 'Cyber Security: Understanding Cyber Crimes, Computer Forensics and Legal Perspectives', author: 'Nina Godbole & Sunit Belapure', subject: 'Cyber Security', isbn: '9788126521791', rating: 4.4, pageCount: 596, level: 'Intermediate', description: 'A syllabus-oriented introduction to cyber crimes, security technologies, forensics and cyber law.' },
  { title: 'Computer Security: Principles and Practice', author: 'William Stallings & Lawrie Brown', subject: 'Cyber Security', isbn: '9780134794105', rating: 4.5, pageCount: 800, level: 'Advanced', description: 'A comprehensive survey of computer and network security principles, technologies and practice.' },

  // ---------- Cloud Computing ----------
  { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Thomas Erl, Ricardo Puttini & Zaigham Mahmood', subject: 'Cloud Computing', isbn: '9780133387520', rating: 4.5, pageCount: 528, level: 'Intermediate', description: 'A vendor-neutral guide to cloud computing concepts, delivery models, virtualization and architecture.' },
  { title: 'Cloud Computing: A Hands-On Approach', author: 'Arshdeep Bahga & Vijay Madisetti', subject: 'Cloud Computing', isbn: '9780984882417', rating: 4.4, pageCount: 454, level: 'Intermediate', description: 'A project-based introduction to cloud platforms, virtualization and scalable application design.' },
]

function normalizeBook(b, index) {
  const addedMs = b.addedAt
    ? new Date(b.addedAt).getTime()
    : Date.now() - (index + 2) * 24 * 60 * 60 * 1000
  const subject = b.subject || b.category || 'General'
  return {
    id: b.id,
    title: b.title || 'Untitled',
    author: b.author || 'Unknown author',
    category: subject,
    subject,
    description: b.description || '',
    pageCount: b.pageCount || b.page_count || 0,
    rating: b.rating ?? null,
    level: b.level || '',
    language: b.language || 'English',
    isbn: b.isbn || '',
    addedAt: addedMs,
    cover: b.cover || '',
  }
}

const DEMO = BCA_BOOKS.map((b, i) => normalizeBook(b, i))

function bookInitials(title) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'B'
  return (
    words
      .slice(0, 2)
      .map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase())
      .filter(Boolean)
      .join('') || 'B'
  )
}

function coverUrl(book) {
  if (book.cover) return book.cover
  const isbn = String(book.isbn || '').replace(/[-\s]/g, '')
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
  return ''
}

function formatDate(ms) {
  if (!ms) return '\u2014'
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return '\u2014'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ------------------------------- Icons ------------------------------- */

function LibraryIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  )
}

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function HeartIcon({ size = 16, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function BookmarkIcon({ size = 16, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function StarIcon({ size = 13, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.6l2.92 6.05 6.68.87-4.92 4.62 1.27 6.56L12 17.7 5.05 20.7l1.27-6.56L1.4 9.52l6.68-.87z" />
    </svg>
  )
}

function GridIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function ListIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function FilterIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function SortIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="11" y2="6" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <line x1="4" y1="18" x2="6" y2="18" />
      <polyline points="15 15 18 18 15 21" />
      <line x1="18" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ---------------------------- Book cover ---------------------------- */

function BookCover({ book, url, coverClass, imgClass, fallbackClass, children }) {
  const [broken, setBroken] = useState(!url)
  const theme = subjectTheme(book.subject || book.category)
  const showImg = Boolean(url) && !broken

  return (
    <div className={coverClass}>
      {showImg && (
        <img
          className={imgClass}
          src={url}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          onError={() => setBroken(true)}
          onLoad={e => {
            // Open Library serves a 1px placeholder when a cover is missing.
            if (e.target.naturalWidth < 40) setBroken(true)
          }}
        />
      )}
      {!showImg && (
        <div
          className={fallbackClass}
          style={{ background: `linear-gradient(150deg, ${theme.a} 0%, ${theme.b} 100%)` }}
          aria-hidden="true"
        >
          <span className="book-cover-spine" />
          <span className="book-cover-initials">{bookInitials(book.title)}</span>
          <span className="book-cover-title">{book.title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

/* ------------------------------ Component --------------------------- */

export default function Books() {
  const [books, setBooks] = useState(DEMO)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCollection, setActiveCollection] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState(() => new Set())
  const [bookmarks, setBookmarks] = useState(() => new Set())

  const [selectedBook, setSelectedBook] = useState(null)
  const [detailProgress, setDetailProgress] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [readingAction, setReadingAction] = useState({ state: 'idle', message: '' })

  useEffect(() => {
    let cancelled = false
    async function fetchLibrary() {
      try {
        const res = await api('/books?limit=50')
        if (!cancelled && Array.isArray(res.books) && res.books.length > 0) {
          setBooks(res.books.map(normalizeBook))
        }
      } catch {
        // keep demo data
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchLibrary()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!getToken()) return
    api('/favorites')
      .then(res => setFavorites(new Set((res.books || []).map(b => b.bookId ?? b.id))))
      .catch(() => {})
    api('/bookmarks')
      .then(res => setBookmarks(new Set((res.books || []).map(b => b.bookId ?? b.id))))
      .catch(() => {})
  }, [])

  /* ---------- modal lifecycle ---------- */

  useEffect(() => {
    if (!selectedBook) return
    const onKey = e => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [selectedBook])

  useEffect(() => {
    if (!selectedBook) return
    let cancelled = false
    api(`/books/${selectedBook.id}`)
      .then(res => { if (!cancelled) setDetailProgress(res?.progress ?? null) })
      .catch(() => { if (!cancelled) setDetailProgress(null) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
    return () => { cancelled = true }
  }, [selectedBook])

  function closeModal() {
    setSelectedBook(null)
    setDetailProgress(null)
    setDetailLoading(false)
    setReadingAction({ state: 'idle', message: '' })
  }

  function openBook(book) {
    setSelectedBook(book)
    setDetailProgress(null)
    setDetailLoading(true)
    setReadingAction({ state: 'idle', message: '' })
  }

  /* ---------- favorites / bookmarks / reading ---------- */

  function toggleFavorite(id) {
    const wasFav = favorites.has(id)
    setFavorites(prev => {
      const next = new Set(prev)
      if (wasFav) next.delete(id)
      else next.add(id)
      return next
    })
    if (!getToken()) return
    const req = wasFav
      ? api(`/favorites/${id}`, { method: 'DELETE' })
      : api(`/favorites/${id}`, { method: 'POST' })
    req.catch(() => {
      setFavorites(prev => {
        const next = new Set(prev)
        if (wasFav) next.add(id)
        else next.delete(id)
        return next
      })
    })
  }

  function toggleBookmark(id) {
    const wasBookmarked = bookmarks.has(id)
    setBookmarks(prev => {
      const next = new Set(prev)
      if (wasBookmarked) next.delete(id)
      else next.add(id)
      return next
    })
    if (!getToken()) return
    const req = wasBookmarked
      ? api(`/bookmarks/${id}`, { method: 'DELETE' })
      : api(`/bookmarks/${id}`, { method: 'POST' })
    req.catch(() => {
      setBookmarks(prev => {
        const next = new Set(prev)
        if (wasBookmarked) next.add(id)
        else next.delete(id)
        return next
      })
    })
  }

  async function handleStartReading(book) {
    setReadingAction({ state: 'busy', message: '' })
    try {
      await api('/reading/start', { method: 'POST', body: { bookId: book.id } })
      setDetailProgress({ status: 'reading', currentPage: 0, pageCount: book.pageCount })
      setReadingAction({ state: 'ok', message: 'Added to your reading list.' })
    } catch {
      setReadingAction({ state: 'error', message: 'Sign in to start reading and track your progress.' })
    }
  }

  /* ---------- filtering + sorting ---------- */

  const { visible, stats, subjectChips } = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    const counts = new Map()
    let favCount = 0
    let recentCount = 0
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    books.forEach(b => {
      const subject = b.subject || b.category
      counts.set(subject, (counts.get(subject) || 0) + 1)
      if (favorites.has(b.id)) favCount++
      if (b.addedAt > thirtyDaysAgo) recentCount++
    })

    const list = books.filter(b => {
      if (term) {
        const hay = `${b.title} ${b.author} ${b.description} ${b.subject} ${b.category} ${b.level}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      if (activeCollection === 'favorites') return favorites.has(b.id)
      if (activeCategory !== 'all' && b.subject !== activeCategory) return false
      return true
    })

    const sorted = [...list]
    const sortKey = activeCollection === 'recent' ? 'newest' : sortBy
    switch (sortKey) {
      case 'author':
        sorted.sort((a, b) => a.author.localeCompare(b.author))
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
        break
      case 'newest':
        sorted.sort((a, b) => b.addedAt - a.addedAt)
        break
      case 'oldest':
        sorted.sort((a, b) => a.addedAt - b.addedAt)
        break
      default:
        sorted.sort((a, b) => a.title.localeCompare(b.title))
    }

    const chips = SUBJECTS
      .map(s => ({ ...s, count: s.id === 'all' ? books.length : (counts.get(s.id) || 0) }))
      .filter(s => s.id === 'all' || s.count > 0)

    return {
      visible: sorted,
      stats: { total: books.length, subjects: counts.size, favorites: favCount, recent: recentCount },
      subjectChips: chips,
    }
  }, [books, searchQuery, activeCategory, activeCollection, sortBy, favorites])

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeCategory !== 'all' || activeCollection !== 'all' || sortBy !== 'newest'

  function clearFilters() {
    setSearchQuery('')
    setActiveCategory('all')
    setActiveCollection('all')
    setSortBy('newest')
  }

  /* ---------- reading state for modal ---------- */

  function readingStatus() {
    if (detailLoading) return { tone: 'neutral', label: 'Checking...' }
    const p = detailProgress
    if (!p || !p.status) return { tone: 'ok', label: 'Available' }
    if (p.status === 'reading') {
      const percent = p.pageCount ? Math.min(100, Math.round((p.currentPage / p.pageCount) * 100)) : 0
      return { tone: 'info', label: `Reading \u00b7 ${percent}%` }
    }
    if (p.status === 'completed') return { tone: 'ok', label: 'Completed' }
    if (p.status === 'paused') return { tone: 'warn', label: 'Paused' }
    return { tone: 'ok', label: 'Available' }
  }

  function readingBtnLabel() {
    if (readingAction.state === 'ok') return 'Started reading'
    const p = detailProgress
    if (p?.status === 'completed') return 'Completed'
    if (p?.status === 'reading' || p?.status === 'paused') return 'Resume reading'
    return 'Start reading'
  }

  function readingPercent() {
    const p = detailProgress
    if (!p || !p.pageCount || !p.status) return 0
    return Math.min(100, Math.round((p.currentPage / p.pageCount) * 100))
  }

  /* ------------------------------ Render ---------------------------- */

  const status = readingStatus()
  const selectedTheme = selectedBook ? subjectTheme(selectedBook.subject || selectedBook.category) : null

  return (
    <div className="books-page">
      {/* ---------- Hero ---------- */}
      <section className="books-hero">
        <div className="books-hero-orbs" aria-hidden="true">
          <span className="books-hero-orb books-hero-orb--a" />
          <span className="books-hero-orb books-hero-orb--b" />
        </div>

        <div className="books-hero-inner">
          <div className="books-hero-top">
            <div className="lib-logo" aria-hidden="true">
              <LibraryIcon size={26} />
            </div>
            <div className="books-hero-copy">
              <span className="books-eyebrow">{COPY.eyebrow}</span>
              <h1 className="books-title">{COPY.title}</h1>
              <p className="books-subtitle">{COPY.subtitle}</p>
            </div>
          </div>

          <div className="books-hero-search">
            <SearchIcon className="books-search-icon" />
            <input
              type="text"
              placeholder={COPY.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search BCA books, subjects, authors, or programming languages"
            />
            {searchQuery && (
              <button className="books-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <XIcon size={14} />
              </button>
            )}
          </div>

          <div className="books-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.total}</span>
              <span className="hero-stat-label">Books</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.subjects}</span>
              <span className="hero-stat-label">Subjects</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.favorites}</span>
              <span className="hero-stat-label">Favorites</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.recent}</span>
              <span className="hero-stat-label">New This Month</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Subject chips ---------- */}
      <div className="books-subjects" aria-label="Browse by subject">
        {subjectChips.map(subject => {
          const active = activeCategory === subject.id
          const theme = subject.id === 'all' ? null : subjectTheme(subject.id)
          return (
            <button
              key={subject.id}
              type="button"
              aria-pressed={active}
              className={`subject-chip ${active ? 'subject-chip--active' : ''}`}
              onClick={() => setActiveCategory(subject.id)}
              style={active && theme ? { background: theme.soft, color: theme.ink, borderColor: `${theme.ink}44` } : undefined}
            >
              {theme && (
                <span
                  className="subject-chip-dot"
                  style={{ background: `linear-gradient(135deg, ${theme.a}, ${theme.b})` }}
                />
              )}
              <span className="subject-chip-label">{subject.label}</span>
              <span className="subject-chip-count">{subject.count}</span>
            </button>
          )
        })}
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="books-filters">
        <div className="books-filter-group">
          <div className="books-select-wrap">
            <label className="books-select-label">
              <FilterIcon size={14} />
              Collection
            </label>
            <div className="books-select">
              <select value={activeCollection} onChange={e => setActiveCollection(e.target.value)} aria-label="Filter by collection">
                {COLLECTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronIcon className="books-select-chevron" />
            </div>
          </div>

          <div className="books-select-wrap">
            <label className="books-select-label">
              <SortIcon size={14} />
              Sort by
            </label>
            <div className="books-select">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort books">
                {SORT_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <ChevronIcon className="books-select-chevron" />
            </div>
          </div>
        </div>

        <div className="books-filters-right">
          <div className="books-view-toggle" role="radiogroup" aria-label="View mode">
            <button
              className={`books-view-btn ${viewMode === 'grid' ? 'books-view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <GridIcon size={16} />
            </button>
            <button
              className={`books-view-btn ${viewMode === 'list' ? 'books-view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <ListIcon size={16} />
            </button>
          </div>

          {hasActiveFilters && (
            <button className="books-clear-btn" onClick={clearFilters}>
              <XIcon size={13} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ---------- Results header ---------- */}
      <div className="books-results">
        <div>
          <h2 className="books-section-title">
            {searchQuery.trim()
              ? `Results for \u201c${searchQuery.trim()}\u201d`
              : activeCategory !== 'all'
                ? activeCategory
                : activeCollection === 'favorites'
                  ? 'Favorites'
                  : 'All Books'}
          </h2>
          <p className="books-section-sub">
            Showing {visible.length} of {books.length} books
          </p>
        </div>
      </div>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <div className={`books-grid ${viewMode === 'list' ? 'books-grid--list' : ''}`} aria-label="Loading library">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="book-card book-card--skeleton" key={i} aria-hidden="true">
              <div className="skeleton-cover" />
              <div className="book-card-body">
                <span className="skeleton-line" />
                <span className="skeleton-line skeleton-line--short" />
                <span className="skeleton-line skeleton-line--tiny" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className={`books-grid ${viewMode === 'list' ? 'books-grid--list' : ''}`}>
          {visible.map((book, i) => {
            const isFav = favorites.has(book.id)
            const theme = subjectTheme(book.subject)
            return (
              <article
                key={book.id}
                className={`book-card ${viewMode === 'list' ? 'book-card--list' : ''}`}
                onClick={() => openBook(book)}
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
              >
                <BookCover
                  book={book}
                  url={coverUrl(book)}
                  coverClass="book-card-cover"
                  imgClass="book-card-img"
                  fallbackClass="book-card-fallback"
                >
                  <span
                    className="book-card-subject"
                    style={{ color: theme.ink, background: theme.soft }}
                  >
                    {book.subject}
                  </span>
                  <button
                    className={`book-card-fav ${isFav ? 'book-card-fav--on' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleFavorite(book.id) }}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFav}
                  >
                    <HeartIcon size={14} filled={isFav} />
                  </button>
                </BookCover>

                <div className="book-card-body">
                  <h3 className="book-card-title" title={book.title}>{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>
                  <div className="book-card-footer">
                    {book.rating != null && (
                      <span className="book-card-rating">
                        <StarIcon size={12} filled />
                        {Number(book.rating).toFixed(1)}
                      </span>
                    )}
                    <button
                      className="book-card-btn"
                      onClick={e => { e.stopPropagation(); openBook(book) }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="books-empty">
          <div className="books-empty-icon">
            <LibraryIcon size={28} />
          </div>
          <h3>
            {books.length === 0
              ? 'The library is empty'
              : searchQuery.trim()
                ? `No results for \u201c${searchQuery.trim()}\u201d`
                : activeCollection === 'favorites'
                  ? 'No favorites yet'
                  : 'No books found'}
          </h3>
          <p>
            {books.length === 0
              ? 'New titles will appear here as they are added to the collection.'
              : searchQuery.trim()
                ? 'Try a different keyword, or clear your filters to browse everything.'
                : activeCollection === 'favorites'
                  ? 'Tap the heart on any book to save it here for quick access.'
                  : 'Try changing your search or filters.'}
          </p>
          {hasActiveFilters && (
            <button className="books-btn-soft" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ---------- Book details modal ---------- */}
      {selectedBook && (
        <div
          className="book-modal"
          role="presentation"
          onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="book-modal-card" role="dialog" aria-modal="true" aria-label={`${selectedBook.title} details`}>
            <button className="book-modal-close" autoFocus onClick={closeModal} aria-label="Close details">
              <XIcon size={16} />
            </button>

            <BookCover
              book={selectedBook}
              url={coverUrl(selectedBook)}
              coverClass="book-modal-cover"
              imgClass="book-modal-cover-img"
              fallbackClass="book-modal-cover-fallback"
            />

            <div className="book-modal-info">
              <div className="book-modal-badges">
                <span
                  className="book-modal-subject"
                  style={selectedTheme ? { color: selectedTheme.ink, background: selectedTheme.soft, borderColor: `${selectedTheme.ink}33` } : undefined}
                >
                  {selectedBook.subject}
                </span>
                <span className={`book-status book-status--${status.tone}`}>
                  <span className="book-status-dot" />
                  {status.label}
                </span>
              </div>

              <h2 className="book-modal-title">{selectedBook.title}</h2>
              <p className="book-modal-author">by {selectedBook.author}</p>

              {selectedBook.rating != null && (
                <div className="book-modal-rating" aria-label={`Rated ${selectedBook.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.round(Number(selectedBook.rating)) ? 'book-star--on' : 'book-star'}>
                      <StarIcon size={14} filled={star <= Math.round(Number(selectedBook.rating))} />
                    </span>
                  ))}
                  <span className="book-modal-rating-value">{Number(selectedBook.rating).toFixed(1)}</span>
                </div>
              )}

              {detailProgress?.status === 'reading' && (
                <div className="book-modal-progress">
                  <div className="book-modal-progress-track">
                    <div className="book-modal-progress-fill" style={{ width: `${readingPercent()}%` }} />
                  </div>
                  <span>{readingPercent()}% complete</span>
                </div>
              )}

              <p className="book-modal-desc">
                {selectedBook.description || 'No description available for this title yet.'}
              </p>

              <dl className="book-modal-meta">
                <div className="book-modal-meta-row">
                  <dt>Subject</dt>
                  <dd>{selectedBook.subject}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Level</dt>
                  <dd>{selectedBook.level || '\u2014'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Pages</dt>
                  <dd>{selectedBook.pageCount || '\u2014'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Language</dt>
                  <dd>{selectedBook.language || '\u2014'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>ISBN</dt>
                  <dd>{selectedBook.isbn || '\u2014'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Added</dt>
                  <dd>{formatDate(selectedBook.addedAt)}</dd>
                </div>
              </dl>

              <div className="book-modal-actions">
                <button
                  className="books-btn-primary book-modal-start"
                  onClick={() => handleStartReading(selectedBook)}
                  disabled={detailLoading || readingAction.state === 'busy' || readingAction.state === 'ok' || detailProgress?.status === 'completed'}
                >
                  {readingAction.state === 'busy' && <span className="spinner" />}
                  {(readingAction.state === 'ok' || detailProgress?.status === 'completed') && <CheckIcon size={15} />}
                  {readingBtnLabel()}
                </button>

                <button
                  className={`book-modal-fav-btn ${favorites.has(selectedBook.id) ? 'book-modal-fav-btn--on' : ''}`}
                  onClick={() => toggleFavorite(selectedBook.id)}
                  aria-pressed={favorites.has(selectedBook.id)}
                >
                  <HeartIcon size={15} filled={favorites.has(selectedBook.id)} />
                  {favorites.has(selectedBook.id) ? 'Saved' : 'Save'}
                </button>

                <button
                  className="book-modal-bookmark-btn"
                  onClick={() => toggleBookmark(selectedBook.id)}
                  aria-label={bookmarks.has(selectedBook.id) ? 'Remove bookmark' : 'Bookmark this book'}
                  aria-pressed={bookmarks.has(selectedBook.id)}
                  title={bookmarks.has(selectedBook.id) ? 'Remove bookmark' : 'Bookmark'}
                >
                  <BookmarkIcon size={16} filled={bookmarks.has(selectedBook.id)} />
                </button>
              </div>

              {readingAction.state === 'ok' && (
                <p className="book-modal-notice book-modal-notice--ok">
                  <CheckIcon size={14} />
                  {readingAction.message}
                </p>
              )}
              {readingAction.state === 'error' && (
                <p className="book-modal-notice book-modal-notice--error">
                  {readingAction.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
