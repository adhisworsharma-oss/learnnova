import { useState, useEffect } from 'react'
import { api } from '../api.js'

const DEMO_USER = {
  name: 'Student',
  surname: 'User',
  email: 'student@university.edu',
  membership_id: 'LRN-2026-000001',
  interests: ['Computer Science', 'Self-Development', 'Science'],
  created_at: '2026-01-15',
}

const DEMO_READING = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', status: 'reading', progress: 65, category: 'Computer Science' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', status: 'completed', progress: 100, category: 'Self-Development' },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', status: 'completed', progress: 100, category: 'History' },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', status: 'paused', progress: 42, category: 'Science' },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', status: 'reading', progress: 28, category: 'Design' },
  { id: 6, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', status: 'completed', progress: 100, category: 'Computer Science' },
]

const DEMO_BOOKMARKS = [
  { id: 1, title: 'Deep Learning', author: 'Ian Goodfellow' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'David Thomas' },
  { id: 3, title: 'Thinking in Systems', author: 'Donella H. Meadows' },
]

export default function Profile() {
  const [user, setUser] = useState(DEMO_USER)
  const [reading, setReading] = useState(DEMO_READING)
  const [bookmarks, setBookmarks] = useState(DEMO_BOOKMARKS)
  const [activeTab, setActiveTab] = useState('reading')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [userRes, readingRes, bookmarksRes] = await Promise.all([
          api('/auth/me'),
          api('/reading/current'),
          api('/bookmarks'),
        ])
        if (userRes.data) setUser(userRes.data)
        if (readingRes.data && readingRes.data.length > 0) setReading(readingRes.data)
        if (bookmarksRes.data && bookmarksRes.data.length > 0) setBookmarks(bookmarksRes.data)
      } catch {
        // use demo data
      }
    }
    fetchProfile()
  }, [])

  function startEdit() {
    setEditing(true)
    setEditForm({ name: user.name || '', surname: user.surname || '' })
  }

  function cancelEdit() {
    setEditing(false)
  }

  function saveEdit() {
    setUser(prev => ({ ...prev, ...editForm }))
    setEditing(false)
  }

  const stats = {
    booksRead: reading.filter(b => b.status === 'completed').length,
    currentlyReading: reading.filter(b => b.status === 'reading').length,
    bookmarks: bookmarks.length,
    totalBooks: reading.length,
  }

  const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  function getStatusColor(status) {
    switch (status) {
      case 'reading': return '#3b82f6'
      case 'completed': return '#10b981'
      case 'paused': return '#f59e0b'
      default: return '#6c42b9'
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-cover">
        <div className="profile-cover-pattern" />
      </div>

      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-info">
          <h1>{user.name} {user.surname}</h1>
          <p className="profile-membership-id">ID: {user.membership_id}</p>
          <p className="profile-joined">Member since {joinDate}</p>
        </div>
        <button className="profile-edit-btn" onClick={editing ? cancelEdit : startEdit}>
          {editing ? 'Cancel' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      {editing && (
        <div className="profile-edit-card">
          <div className="profile-edit-form">
            <div className="field">
              <label>First Name</label>
              <div className="control">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Last Name</label>
              <div className="control">
                <input
                  type="text"
                  value={editForm.surname || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, surname: e.target.value }))}
                />
              </div>
            </div>
            <button className="submit-btn" style={{ marginTop: 0 }} onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
      )}

      <div className="profile-stats-grid">
        <div className="profile-stat">
          <span className="profile-stat-value">{stats.booksRead}</span>
          <span className="profile-stat-label">Books Read</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{stats.currentlyReading}</span>
          <span className="profile-stat-label">Reading</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{stats.bookmarks}</span>
          <span className="profile-stat-label">Bookmarks</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{stats.totalBooks}</span>
          <span className="profile-stat-label">Total Books</span>
        </div>
      </div>

      <div className="profile-interests">
        <h3>Interests</h3>
        <div className="profile-interest-tags">
          {(user.interests || []).map(interest => (
            <span key={interest} className="profile-interest-tag">{interest}</span>
          ))}
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'reading' ? 'profile-tab--active' : ''}`} onClick={() => setActiveTab('reading')}>Reading History</button>
        <button className={`profile-tab ${activeTab === 'bookmarks' ? 'profile-tab--active' : ''}`} onClick={() => setActiveTab('bookmarks')}>Bookmarks</button>
      </div>

      {activeTab === 'reading' && (
        <div className="profile-reading-list">
          {reading.map(book => (
            <div key={book.id} className="profile-reading-item">
              <div className="profile-reading-cover">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div className="profile-reading-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
                <div className="profile-reading-progress">
                  <div className="profile-reading-bar">
                    <div className="profile-reading-fill" style={{ width: `${book.progress}%`, background: getStatusColor(book.status) }} />
                  </div>
                  <span>{book.progress}%</span>
                </div>
              </div>
              <span className="profile-reading-status" style={{ color: getStatusColor(book.status), borderColor: getStatusColor(book.status) }}>
                {book.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="profile-bookmarks-list">
          {bookmarks.map(book => (
            <div key={book.id} className="profile-bookmark-item">
              <div className="profile-bookmark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="profile-bookmark-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
              <button className="profile-bookmark-remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
