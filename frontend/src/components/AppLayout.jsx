import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../api.js'

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('learnova_user') || '{}')

  function handleLogout() {
    clearToken()
    localStorage.removeItem('learnova_user')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-left">
          <NavLink to="/home" className="topbar-brand">
            <img src="/learnova-mark.svg" alt="Learnova" className="topbar-logo" />
            <span className="topbar-brand-text">Learnova</span>
          </NavLink>
          <div className="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search Learnova..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <nav className="topbar-nav">
          <NavLink to="/home" className={({ isActive }) => `topbar-nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </NavLink>
          <NavLink to="/books" className={({ isActive }) => `topbar-nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>Books</span>
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => `topbar-nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Groups</span>
          </NavLink>
        </nav>
        <div className="topbar-right">
          <div className="topbar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="topbar-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {showUserMenu && (
            <>
              <div className="topbar-menu-overlay" onClick={() => setShowUserMenu(false)} />
              <div className="topbar-dropdown">
                <NavLink to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <div>
                    <strong>{user.name || 'User'} {user.surname || ''}</strong>
                    <span>See your profile</span>
                  </div>
                </NavLink>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <div>
                    <strong>Log Out</strong>
                  </div>
                </button>
              </div>
            </>
          )}
          <button className="topbar-mobile-toggle" onClick={() => setShowMobileNav(!showMobileNav)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </header>

      <div className="app-layout-body">
        <aside className={`sidebar ${showMobileNav ? 'sidebar--open' : ''}`}>
          <nav className="sidebar-nav">
            <NavLink to="/home" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileNav(false)}>
              <div className="sidebar-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/books" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileNav(false)}>
              <div className="sidebar-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <span>Books</span>
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileNav(false)}>
              <div className="sidebar-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span>Groups</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setShowMobileNav(false)}>
              <div className="sidebar-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span>Profile</span>
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <span>Learnova v1.0</span>
          </div>
        </aside>

        <main className="app-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
