import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', rating: 4.5 },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Development', rating: 4.8 },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', rating: 4.6 },
  { id: 4, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Science', rating: 4.3 },
  { id: 5, title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', rating: 4.4 },
  { id: 6, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Data Science', rating: 4.2 },
]

const DEMO_FEED = [
  { id: 1, user: 'Sarah K.', action: 'finished reading', book: 'Atomic Habits', time: '2 hours ago', avatar: 'S', reactions: 12, comments: 4 },
  { id: 2, user: 'Alex M.', action: 'started reading', book: 'Clean Code', time: '4 hours ago', avatar: 'A', reactions: 8, comments: 2 },
  { id: 3, user: 'Priya R.', action: 'recommended', book: 'Sapiens', time: '6 hours ago', avatar: 'P', reactions: 24, comments: 9 },
  { id: 4, user: 'Jordan L.', action: 'bookmarked', book: 'Thinking, Fast and Slow', time: '1 day ago', avatar: 'J', reactions: 5, comments: 1 },
  { id: 5, user: 'Maya T.', action: 'shared notes on', book: 'Deep Learning', time: '1 day ago', avatar: 'M', reactions: 18, comments: 7 },
  { id: 6, user: 'Chris W.', action: 'joined the group', book: 'CS Study Circle', time: '2 days ago', avatar: 'C', reactions: 3, comments: 0 },
]

const DEMO_GROUPS = [
  { id: 1, name: 'CS Study Circle', members: 34, color: '#5b4a8a' },
  { id: 2, name: 'Bookworms United', members: 89, color: '#2d8a56' },
  { id: 3, name: 'Data Science Hub', members: 56, color: '#2874a6' },
]

const DEMO_UPCOMING = [
  { id: 1, title: 'CS Study Group — Algorithms', date: 'Sep 5', color: '#5b4a8a' },
  { id: 2, title: 'Book Discussion: Atomic Habits', date: 'Sep 8', color: '#2d8a56' },
  { id: 3, title: 'Data Science Workshop', date: 'Sep 12', color: '#2874a6' },
]

export default function Dashboard() {
  const [books, setBooks] = useState(DEMO_BOOKS)
  const [feed, setFeed] = useState(DEMO_FEED)
  const [loading, setLoading] = useState(true)
  const [postText, setPostText] = useState('')
  const user = JSON.parse(localStorage.getItem('learnova_user') || '{}')
  const userName = user.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  useEffect(() => {
    async function fetchFeed() {
      try {
        const [booksRes] = await Promise.all([
          api('/dashboard/stats'),
        ])
      } catch {
        // keep demo data
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  function handlePost() {
    if (!postText.trim()) return
    const newPost = {
      id: Date.now(),
      user: userName,
      action: 'posted',
      book: postText.trim(),
      time: 'Just now',
      avatar: userInitial,
      reactions: 0,
      comments: 0,
    }
    setFeed(prev => [newPost, ...prev])
    setPostText('')
  }

  return (
    <div className="feed-layout">
      <div className="feed-center">
        {/* Create Post */}
        <div className="feed-create">
          <div className="feed-create-avatar">{userInitial}</div>
          <div className="feed-create-input">
            <input
              type="text"
              placeholder={`What are you reading, ${userName}?`}
              value={postText}
              onChange={e => setPostText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePost()}
            />
            <button className="feed-create-btn" onClick={handlePost}>Post</button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="feed-filters">
          <button className="feed-filter-btn feed-filter-btn--active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Reading
          </button>
          <button className="feed-filter-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Groups
          </button>
          <button className="feed-filter-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Events
          </button>
        </div>

        {/* Feed Posts */}
        <div className="feed-posts">
          {feed.map(post => (
            <div key={post.id} className="feed-post">
              <div className="feed-post-header">
                <div className="feed-post-avatar" style={{ background: getAvatarColor(post.avatar) }}>
                  {post.avatar}
                </div>
                <div className="feed-post-meta">
                  <strong>{post.user}</strong>
                  <span>{post.action} <em>{post.book}</em></span>
                  <time>{post.time}</time>
                </div>
              </div>
              <div className="feed-post-actions">
                <button className="feed-post-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                  {post.reactions}
                </button>
                <button className="feed-post-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {post.comments}
                </button>
                <button className="feed-post-action">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="feed-right">
        <div className="feed-right-card">
          <h3>Your Groups</h3>
          <div className="feed-right-list">
            {DEMO_GROUPS.map(g => (
              <Link key={g.id} to="/groups" className="feed-right-item">
                <div className="feed-right-item-avatar" style={{ background: g.color }}>
                  {g.name.charAt(0)}
                </div>
                <div className="feed-right-item-info">
                  <strong>{g.name}</strong>
                  <span>{g.members} members</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/groups" className="feed-right-more">See all groups</Link>
        </div>

        <div className="feed-right-card">
          <h3>Upcoming Events</h3>
          <div className="feed-right-list">
            {DEMO_UPCOMING.map(ev => (
              <Link key={ev.id} to="/events" className="feed-right-item">
                <div className="feed-right-item-avatar" style={{ background: ev.color }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="feed-right-item-info">
                  <strong>{ev.title}</strong>
                  <span>{ev.date}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/events" className="feed-right-more">See all events</Link>
        </div>

        <div className="feed-right-card">
          <h3>Recommended</h3>
          <div className="feed-right-list">
            {DEMO_BOOKS.slice(0, 3).map(b => (
              <Link key={b.id} to="/books" className="feed-right-item">
                <div className="feed-right-item-avatar feed-right-item-avatar--book">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div className="feed-right-item-info">
                  <strong>{b.title}</strong>
                  <span>{b.author}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/books" className="feed-right-more">Browse library</Link>
        </div>
      </aside>
    </div>
  )
}

function getAvatarColor(initial) {
  const colors = ['#5b4a8a', '#2d8a56', '#c0392b', '#2874a6', '#b8860b', '#7d3c98']
  const index = (initial.charCodeAt(0) - 65) % colors.length
  return colors[index]
}
