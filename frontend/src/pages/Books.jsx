import { useState, useEffect, useMemo } from 'react'
import { api, getToken } from '../api.js'
import './Books.css'

/* ------------------------------------------------------------------
   Library module — Learnova
   Data comes from GET /api/books (with graceful demo fallback),
   favorites from /api/favorites and reading state from /api/reading.
------------------------------------------------------------------- */

const COPY = {
  title: 'Library',
  subtitle: 'Explore, discover, and keep track of every book in the Learnova collection.',
  searchPlaceholder: 'Search by title, author, or topic…',
}

const FILTERS = [
  { id: 'all', label: 'All Books' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'nonfiction', label: 'Non-Fiction' },
  { id: 'academic', label: 'Academic' },
  { id: 'reference', label: 'Reference' },
]

const GROUP_CATEGORIES = {
  fiction: ['Literature'],
  nonfiction: ['History', 'Science', 'Business & Economics', 'Self-Development'],
  academic: ['Computer Science', 'Data Science'],
  reference: ['Design'],
}

const SORT_OPTIONS = [
  { id: 'title', label: 'Title (A–Z)' },
  { id: 'author', label: 'Author (A–Z)' },
  { id: 'rating', label: 'Top rated' },
  { id: 'pages', label: 'Most pages' },
  { id: 'newest', label: 'Newest first' },
]

const CATEGORY_COLORS = {
  'Computer Science': '#6c42b9',
  'Data Science': '#2563eb',
  'Design': '#db2777',
  'Business & Economics': '#d97706',
  'Literature': '#059669',
  'History': '#7c3aed',
  'Science': '#0891b2',
  'Self-Development': '#ea580c',
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#7c6f95'
}

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', rating: 4.5, page_count: 464, level: 'Intermediate', description: 'A handbook of agile software craftsmanship covering naming, functions, comments, and error handling.' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', rating: 4.8, page_count: 320, level: 'Beginner', description: 'An easy and proven way to build good habits and break bad ones.' },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 4.6, page_count: 443, level: 'Beginner', description: 'A brief history of humankind — from ape to ruler of planet Earth.' },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Science', rating: 4.3, page_count: 499, level: 'Intermediate', description: 'A journey into how the two systems of the mind shape our judgment.' },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', rating: 4.4, page_count: 368, level: 'Beginner', description: 'The ultimate guide to human-centered design.' },
  { id: 6, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Data Science', rating: 4.2, page_count: 800, level: 'Advanced', description: 'An introduction to a broad range of topics in deep learning.' },
  { id: 7, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', rating: 4.6, page_count: 1312, level: 'Advanced', description: 'The most comprehensive textbook on algorithms.' },
  { id: 8, title: 'Thinking in Systems', author: 'Donella H. Meadows', category: 'Science', rating: 4.5, page_count: 218, level: 'Beginner', description: 'A primer on systems thinking.' },
  { id: 9, title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', rating: 4.2, page_count: 336, level: 'Beginner', description: 'How constant innovation creates radically successful businesses.' },
  { id: 10, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', rating: 4.7, page_count: 336, level: 'Beginner', description: 'A classic of modern American literature.' },
  { id: 11, title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', rating: 4.4, page_count: 480, level: 'Intermediate', description: 'The fates of human societies.' },
  { id: 12, title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Computer Science', rating: 4.7, page_count: 352, level: 'Intermediate', description: 'Your journey to mastery — tips, tools, and techniques for modern software development.' },
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
  const words = String(title || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return 'B'
  const t = words
    .slice(0, 2)
    .map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase())
    .filter(Boolean)
    .join('')
  return t || 'B'
}

function formatDate(ms) {
  if (!ms) return '—'
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ------------------------------- Icons ------------------------------- */

function LibraryIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

/* ----------------------------- Helpers ------------------------------ */

function coverGradient(category) {
  const c = categoryColor(category)
  return {
    background: `linear-gradient(165deg, ${c}2e 0%, ${c}12 58%, ${c}08 100%)`,
  }
}

function chipStyle(category) {
  const c = categoryColor(category)
  return {
    color: c,
    background: `${c}17`,
    borderColor: `${c}38`,
  }
}

/* ------------------------------ Component --------------------------- */

export default function Books() {
  const [books, setBooks] = useState(DEMO)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('title')
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

  const { visible, activeLabel } = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    const list = books.filter(b => {
      if (term) {
        const hay = `${b.title} ${b.author} ${b.description} ${b.category}`.toLowerCase()
        if (!hay.includes(term)) return false
      }
      if (activeFilter === 'favorites') return favorites.has(b.id)
      const cats = GROUP_CATEGORIES[activeFilter]
      if (cats) return cats.includes(b.category)
      return true
    })
    const key = activeFilter === 'recent' ? 'newest' : sortBy
    const sorted = [...list]
    switch (key) {
      case 'author':
        sorted.sort((a, b) => a.author.localeCompare(b.author))
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
        break
      case 'pages':
        sorted.sort((a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0))
        break
      case 'newest':
        sorted.sort((a, b) => b.addedAt - a.addedAt)
        break
      default:
        sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
    const label = FILTERS.find(f => f.id === activeFilter)?.label || 'All Books'
    return { visible: sorted, activeLabel: label }
  }, [books, searchQuery, activeFilter, sortBy, favorites])

  const hasActiveFilters = searchQuery.trim() !== '' || activeFilter !== 'all'

  function selectFilter(id) {
    setActiveFilter(id)
    if (id === 'recent') setSortBy('newest')
  }

  function handleSortChange(value) {
    setSortBy(value)
    if (activeFilter === 'recent') setActiveFilter('all')
  }

  function clearFilters() {
    setSearchQuery('')
    setActiveFilter('all')
    setSortBy('title')
  }

  /* ---------- reading state for modal ---------- */

  function readingStatus() {
    if (detailLoading) return { tone: 'neutral', label: 'Checking…' }
    const p = detailProgress
    if (!p || !p.status) return { tone: 'ok', label: 'Available' }
    if (p.status === 'reading') {
      const percent = p.pageCount ? Math.min(100, Math.round((p.currentPage / p.pageCount) * 100)) : 0
      return { tone: 'info', label: `Reading · ${percent}%` }
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
            <LibraryIcon size={26} />
          </div>
          <div className="books-hero-copy">
            <h1 className="books-title">{COPY.title}</h1>
            <p className="books-subtitle">{COPY.subtitle}</p>
          </div>
        </div>

        <div className="books-toolbar">
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

          <div className="books-sort">
            <span className="books-sort-label">Sort</span>
            <select value={sortBy} onChange={e => handleSortChange(e.target.value)} aria-label="Sort books">
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronIcon className="books-sort-chevron" />
          </div>

          {hasActiveFilters && (
            <button className="books-btn books-btn--ghost books-clear" onClick={clearFilters}>
              <XIcon size={13} />
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ---------- Category chips ---------- */}
      <div className="books-chips" role="group" aria-label="Browse library">
        {FILTERS.map(f => {
          const isActive = activeFilter === f.id
          return (
            <button
              key={f.id}
              className={`books-chip ${isActive ? 'books-chip--active' : ''}`}
              onClick={() => selectFilter(f.id)}
              aria-pressed={isActive}
            >
              {f.label}
              {f.id === 'favorites' && favorites.size > 0 && (
                <span className="books-chip-count">{favorites.size}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ---------- Results header ---------- */}
      <div className="books-results">
        <div>
          <h2 className="books-section-title">
            {searchQuery.trim() ? `Results for “${searchQuery.trim()}”` : activeLabel}
          </h2>
          <p className="books-section-sub">
            Showing {visible.length} of {books.length} books
          </p>
        </div>
        {hasActiveFilters && (
          <button className="books-clear-text" onClick={clearFilters}>
            Reset
          </button>
        )}
      </div>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <div className="books-grid" aria-label="Loading library">
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
        <div className="books-grid">
          {visible.map((book, i) => {
            const isFav = favorites.has(book.id)
            return (
              <article
                key={book.id}
                className="book-card"
                onClick={() => openBook(book)}
                style={{ animationDelay: `${Math.min(i, 9) * 35}ms` }}
              >
                <div className="book-card-cover" style={{ ...coverGradient(book.category), borderColor: `${categoryColor(book.category)}45` }}>
                  <button
                    className="book-card-cover-btn"
                    onClick={e => { e.stopPropagation(); openBook(book) }}
                    aria-label={`View details for ${book.title}`}
                  >
                    <span className="book-cover-spine" />
                    <span className="book-cover-cat" style={chipStyle(book.category)}>{book.category}</span>
                    <span className="book-cover-initial" style={{ color: categoryColor(book.category) }}>
                      {bookInitials(book.title)}
                    </span>
                    <span className="book-cover-glyph" style={{ color: `${categoryColor(book.category)}99` }}>
                      <LibraryIcon size={20} />
                    </span>
                  </button>
                  <button
                    className={`book-card-fav ${isFav ? 'book-card-fav--on' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleFavorite(book.id) }}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFav}
                  >
                    <HeartIcon size={15} filled={isFav} />
                  </button>
                </div>

                <div className="book-card-body">
                  <h3 className="book-card-title" title={book.title}>{book.title}</h3>
                  <p className="book-card-author">by {book.author}</p>
                  <div className="book-card-meta">
                    {book.rating != null && (
                      <span className="book-card-meta-item book-card-meta-item--rating">
                        <StarIcon size={12} filled />
                        {Number(book.rating).toFixed(1)}
                      </span>
                    )}
                    {book.pageCount > 0 && (
                      <span className="book-card-meta-item">{book.pageCount} pages</span>
                    )}
                    {book.level && <span className="book-card-meta-item">{book.level}</span>}
                  </div>
                  <button
                    className="books-btn books-btn--primary book-card-btn"
                    onClick={e => { e.stopPropagation(); openBook(book) }}
                  >
                    View details
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="books-empty">
          <div className="books-empty-icon">
            <LibraryIcon size={32} />
          </div>
          <h3>
            {books.length === 0
              ? 'The library is empty'
              : searchQuery.trim()
                ? `No results for “${searchQuery.trim()}”`
                : activeFilter === 'favorites'
                  ? 'No favorites yet'
                  : 'No books in this section'}
          </h3>
          <p>
            {books.length === 0
              ? 'New titles will appear here as they are added to the collection.'
              : searchQuery.trim()
                ? 'Try a different keyword, or clear your filters to browse everything.'
                : activeFilter === 'favorites'
                  ? 'Tap the heart on any book to save it here for quick access.'
                  : 'Try a different section, or clear your filters to browse everything.'}
          </p>
          {hasActiveFilters && (
            <button className="books-btn books-btn--soft" onClick={clearFilters}>
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

            <div className="book-modal-cover-wrap" style={coverGradient(selectedBook.category)}>
              <span className="book-cover-spine" />
              <span className="book-cover-cat" style={chipStyle(selectedBook.category)}>{selectedBook.category}</span>
              <span className="book-modal-cover-initial" style={{ color: categoryColor(selectedBook.category) }}>
                {bookInitials(selectedBook.title)}
              </span>
              <span className="book-modal-cover-glyph" style={{ color: `${categoryColor(selectedBook.category)}99` }}>
                <LibraryIcon size={30} />
              </span>
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
                  <dd>{selectedBook.level || '—'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Pages</dt>
                  <dd>{selectedBook.pageCount || '—'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Language</dt>
                  <dd>{selectedBook.language || '—'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>ISBN</dt>
                  <dd>{selectedBook.isbn || '—'}</dd>
                </div>
                <div className="book-modal-meta-row">
                  <dt>Added</dt>
                  <dd>{formatDate(selectedBook.addedAt)}</dd>
                </div>
              </dl>

              <div className="book-modal-actions">
                <button
                  className="books-btn books-btn--primary book-modal-start"
                  onClick={() => handleStartReading(selectedBook)}
                  disabled={detailLoading || readingAction.state === 'busy' || readingAction.state === 'ok' || detailProgress?.status === 'completed'}
                >
                  {readingAction.state === 'busy' && <span className="spinner" />}
                  {(readingAction.state === 'ok' || detailProgress?.status === 'completed') && <CheckIcon size={15} />}
                  {readingBtnLabel()}
                </button>

                <button
                  className={`books-btn ${favorites.has(selectedBook.id) ? 'books-btn--soft-active books-btn--fav' : 'books-btn--outline'}`}
                  onClick={() => toggleFavorite(selectedBook.id)}
                  aria-pressed={favorites.has(selectedBook.id)}
                >
                  <HeartIcon size={15} filled={favorites.has(selectedBook.id)} />
                  {favorites.has(selectedBook.id) ? 'Saved' : 'Save'}
                </button>

                <button
                  className="books-btn books-btn--icon"
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