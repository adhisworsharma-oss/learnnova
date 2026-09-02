import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', rating: 4.5, cover: null },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', rating: 4.8, cover: null },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 4.6, cover: null },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Science', rating: 4.3, cover: null },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', rating: 4.4, cover: null },
  { id: 6, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Data Science', rating: 4.2, cover: null },
]

const DEMO_ACTIVITY = [
  { id: 1, type: 'completed', book: 'Atomic Habits', time: '2 hours ago' },
  { id: 2, type: 'started', book: 'Clean Code', time: '5 hours ago' },
  { id: 3, type: 'bookmarked', book: 'Sapiens', time: '1 day ago' },
  { id: 4, type: 'favorited', book: 'Thinking, Fast and Slow', time: '2 days ago' },
  { id: 5, type: 'completed', book: 'The Pragmatic Programmer', time: '3 days ago' },
]

const DEMO_STATS = {
  totalBooks: 30,
  booksRead: 12,
  readingStreak: 7,
  totalMinutes: 2340,
  bookmarks: 18,
  favorites: 9,
}

export default function Dashboard() {
  const [stats, setStats] = useState(DEMO_STATS)
  const [currentBooks, setCurrentBooks] = useState([])
  const [activity, setActivity] = useState(DEMO_ACTIVITY)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('learnova_user') || '{}')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, booksRes] = await Promise.all([
          api('/dashboard/stats'),
          api('/reading/current'),
        ])
        if (statsRes.data) setStats(statsRes.data)
        if (booksRes.data) setCurrentBooks(booksRes.data.slice(0, 4))
      } catch {
        setCurrentBooks(DEMO_BOOKS.slice(0, 4))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function getActivityIcon(type) {
    switch (type) {
      case 'completed': return '📖'
      case 'started': return '📗'
      case 'bookmarked': return '🔖'
      case 'favorited': return '❤️'
      default: return '📚'
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h1>Welcome back, {user.name || 'Student'}!</h1>
        <p>Here's your reading overview for today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.totalBooks}</span>
            <span className="stat-card-label">Total Books</span>
          </div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.booksRead}</span>
            <span className="stat-card-label">Books Read</span>
          </div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.readingStreak}</span>
            <span className="stat-card-label">Day Streak</span>
          </div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{Math.floor(stats.totalMinutes / 60)}h</span>
            <span className="stat-card-label">Reading Time</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-card">
            <div className="section-header">
              <h2>Currently Reading</h2>
              <Link to="/books" className="section-link">View All</Link>
            </div>
            <div className="current-books">
              {currentBooks.map(book => (
                <div key={book.id} className="current-book-card">
                  <div className="current-book-cover">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} />
                    ) : (
                      <div className="current-book-cover-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="current-book-info">
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <div className="book-progress-bar">
                      <div className="book-progress-fill" style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {currentBooks.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No books in progress. <Link to="/books">Browse books</Link> to get started!</p>
                </div>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Recommended For You</h2>
              <Link to="/books" className="section-link">See More</Link>
            </div>
            <div className="recommended-grid">
              {DEMO_BOOKS.slice(0, 3).map(book => (
                <div key={book.id} className="recommended-card">
                  <div className="recommended-cover">
                    <div className="recommended-cover-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                  </div>
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <div className="recommended-rating">
                    {'★'.repeat(Math.floor(book.rating))}{'☆'.repeat(5 - Math.floor(book.rating))}
                    <span>{book.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-aside">
          <div className="section-card">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-feed">
              {activity.map(item => (
                <div key={item.id} className="activity-item">
                  <span className="activity-icon">{getActivityIcon(item.type)}</span>
                  <div className="activity-info">
                    <span>
                      <strong>{item.type === 'completed' ? 'Finished' : item.type === 'started' ? 'Started reading' : item.type === 'bookmarked' ? 'Bookmarked' : 'Favorited'}</strong>{' '}
                      {item.book}
                    </span>
                    <span className="activity-time">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Quick Stats</h2>
            </div>
            <div className="quick-stats">
              <div className="quick-stat-row">
                <span>Bookmarks</span>
                <strong>{stats.bookmarks}</strong>
              </div>
              <div className="quick-stat-row">
                <span>Favorites</span>
                <strong>{stats.favorites}</strong>
              </div>
              <div className="quick-stat-row">
                <span>Reading Streak</span>
                <strong>{stats.readingStreak} days</strong>
              </div>
              <div className="quick-stat-row">
                <span>Total Minutes</span>
                <strong>{stats.totalMinutes.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
