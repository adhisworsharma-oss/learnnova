import { useState, useEffect } from 'react'
import { api } from '../api.js'

const CATEGORIES = [
  'All', 'Computer Science', 'Data Science', 'Design', 'Business & Economics',
  'Literature', 'History', 'Science', 'Self-Development'
]

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', rating: 4.5, page_count: 464, level: 'Intermediate', description: 'A handbook of agile software craftsmanship' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', rating: 4.8, page_count: 320, level: 'Beginner', description: 'An easy and proven way to build good habits' },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 4.6, page_count: 443, level: 'Beginner', description: 'A brief history of humankind' },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Science', rating: 4.3, page_count: 499, level: 'Intermediate', description: 'A journey into the mind' },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', rating: 4.4, page_count: 368, level: 'Beginner', description: 'The ultimate guide to human-centered design' },
  { id: 6, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Data Science', rating: 4.2, page_count: 800, level: 'Advanced', description: 'An introduction to a broad range of topics in deep learning' },
  { id: 7, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', rating: 4.6, page_count: 1312, level: 'Advanced', description: 'The most comprehensive textbook on algorithms' },
  { id: 8, title: 'Thinking in Systems', author: 'Donella H. Meadows', category: 'Science', rating: 4.5, page_count: 218, level: 'Beginner', description: 'A primer on systems thinking' },
  { id: 9, title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', rating: 4.2, page_count: 336, level: 'Beginner', description: 'How constant innovation creates radically successful businesses' },
  { id: 10, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', rating: 4.7, page_count: 336, level: 'Beginner', description: 'A classic of modern American literature' },
  { id: 11, title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', rating: 4.4, page_count: 480, level: 'Intermediate', description: 'The fates of human societies' },
  { id: 12, title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Computer Science', rating: 4.7, page_count: 352, level: 'Intermediate', description: 'Your journey to mastery' },
]

export default function Books() {
  const [books, setBooks] = useState(DEMO_BOOKS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await api('/books?limit=20')
        if (res.data && res.data.length > 0) {
          setBooks(res.data)
        }
      } catch {
        // use demo data
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  function getLevelColor(level) {
    switch (level) {
      case 'Beginner': return 'level-beginner'
      case 'Intermediate': return 'level-intermediate'
      case 'Advanced': return 'level-advanced'
      default: return ''
    }
  }

  function getCategoryColor(category) {
    const colors = {
      'Computer Science': '#6c42b9',
      'Data Science': '#3b82f6',
      'Design': '#e84b7a',
      'Business & Economics': '#f59e0b',
      'Literature': '#10b981',
      'History': '#8b5cf6',
      'Science': '#06b6d4',
      'Self-Development': '#f97316',
    }
    return colors[category] || '#6c42b9'
  }

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>Book Library</h1>
        <p>Discover and track your reading journey</p>
      </div>

      <div className="books-controls">
        <div className="books-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="books-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'filter-btn--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="books-count">
        Showing {filteredBooks.length} of {books.length} books
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-card-cover">
              <div className="book-card-cover-inner" style={{ background: `linear-gradient(135deg, ${getCategoryColor(book.category)}22, ${getCategoryColor(book.category)}44)` }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={getCategoryColor(book.category)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <span className="book-card-category" style={{ background: getCategoryColor(book.category) }}>
                {book.category}
              </span>
            </div>
            <div className="book-card-body">
              <h3 className="book-card-title">{book.title}</h3>
              <p className="book-card-author">by {book.author}</p>
              <p className="book-card-desc">{book.description}</p>
              <div className="book-card-meta">
                <span className={`book-card-level ${getLevelColor(book.level)}`}>{book.level}</span>
                <span className="book-card-pages">{book.page_count} pages</span>
                <span className="book-card-rating">★ {book.rating}</span>
              </div>
              <button className="book-card-btn">Start Reading</button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && !loading && (
        <div className="books-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>No books found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}
