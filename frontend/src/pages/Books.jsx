import { useState, useEffect, useMemo } from 'react'
import { api, getToken } from '../api.js'
import './Books.css'

/* ------------------------------------------------------------------
   Library module — Learnova
   Warm editorial-style digital library.
   Data comes from GET /api/books (with graceful demo fallback),
   favorites from /api/favorites and reading state from /api/reading.
------------------------------------------------------------------- */

const COPY = {
  title: 'Library',
  subtitle: 'Explore, discover, and keep track of your collection.',
  searchPlaceholder: 'Search by title, author, topic, or category...',
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Computer Science', label: 'Computer Science' },
  { id: 'Data Science', label: 'Data Science' },
  { id: 'Design', label: 'Design' },
  { id: 'Business & Economics', label: 'Business & Economics' },
  { id: 'Literature', label: 'Literature' },
  { id: 'History', label: 'History' },
  { id: 'Science', label: 'Science' },
  { id: 'Self-Development', label: 'Self-Development' },
]

const COLLECTIONS = [
  { id: 'all', label: 'All Books' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'favorites', label: 'Favorites' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'title', label: 'A – Z' },
  { id: 'author', label: 'Author' },
  { id: 'rating', label: 'Top Rated' },
]

const CATEGORY_COVERS = {
  'Computer Science': { bg: '#4a5568', accent: '#a0aec0' },
  'Data Science': { bg: '#2d3748', accent: '#63b3ed' },
  'Design': { bg: '#553c9a', accent: '#d6bcfa' },
  'Business & Economics': { bg: '#744210', accent: '#fbd38d' },
  'Literature': { bg: '#22543d', accent: '#9ae6b4' },
  'History': { bg: '#742a2a', accent: '#fc8181' },
  'Science': { bg: '#1a365d', accent: '#90cdf4' },
  'Self-Development': { bg: '#702459', accent: '#fbb6ce' },
  'General': { bg: '#4a5568', accent: '#a0aec0' },
}

function categoryCover(category) {
  return CATEGORY_COVERS[category] || CATEGORY_COVERS['General']
}

const ISBN_MAP = {
  'Clean Code': '9780132350884',
  'Atomic Habits': '9780735211292',
  'Sapiens': '9780062316110',
  'Sapiens: A Brief History of Humankind': '9780062316110',
  'Thinking, Fast and Slow': '9780374533557',
  'The Design of Everyday Things': '9780465050659',
  'Deep Learning': '9780262035613',
  'Introduction to Algorithms': '9780262046305',
  'Thinking in Systems': '9781603581486',
  'The Lean Startup': '9780307887894',
  'To Kill a Mockingbird': '9780061120084',
  'Guns, Germs, and Steel': '9780393354324',
  'Guns, Germs, and Steel: The Fates of Human Societies': '9780393354324',
  'The Pragmatic Programmer': '9780135957059',
  'Designing Data-Intensive Applications': '9781449373320',
  'JavaScript: The Good Parts': '9780596517748',
  'Structure and Interpretation of Computer Programs': '9780262510875',
  'The Art of Computer Programming, Vol 1': '9780201896831',
  'Python for Data Analysis': '9781098104030',
  'The Elements of Statistical Learning': '9780387848570',
  'Hands-On Machine Learning with Scikit-Learn': '9781098125974',
  'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow': '9781098125974',
  'Data Science from Scratch': '9781492041139',
  "Don't Make Me Think": '9780321965516',
  'Thinking with Type': '9781568989693',
  'Zero to One': '9780804139298',
  "The Innovator's Dilemma": '9781633691780',
  'Freakonomics': '9780060731335',
  '1984': '9780451524935',
  'The Great Gatsby': '9780743273565',
  'Pride and Prejudice': '9780141439518',
  "A People's History of the United States": '9780062397348',
  'A Brief History of Time': '9780553380163',
  'The Selfish Gene': '9780198788607',
  'Cosmos': '9780345539434',
  'The Power of Habit': '9780812981605',
  'Deep Work': '9781455586691',
}

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', rating: 4.7, page_count: 464, level: 'Intermediate', description: 'A handbook of agile software craftsmanship covering naming, functions, comments, formatting and error handling.' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', rating: 4.6, page_count: 320, level: 'Beginner', description: 'An easy and proven way to build good habits and break bad ones.' },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 4.5, page_count: 464, level: 'Beginner', description: 'How a humble ape became the ruler of planet Earth.' },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Science', rating: 4.3, page_count: 499, level: 'Intermediate', description: 'A journey into how the two systems of the mind shape our judgment.' },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', rating: 4.5, page_count: 368, level: 'Beginner', description: 'Why design matters and how the best products are intuitive to use.' },
  { id: 6, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Data Science', rating: 4.2, page_count: 800, level: 'Advanced', description: 'An introduction to a broad range of topics in deep learning.' },
  { id: 7, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', rating: 4.6, page_count: 1312, level: 'Advanced', description: 'The most comprehensive textbook on algorithms.' },
  { id: 8, title: 'Thinking in Systems', author: 'Donella H. Meadows', category: 'Science', rating: 4.5, page_count: 218, level: 'Beginner', description: 'A primer on systems thinking.' },
  { id: 9, title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', rating: 4.3, page_count: 336, level: 'Beginner', description: 'How constant innovation creates radically successful businesses.' },
  { id: 10, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', rating: 4.4, page_count: 336, level: 'Beginner', description: 'The unforgettable novel of a childhood in a sleepy Southern town.' },
  { id: 11, title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', rating: 4.2, page_count: 518, level: 'Intermediate', description: 'The fates of human societies examined through geography and environment.' },
  { id: 12, title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Computer Science', rating: 4.6, page_count: 352, level: 'Intermediate', description: 'Your journey to mastery — tips, tools, and techniques for modern software development.' },
]

function normalizeBook(b, index) {
  const addedMs = b.addedAt
    ? new Date(b.addedAt).getTime()
    : Date.now() - (index + 2) * 24 * 60 * 60 * 1000
  return {
    id: b.id,
    title: b.title || 'Untitled',
    author: b.author || 'Unknown author',
    category: b.category || 'General',
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

const DEMO = DEMO_BOOKS.map((b, i) => normalizeBook(b, i))

function bookInitials(title) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'B'
  return words
    .slice(0, 2)
    .map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase())
    .filter(Boolean)
    .join('') || 'B'
}

function coverUrl(book) {
  if (book.cover) return book.cover
  const isbn = book.isbn || ISBN_MAP[book.title]
  if (isbn) {
    const clean = isbn.replace(/[-\s]/g, '')
    return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`
  }
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

  const { visible, stats } = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    const categories = new Set()
    let favCount = 0
    let recentCount = 0
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    books.forEach(b => {
      categories.add(b.category)
      if (favorites.has(b.id)) favCount++
      if (b.addedAt > thirtyDaysAgo) recentCount++
    })

    const list = books.filter(b => {
      if (term) {
        const hay = `${b.title} ${b.author} ${b.description} ${b.category}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      if (activeCollection === 'favorites') return favorites.has(b.id)
      if (activeCategory !== 'all' && b.category !== activeCategory) return false
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

    return {
      visible: sorted,
      stats: {
        total: books.length,
        categories: categories.size,
        favorites: favCount,
        recent: recentCount,
      },
    }
  }, [books, searchQuery, activeCategory, activeCollection, sortBy, favorites])

  const hasActiveFilters = searchQuery.trim() !== '' || activeCategory !== 'all' || activeCollection !== 'all' || sortBy !== 'newest'

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

  return (
    <div className="books-page">
      {/* ---------- Header ---------- */}
      <section className="books-hero">
        <div className="books-hero-top">
          <div className="lib-logo" aria-hidden="true">
            <LibraryIcon size={24} />
          </div>
          <div className="books-hero-copy">
            <h1 className="books-title">{COPY.title}</h1>
            <p className="books-subtitle">{COPY.subtitle}</p>
          </div>
        </div>
      </section>

      {/* ---------- Dashboard Stats ---------- */}
      <div className="books-stats">
        <div className="books-stat-card">
          <span className="books-stat-value">{stats.total}</span>
          <span className="books-stat-label">Books</span>
        </div>
        <div className="books-stat-card">
          <span className="books-stat-value">{stats.categories}</span>
          <span className="books-stat-label">Categories</span>
        </div>
        <div className="books-stat-card">
          <span className="books-stat-value">{stats.favorites}</span>
          <span className="books-stat-label">Favorites</span>
        </div>
        <div className="books-stat-card">
          <span className="books-stat-value">{stats.recent}</span>
          <span className="books-stat-label">This Month</span>
        </div>
      </div>

      {/* ---------- Filters Toolbar ---------- */}
      <div className="books-filters">
        <div className="books-search">
          <SearchIcon className="books-search-icon" />
          <input
            type="text"
            placeholder={COPY.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search books by title, author, or topic"
          />
          {searchQuery && (
            <button className="books-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <XIcon size={14} />
            </button>
          )}
        </div>

        <div className="books-filter-group">
          <div className="books-select-wrap">
            <label className="books-select-label">
              <FilterIcon size={14} />
              Category
            </label>
            <div className="books-select">
              <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} aria-label="Filter by category">
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronIcon className="books-select-chevron" />
            </div>
          </div>

          <div className="books-select-wrap">
            <label className="books-select-label">Collection</label>
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
              Sort
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
        </div>

        {hasActiveFilters && (
          <button className="books-clear-btn" onClick={clearFilters}>
            <XIcon size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* ---------- Results header ---------- */}
      <div className="books-results">
        <div>
          <h2 className="books-section-title">
            {searchQuery.trim() ? `Results for \u201c${searchQuery.trim()}\u201d` : 'All Books'}
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
            const url = coverUrl(book)
            return (
              <article
                key={book.id}
                className={`book-card ${viewMode === 'list' ? 'book-card--list' : ''}`}
                onClick={() => openBook(book)}
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
              >
                <div className="book-card-cover">
                  {url ? (
                    <img
                      className="book-card-img"
                      src={url}
                      alt={`Cover of ${book.title}`}
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div
                    className="book-card-fallback"
                    style={{
                      display: url ? 'none' : 'flex',
                      background: `linear-gradient(145deg, ${categoryCover(book.category).bg}, ${categoryCover(book.category).bg}dd)`,
                    }}
                  >
                    <span className="book-card-fallback-initial">{bookInitials(book.title)}</span>
                    <span className="book-card-fallback-title">{book.title}</span>
                  </div>
                  <button
                    className={`book-card-fav ${isFav ? 'book-card-fav--on' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleFavorite(book.id) }}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFav}
                  >
                    <HeartIcon size={14} filled={isFav} />
                  </button>
                </div>

                <div className="book-card-body">
                  <span className="book-card-category">{book.category}</span>
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

            <div className="book-modal-cover">
              {coverUrl(selectedBook) ? (
                <img
                  className="book-modal-cover-img"
                  src={coverUrl(selectedBook)}
                  alt={`Cover of ${selectedBook.title}`}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
              ) : null}
              <div
                className="book-modal-cover-fallback"
                style={{
                  display: coverUrl(selectedBook) ? 'none' : 'flex',
                  background: `linear-gradient(145deg, ${categoryCover(selectedBook.category).bg}, ${categoryCover(selectedBook.category).bg}dd)`,
                }}
              >
                <span className="book-modal-fallback-initial">{bookInitials(selectedBook.title)}</span>
                <span className="book-modal-fallback-title">{selectedBook.title}</span>
              </div>
            </div>

            <div className="book-modal-info">
              <div className="book-modal-badges">
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
                  <dt>Category</dt>
                  <dd>{selectedBook.category}</dd>
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
