import { useState } from 'react'

const DEMO_EVENTS = [
  {
    id: 1,
    title: 'CS Study Group — Algorithms',
    date: 'Sep 5, 2026 · 4:00 PM',
    location: 'Library Room 204',
    description: 'Weekly algorithms study session. Bringing practice problems on graph theory and dynamic programming.',
    attendees: 14,
    category: 'Study',
    color: '#5b4a8a',
    isJoined: true,
  },
  {
    id: 2,
    title: 'Book Discussion: Atomic Habits',
    date: 'Sep 8, 2026 · 6:30 PM',
    location: 'Online — Zoom',
    description: 'Wrapping up our read of Atomic Habits. Come share your takeaways and how you\'ve applied the ideas.',
    attendees: 28,
    category: 'Discussion',
    color: '#2d8a56',
    isJoined: true,
  },
  {
    id: 3,
    title: 'Data Science Workshop',
    date: 'Sep 12, 2026 · 2:00 PM',
    location: 'CS Building Lab 3',
    description: 'Hands-on workshop covering data preprocessing with Python. Bring your laptop.',
    attendees: 22,
    category: 'Workshop',
    color: '#2874a6',
    isJoined: false,
  },
  {
    id: 4,
    title: 'Design Thinking Sprint',
    date: 'Sep 15, 2026 · 10:00 AM',
    location: 'Innovation Center',
    description: 'Half-day design thinking workshop. Learn rapid prototyping and user research techniques.',
    attendees: 18,
    category: 'Workshop',
    color: '#c0392b',
    isJoined: false,
  },
  {
    id: 5,
    title: 'End-of-Semester Reading Challenge',
    date: 'Sep 20, 2026 · All Day',
    location: 'Online',
    description: 'Read 5 books in 30 days. Share progress and recommendations with the community.',
    attendees: 45,
    category: 'Challenge',
    color: '#b8860b',
    isJoined: false,
  },
  {
    id: 6,
    title: 'Guest Lecture: AI in Education',
    date: 'Sep 22, 2026 · 3:00 PM',
    location: 'Auditorium A',
    description: 'Prof. Sarah Mitchell on how AI is reshaping learning platforms and personalized education.',
    attendees: 62,
    category: 'Lecture',
    color: '#7d3c98',
    isJoined: false,
  },
]

const CATEGORIES = ['All', 'Study', 'Discussion', 'Workshop', 'Challenge', 'Lecture']

export default function Events() {
  const [events, setEvents] = useState(DEMO_EVENTS)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  function toggleJoin(id) {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, isJoined: !e.isJoined, attendees: e.isJoined ? e.attendees - 1 : e.attendees + 1 } : e
    ))
  }

  const filtered = events.filter(e => {
    const matchCat = filter === 'All' || e.category === filter
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h1>Events</h1>
          <p>Study sessions, workshops, and meetups</p>
        </div>
        <button className="create-event-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Event
        </button>
      </div>

      <div className="events-controls">
        <div className="events-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="events-filters">
          {CATEGORIES.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? 'filter-btn--active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="events-grid">
        {filtered.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-card-top" style={{ borderLeftColor: event.color }}>
              <span className="event-category" style={{ background: event.color + '18', color: event.color }}>{event.category}</span>
              <span className="event-date">{event.date}</span>
            </div>
            <h3 className="event-title">{event.title}</h3>
            <p className="event-desc">{event.description}</p>
            <div className="event-meta">
              <span className="event-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {event.location}
              </span>
              <span className="event-attendees">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {event.attendees} going
              </span>
            </div>
            <button className={`event-join-btn ${event.isJoined ? 'event-join-btn--joined' : ''}`} onClick={() => toggleJoin(event.id)}>
              {event.isJoined ? '✓ Going' : 'Join Event'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="events-empty">
          <h3>No events found</h3>
          <p>Try a different search or category.</p>
        </div>
      )}
    </div>
  )
}
