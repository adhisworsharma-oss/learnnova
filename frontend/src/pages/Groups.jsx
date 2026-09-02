import { useState } from 'react'

const DEMO_GROUPS = [
  {
    id: 1, name: 'Computer Science Hub', description: 'Discuss algorithms, data structures, and system design. Weekly code reviews and study sessions.',
    members: 128, category: 'Computer Science', color: '#6c42b9', isJoined: true, recentActivity: '3 new posts today',
    admin: 'Alex Chen', tags: ['Algorithms', 'System Design', 'Interviews'],
  },
  {
    id: 2, name: 'Book Club Elite', description: 'Read and discuss a new book every month. Current read: "Atomic Habits" by James Clear.',
    members: 85, category: 'Literature', color: '#10b981', isJoined: true, recentActivity: '5 new posts today',
    admin: 'Sarah Kim', tags: ['Reading', 'Discussion', 'Monthly Challenge'],
  },
  {
    id: 3, name: 'Data Science Study Group', description: 'Machine learning, statistics, and data analysis. Share projects and learn together.',
    members: 96, category: 'Data Science', color: '#3b82f6', isJoined: false, recentActivity: '2 new posts today',
    admin: 'Raj Patel', tags: ['ML', 'Python', 'Statistics'],
  },
  {
    id: 4, name: 'Design Thinking Workshop', description: 'UI/UX design principles, prototyping sessions, and portfolio reviews.',
    members: 64, category: 'Design', color: '#e84b7a', isJoined: false, recentActivity: '1 new post today',
    admin: 'Maya Torres', tags: ['UI/UX', 'Figma', 'Prototyping'],
  },
  {
    id: 5, name: 'Startup & Entrepreneurship', description: 'From idea to MVP. Discuss business models, funding, and growth strategies.',
    members: 73, category: 'Business & Economics', color: '#f59e0b', isJoined: false, recentActivity: '4 new posts today',
    admin: 'Jordan Lee', tags: ['Startup', 'MVP', 'Growth'],
  },
  {
    id: 6, name: 'Science Enthusiasts', description: 'Explore physics, chemistry, biology and the wonders of the natural world.',
    members: 52, category: 'Science', color: '#06b6d4', isJoined: false, recentActivity: 'Today',
    admin: 'Dr. Wei Zhang', tags: ['Physics', 'Chemistry', 'Research'],
  },
  {
    id: 7, name: 'Self-Improvement Circle', description: 'Build better habits, improve productivity, and grow personally and professionally.',
    members: 110, category: 'Self-Development', color: '#f97316', isJoined: true, recentActivity: '6 new posts today',
    admin: 'Emma Davis', tags: ['Habits', 'Productivity', 'Mindset'],
  },
  {
    id: 8, name: 'History Buffs', description: 'Dive deep into historical events, eras, and their impact on the modern world.',
    members: 41, category: 'History', color: '#8b5cf6', isJoined: false, recentActivity: 'Yesterday',
    admin: 'Prof. James Wright', tags: ['Ancient History', 'Modern Era', 'Debates'],
  },
]

export default function Groups() {
  const [groups, setGroups] = useState(DEMO_GROUPS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  function toggleJoin(groupId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 }
        : g
    ))
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'joined' && group.isJoined) ||
      (filter === 'discover' && !group.isJoined)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="groups-page">
      <div className="groups-header">
        <div>
          <h1>Study Groups</h1>
          <p>Join groups, collaborate, and learn together</p>
        </div>
        <button className="create-group-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Group
        </button>
      </div>

      <div className="groups-controls">
        <div className="groups-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="groups-filters">
          <button className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`} onClick={() => setFilter('all')}>All Groups</button>
          <button className={`filter-btn ${filter === 'joined' ? 'filter-btn--active' : ''}`} onClick={() => setFilter('joined')}>My Groups</button>
          <button className={`filter-btn ${filter === 'discover' ? 'filter-btn--active' : ''}`} onClick={() => setFilter('discover')}>Discover</button>
        </div>
      </div>

      <div className="groups-grid">
        {filteredGroups.map(group => (
          <div key={group.id} className={`group-card ${group.isJoined ? 'group-card--joined' : ''}`}>
            <div className="group-card-header" style={{ background: `linear-gradient(135deg, ${group.color}15, ${group.color}30)` }}>
              <div className="group-card-avatar" style={{ background: group.color }}>
                {group.name.charAt(0)}
              </div>
              <div className="group-card-header-info">
                <h3>{group.name}</h3>
                <span className="group-card-category" style={{ color: group.color }}>{group.category}</span>
              </div>
            </div>
            <div className="group-card-body">
              <p className="group-card-desc">{group.description}</p>
              <div className="group-card-tags">
                {group.tags.map(tag => (
                  <span key={tag} className="group-tag">{tag}</span>
                ))}
              </div>
              <div className="group-card-meta">
                <span className="group-members">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {group.members} members
                </span>
                <span className="group-activity">{group.recentActivity}</span>
              </div>
            </div>
            <div className="group-card-footer">
              <span className="group-admin">Admin: {group.admin}</span>
              <button
                className={`group-join-btn ${group.isJoined ? 'group-join-btn--joined' : ''}`}
                onClick={() => toggleJoin(group.id)}
              >
                {group.isJoined ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Joined
                  </>
                ) : 'Join Group'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="groups-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h3>No groups found</h3>
          <p>Try adjusting your search or check out discover for new groups.</p>
        </div>
      )}
    </div>
  )
}
