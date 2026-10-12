import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import './Cover.css'

/* ==================================================================
   Learnova — University e-Library landing page
   A premium, responsive marketing homepage for the digital library.
   Content: feature-led hero, live catalogue highlights (latest +
   trending), subject categories, course tracks, research resources
   and calls to action. Catalogue data comes from the public
   GET /api/books endpoint with a graceful offline fallback.
   ================================================================== */

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Categories', href: '#categories' },
  { label: 'E-Books', href: '#ebooks' },
  { label: 'Courses', href: '#courses' },
  { label: 'Research Papers', href: '#research' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const SUBJECTS = [
  { id: 'C Programming', icon: 'code', accent: '#2563eb', blurb: 'Procedural programming foundations' },
  { id: 'Java', icon: 'coffee', accent: '#ea580c', blurb: 'Object-oriented application development' },
  { id: 'Python', icon: 'terminal', accent: '#0284c7', blurb: 'Scripting, automation & data work' },
  { id: 'DBMS', icon: 'database', accent: '#7c3aed', blurb: 'Database design, SQL & transactions' },
  { id: 'Data Structures', icon: 'nodes', accent: '#4f46e5', blurb: 'Algorithms & problem solving' },
  { id: 'Operating Systems', icon: 'cpu', accent: '#0d9488', blurb: 'Processes, memory & file systems' },
  { id: 'Computer Networks', icon: 'network', accent: '#0891b2', blurb: 'Protocols & internet architecture' },
  { id: 'Software Engineering', icon: 'layers', accent: '#db2777', blurb: 'Design, testing & delivery practice' },
  { id: 'Web Development', icon: 'globe', accent: '#ea580c', blurb: 'HTML, CSS, React & APIs' },
  { id: 'AI', icon: 'sparkles', accent: '#9333ea', blurb: 'Intelligent systems & agents' },
  { id: 'Machine Learning', icon: 'chart', accent: '#16a34a', blurb: 'Models, data & training pipelines' },
  { id: 'Cyber Security', icon: 'shield', accent: '#dc2626', blurb: 'Security, forensics & cyber law' },
  { id: 'Cloud Computing', icon: 'cloud', accent: '#2563eb', blurb: 'Cloud platforms & architecture' },
  { id: 'Data Science', icon: 'analytics', accent: '#0e7490', blurb: 'Analysis & visualisation' },
]

const COURSE_TRACKS = [
  { title: 'Programming Foundations', icon: 'code', accent: '#2563eb', blurb: 'Language fundamentals and clean, structured code.', subjects: ['C Programming', 'Java', 'Python'] },
  { title: 'Data & Databases', icon: 'database', accent: '#7c3aed', blurb: 'Store, model and query data with confidence.', subjects: ['DBMS', 'Data Structures'] },
  { title: 'Systems & Networks', icon: 'cpu', accent: '#0d9488', blurb: 'How operating systems and networks really work.', subjects: ['Operating Systems', 'Computer Networks'] },
  { title: 'AI & Data Science', icon: 'sparkles', accent: '#9333ea', blurb: 'From raw data to intelligent, learning systems.', subjects: ['AI', 'Machine Learning', 'Data Science'] },
  { title: 'Software Engineering', icon: 'layers', accent: '#db2777', blurb: 'Design, build, test and ship reliable software.', subjects: ['Software Engineering', 'Web Development'] },
  { title: 'Security & Cloud', icon: 'shield', accent: '#dc2626', blurb: 'Protect systems and run them at scale.', subjects: ['Cyber Security', 'Cloud Computing'] },
]

const FEATURES = [
  { icon: 'book', accent: '#2563eb', title: 'Course-aligned catalogue', desc: 'Every title is mapped to the BCA syllabus, so you always read the right book at the right time.' },
  { icon: 'search', accent: '#0e7490', title: 'Smart search & filters', desc: 'Find any book by subject, author, level or programming language in seconds.' },
  { icon: 'progress', accent: '#7c3aed', title: 'Reading progress', desc: 'Pick up exactly where you left off, with progress and completion tracked per book.' },
  { icon: 'bookmark', accent: '#db2777', title: 'Bookmarks & favorites', desc: 'Save the titles you love, build a wishlist and organise your personal reading list.' },
  { icon: 'layers', accent: '#16a34a', title: 'Curated collections', desc: 'Handpicked subject collections that guide you from fundamentals to advanced topics.' },
  { icon: 'download', accent: '#ea580c', title: 'Study anytime', desc: 'Read across devices with a calm, distraction-free reader built for long study sessions.' },
]

const RESOURCES = [
  { icon: 'sparkles', accent: '#9333ea', title: 'Research papers', desc: 'Reference material and survey papers that extend your coursework into current research.' },
  { icon: 'nodes', accent: '#2563eb', title: 'Reference handbooks', desc: 'Quick-reference guides for syntax, algorithms and standard software-engineering practices.' },
  { icon: 'notes', accent: '#16a34a', title: 'Revision & notes', desc: 'Concise summaries and revision notes to make exam preparation faster and calmer.' },
]

const TESTIMONIALS = [
  { quote: 'The subject collections mean I always know which book to open next. It honestly made my semester feel organised.', name: 'Aditi R.', meta: 'BCA · Semester 4' },
  { quote: 'Search finds the exact chapter I need, and I can keep reading on my phone during the commute. It just works.', name: 'Karan M.', meta: 'BCA · Semester 2' },
  { quote: 'Clean, fast and distraction-free. It feels like a real university library rather than a pile of PDFs.', name: 'Sneha P.', meta: 'BCA · Semester 6' },
]

/* ---------------------------- fallback ---------------------------- */

const days = (n) => Date.now() - n * 24 * 60 * 60 * 1000

const FALLBACK_BOOKS = [
  { title: 'Let Us C', author: 'Yashavant Kanetkar', subject: 'C Programming', isbn: '9788183331630', rating: 4.6, level: 'Beginner', pageCount: 656, addedAt: days(3) },
  { title: 'Java: The Complete Reference', author: 'Herbert Schildt', subject: 'Java', isbn: '9781260440232', rating: 4.8, level: 'Intermediate', pageCount: 1248, addedAt: days(8) },
  { title: 'Python Crash Course', author: 'Eric Matthes', subject: 'Python', isbn: '9781593279288', rating: 4.7, level: 'Beginner', pageCount: 544, addedAt: days(5) },
  { title: 'Database System Concepts', author: 'Silberschatz, Korth & Sudarshan', subject: 'DBMS', isbn: '9780078022159', rating: 4.7, level: 'Intermediate', pageCount: 1376, addedAt: days(14) },
  { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', subject: 'Data Structures', isbn: '9780262046305', rating: 4.8, level: 'Advanced', pageCount: 1312, addedAt: days(2) },
  { title: 'Operating System Concepts', author: 'Silberschatz, Galvin & Gagne', subject: 'Operating Systems', isbn: '9781118063330', rating: 4.7, level: 'Intermediate', pageCount: 944, addedAt: days(11) },
  { title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', subject: 'Computer Networks', isbn: '9780133594140', rating: 4.7, level: 'Intermediate', pageCount: 864, addedAt: days(6) },
  { title: 'Software Engineering', author: 'Ian Sommerville', subject: 'Software Engineering', isbn: '9780133943030', rating: 4.6, level: 'Intermediate', pageCount: 816, addedAt: days(9) },
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', subject: 'Web Development', isbn: '9781118008188', rating: 4.7, level: 'Beginner', pageCount: 512, addedAt: days(1) },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', subject: 'AI', isbn: '9780134610993', rating: 4.7, level: 'Advanced', pageCount: 1152, addedAt: days(7) },
  { title: 'Hands-On Machine Learning', author: 'Aurélien Géron', subject: 'Machine Learning', isbn: '9781098125974', rating: 4.8, level: 'Intermediate', pageCount: 856, addedAt: days(4) },
  { title: 'Computer Security: Principles and Practice', author: 'Stallings & Brown', subject: 'Cyber Security', isbn: '9780134794105', rating: 4.5, level: 'Advanced', pageCount: 800, addedAt: days(12) },
  { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Erl, Puttini & Mahmood', subject: 'Cloud Computing', isbn: '9780133387520', rating: 4.5, level: 'Intermediate', pageCount: 528, addedAt: days(10) },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', subject: 'Data Science', isbn: '9781098104030', rating: 4.6, level: 'Intermediate', pageCount: 579, addedAt: days(13) },
]

/* ------------------------------ helpers ------------------------------ */

function normalizeBook(b, index) {
  const subject = b.subject || b.category || 'General'
  return {
    id: b.id || `fb-${index}`,
    title: b.title || 'Untitled',
    author: b.author || 'Unknown author',
    subject,
    level: b.level || '',
    rating: typeof b.rating === 'number' ? b.rating : null,
    isbn: String(b.isbn || '').replace(/[-\s]/g, ''),
    cover: b.cover || '',
    addedAt: b.addedAt ? new Date(b.addedAt).getTime() : Date.now() - (index + 1) * 86400000,
  }
}

const DEMO = FALLBACK_BOOKS.map(normalizeBook)

function coverUrl(book) {
  if (book.cover) return book.cover
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
  return ''
}

function initials(title) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'B'
  return words.slice(0, 2).map((w) => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase()).filter(Boolean).join('') || 'B'
}

function accentFor(subject) {
  const found = SUBJECTS.find((s) => s.id === subject)
  return found ? found.accent : '#2563eb'
}

/* -------------------------------- icons ------------------------------- */

function Icon({ name, size = 20, className }) {
  const base = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  }
  switch (name) {
    case 'code':
      return <svg {...base}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    case 'coffee':
      return <svg {...base}><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" /><line x1="7" y1="2" x2="7" y2="5" /><line x1="11" y1="2" x2="11" y2="5" /></svg>
    case 'terminal':
      return <svg {...base}><rect x="3" y="4" width="18" height="16" rx="3" /><polyline points="8 10 11 13 8 16" /><line x1="14" y1="16" x2="17" y2="16" /></svg>
    case 'database':
      return <svg {...base}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>
    case 'nodes':
      return <svg {...base}><circle cx="12" cy="4" r="2.2" /><circle cx="5" cy="19" r="2.2" /><circle cx="19" cy="19" r="2.2" /><path d="M12 6.2V12m0 0-5.3 5.2M12 12l5.3 5.2" /></svg>
    case 'cpu':
      return <svg {...base}><rect x="7" y="7" width="10" height="10" rx="2" /><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><line x1="9" y1="1.5" x2="9" y2="3.5" /><line x1="15" y1="1.5" x2="15" y2="3.5" /><line x1="9" y1="20.5" x2="9" y2="22.5" /><line x1="15" y1="20.5" x2="15" y2="22.5" /><line x1="1.5" y1="9" x2="3.5" y2="9" /><line x1="1.5" y1="15" x2="3.5" y2="15" /><line x1="20.5" y1="9" x2="22.5" y2="9" /><line x1="20.5" y1="15" x2="22.5" y2="15" /></svg>
    case 'network':
      return <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M3.5 15h17" /><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z" /></svg>
    case 'layers':
      return <svg {...base}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></svg>
    case 'globe':
      return <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M3.5 15h17" /><path d="M12 3c2.3 2.5 3.5 5.5 3.5 9s-1.2 6.5-3.5 9c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" /></svg>
    case 'sparkles':
      return <svg {...base}><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></svg>
    case 'chart':
      return <svg {...base}><line x1="4" y1="20" x2="4" y2="10" /><line x1="10" y1="20" x2="10" y2="4" /><line x1="16" y1="20" x2="16" y2="12" /><line x1="21" y1="20" x2="21" y2="7" /></svg>
    case 'analytics':
      return <svg {...base}><path d="M4 4v16h16" /><path d="m7 15 3.5-4 3 2.5L20 7" /></svg>
    case 'shield':
      return <svg {...base}><path d="M12 3 5 6v6c0 4.2 2.9 7.3 7 9 4.1-1.7 7-4.8 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'cloud':
      return <svg {...base}><path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.4 1.5A3.75 3.75 0 0 1 17 18H7Z" /></svg>
    case 'book':
      return <svg {...base}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><line x1="9" y1="7" x2="15" y2="7" /></svg>
    case 'bookmark':
      return <svg {...base}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>
    case 'progress':
      return <svg {...base}><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 3v9h9" /></svg>
    case 'download':
      return <svg {...base}><path d="M12 3v12" /><polyline points="7 10 12 15 17 10" /><path d="M5 21h14" /></svg>
    case 'notes':
      return <svg {...base}><rect x="5" y="3" width="14" height="18" rx="2" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" /></svg>
    case 'cap':
      return <svg {...base}><path d="m12 4 10 5-10 5L2 9l10-5Z" /><path d="M6 11v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" /></svg>
    case 'star':
      return <svg {...base} fill="currentColor" stroke="none"><path d="m12 3 2.5 5.6L20 9.3l-4 3.9.9 5.8-4.9-2.7-4.9 2.7.9-5.8-4-3.9 5.5-.7L12 3Z" /></svg>
    case 'search':
      return <svg {...base}><circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
    case 'arrowRight':
      return <svg {...base}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
    case 'arrowUpRight':
      return <svg {...base}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" /></svg>
    case 'menu':
      return <svg {...base}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
    case 'close':
      return <svg {...base}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
    case 'check':
      return <svg {...base} strokeWidth="2.4"><polyline points="20 6 9 17 4 12" /></svg>
    case 'mail':
      return <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
    case 'phone':
      return <svg {...base}><path d="M6 3h3l1.5 5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" /></svg>
    case 'pin':
      return <svg {...base}><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
    case 'users':
      return <svg {...base}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M18 20a6 6 0 0 0-3-5.2" /></svg>
    case 'clock':
      return <svg {...base}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
    case 'play':
      return <svg {...base}><circle cx="12" cy="12" r="9" /><polygon points="10 8.5 16 12 10 15.5" fill="currentColor" stroke="none" /></svg>
    default:
      return <svg {...base}><circle cx="12" cy="12" r="9" /></svg>
  }
}

/* --------------------------- hero artwork --------------------------- */

function HeroArt() {
  return (
    <svg className="lp-art" viewBox="0 0 600 520" role="img" aria-label="Digital learning workspace with code, cloud, database and AI">
      <defs>
        <linearGradient id="lpBlob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#eef2ff" />
        </linearGradient>
        <linearGradient id="lpWindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef3fb" />
        </linearGradient>
        <linearGradient id="lpBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="lpBar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <filter id="lpShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0b1c3f" floodOpacity="0.16" />
        </filter>
      </defs>

      <ellipse cx="330" cy="248" rx="252" ry="214" fill="url(#lpBlob)" />

      <g fill="#1e3a8a" opacity="0.14">
        {[0, 1, 2, 3, 4, 5].map((r) =>
          [0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
            <circle key={`${r}-${c}`} cx={40 + c * 22} cy={40 + r * 22} r="2.2" />
          )),
        )}
      </g>

      {/* main window */}
      <g filter="url(#lpShadow)">
        <rect x="96" y="118" width="376" height="272" rx="22" fill="url(#lpWindow)" />
      </g>
      <rect x="96" y="118" width="376" height="46" rx="22" fill="#0b1c3f" />
      <rect x="96" y="140" width="376" height="24" fill="#0b1c3f" />
      <circle cx="122" cy="141" r="5.5" fill="#f87171" />
      <circle cx="142" cy="141" r="5.5" fill="#fbbf24" />
      <circle cx="162" cy="141" r="5.5" fill="#34d399" />
      <rect x="300" y="133" width="150" height="16" rx="8" fill="#ffffff" opacity="0.14" />

      {/* code lines */}
      <rect x="122" y="188" width="150" height="12" rx="6" fill="#bfdbfe" />
      <rect x="122" y="214" width="196" height="12" rx="6" fill="#e2e8f0" />
      <rect x="140" y="240" width="126" height="12" rx="6" fill="#c7d2fe" />
      <rect x="122" y="266" width="176" height="12" rx="6" fill="#e2e8f0" />
      <rect x="140" y="292" width="104" height="12" rx="6" fill="#bfdbfe" />
      <rect x="122" y="318" width="140" height="12" rx="6" fill="#e2e8f0" />

      {/* chart */}
      <line x1="352" y1="340" x2="450" y2="340" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="352" y="288" width="18" height="52" rx="6" fill="url(#lpBar)" />
      <rect x="380" y="256" width="18" height="84" rx="6" fill="url(#lpBar2)" />
      <rect x="408" y="300" width="18" height="40" rx="6" fill="url(#lpBar)" />
      <rect x="436" y="230" width="18" height="110" rx="6" fill="url(#lpBar2)" />

      {/* floating: AI */}
      <g filter="url(#lpShadow)">
        <rect x="34" y="74" width="88" height="76" rx="20" fill="#ffffff" />
      </g>
      <g transform="translate(58 96) scale(1.4)" style={{ color: '#9333ea' }}>
        <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </g>

      {/* floating: cloud */}
      <g filter="url(#lpShadow)">
        <rect x="472" y="88" width="94" height="80" rx="20" fill="#ffffff" />
      </g>
      <g transform="translate(497 111) scale(1.5)" style={{ color: '#2563eb' }}>
        <path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.4 1.5A3.75 3.75 0 0 1 17 18H7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </g>

      {/* floating: database */}
      <g filter="url(#lpShadow)">
        <rect x="52" y="372" width="94" height="82" rx="20" fill="#ffffff" />
      </g>
      <g transform="translate(78 396) scale(1.5)" style={{ color: '#7c3aed' }}>
        <ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </g>

      {/* floating: network */}
      <g filter="url(#lpShadow)">
        <rect x="466" y="372" width="96" height="82" rx="20" fill="#ffffff" />
      </g>
      <g transform="translate(492 396) scale(1.5)" style={{ color: '#0891b2' }}>
        <circle cx="12" cy="4" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="5" cy="19" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="19" cy="19" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 6.2V12m0 0-5.3 5.2M12 12l5.3 5.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </g>
    </svg>
  )
}

/* ---------------------------- book pieces ---------------------------- */

function BookCard({ book, index }) {
  const [broken, setBroken] = useState(false)
  const accent = accentFor(book.subject)
  const src = coverUrl(book)
  const showImg = Boolean(src) && !broken

  return (
    <article
      className="lp-book"
      data-reveal
      style={{ '--accent': accent, '--reveal-delay': `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="lp-book-cover">
        {showImg ? (
          <img src={src} alt={`Cover of ${book.title}`} loading="lazy" onError={() => setBroken(true)} />
        ) : (
          <div className="lp-book-fallback" aria-hidden="true">
            <span className="lp-book-initials">{initials(book.title)}</span>
            <span className="lp-book-subject">{book.subject}</span>
          </div>
        )}
        {book.rating ? (
          <span className="lp-book-rating">
            <Icon name="star" size={13} />
            {Number(book.rating).toFixed(1)}
          </span>
        ) : null}
      </div>
      <div className="lp-book-body">
        <h3 className="lp-book-title" title={book.title}>{book.title}</h3>
        <p className="lp-book-author">{book.author}</p>
        <div className="lp-book-meta">
          <span className="lp-tag">{book.subject}</span>
          {book.level ? <span className="lp-tag lp-tag-ghost">{book.level}</span> : null}
        </div>
      </div>
    </article>
  )
}

function BookSkeleton() {
  return (
    <div className="lp-book lp-book-skeleton" aria-hidden="true">
      <div className="lp-skel lp-skel-cover" />
      <div className="lp-skel lp-skel-line" style={{ width: '82%' }} />
      <div className="lp-skel lp-skel-line" style={{ width: '54%' }} />
    </div>
  )
}

function SectionHead({ kicker, title, sub, align }) {
  return (
    <div className={`lp-sec-head${align === 'center' ? ' is-center' : ''}`} data-reveal>
      <span className="lp-kicker">{kicker}</span>
      <h2 className="lp-sec-title">{title}</h2>
      {sub ? <p className="lp-sec-sub">{sub}</p> : null}
    </div>
  )
}

/* ------------------------------- reveal ------------------------------- */

function useReveal(deps) {
  useEffect(() => {
    const root = document.querySelector('.lp-root')
    if (!root) return undefined
    const els = Array.from(root.querySelectorAll('[data-reveal]:not(.is-visible)'))
    if (!els.length) return undefined
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

/* ================================ page ================================ */

export default function Cover() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [activeSubject, setActiveSubject] = useState('all')
  const [books, setBooks] = useState([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const ebooksRef = useRef(null)

  /* fetch the public catalogue */
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [list, cats] = await Promise.all([
          api('/books?limit=50&sort=rating&order=desc'),
          api('/books/categories'),
        ])
        if (!alive) return
        const rows = (list.books || []).map(normalizeBook)
        setBooks(rows)
        setTotalBooks(list.total || rows.length)
        setCategories(cats.categories || [])
      } catch {
        if (!alive) return
        setBooks(DEMO)
        setTotalBooks(DEMO.length)
        setCategories(
          SUBJECTS.map((s) => ({ category: s.id, bookCount: DEMO.filter((b) => b.subject === s.id).length })),
        )
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  /* nav shadow on scroll + smooth in-page anchors */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const html = document.documentElement
    const prevBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'smooth'
    return () => {
      window.removeEventListener('scroll', onScroll)
      html.style.scrollBehavior = prevBehavior
    }
  }, [])

  useReveal([loading, books.length, query, activeSubject])

  const counts = useMemo(() => {
    const map = {}
    categories.forEach((c) => { if (c && c.category) map[c.category] = c.bookCount })
    return map
  }, [categories])

  const trending = useMemo(
    () => [...books].filter((b) => b.rating).sort((a, b) => b.rating - a.rating).slice(0, 6),
    [books],
  )

  const latest = useMemo(
    () => [...books].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6),
    [books],
  )

  const stats = useMemo(() => {
    const ratings = books.map((b) => b.rating).filter((r) => typeof r === 'number' && r > 0)
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    return [
      { icon: 'book', value: totalBooks ? `${totalBooks}+` : '—', label: 'E-books', hint: 'Course-aligned titles' },
      { icon: 'cap', value: `${SUBJECTS.length}`, label: 'Course subjects', hint: 'Across the BCA syllabus' },
      { icon: 'layers', value: `${COURSE_TRACKS.length}`, label: 'Study tracks', hint: 'Guided learning paths' },
      { icon: 'star', value: avg ? avg.toFixed(1) : '—', label: 'Average rating', hint: 'Rated by readers' },
    ]
  }, [books, totalBooks])

  const subjectChips = SUBJECTS.slice(0, 8)

  function goToEbooks(subject) {
    if (subject) {
      setActiveSubject(subject)
      setQuery('')
    }
    if (ebooksRef.current) ebooksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onHeroSearch(e) {
    e.preventDefault()
    goToEbooks(null)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((b) => {
      if (activeSubject !== 'all' && b.subject !== activeSubject) return false
      if (!q) return true
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q)
      )
    })
  }, [books, query, activeSubject])

  const showTrending = !query.trim() && activeSubject === 'all'

  return (
    <div className="lp-root">
      <a className="lp-skip" href="#home">Skip to content</a>

      {/* ------------------------------ nav ------------------------------ */}
      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <a href="#home" className="lp-brand" aria-label="Learnova home">
            <img src="/Logo of Learnova with Book Icon.png" alt="" className="lp-brand-logo" />
            <span className="lp-brand-name">Learnova</span>
          </a>

          <nav className="lp-nav-links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="lp-nav-link">{l.label}</a>
            ))}
          </nav>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn lp-btn-ghost">Log in</Link>
            <Link to="/signup" className="lp-btn lp-btn-primary">
              Get started
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>

          <button
            type="button"
            className="lp-nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>

        <div className={`lp-mobile${menuOpen ? ' is-open' : ''}`}>
          <nav className="lp-container lp-mobile-links" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <div className="lp-mobile-actions">
              <Link to="/login" className="lp-btn lp-btn-ghost" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="lp-btn lp-btn-primary" onClick={() => setMenuOpen(false)}>Get started</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ----------------------------- hero ----------------------------- */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-bg" aria-hidden="true">
            <span className="lp-glow lp-glow-a" />
            <span className="lp-glow lp-glow-b" />
          </div>

          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy" data-reveal>
              <span className="lp-badge">
                <span className="lp-badge-dot" />
                University Digital Library
              </span>

              <h1 className="lp-hero-title">
                Your entire university library,{' '}
                <span className="lp-grad">beautifully digital.</span>
              </h1>

              <p className="lp-hero-sub">
                Learnova brings your BCA textbooks, references and study tracks together in one calm,
                course-aligned space — accessible anywhere, built for how students actually read.
              </p>

              <div className="lp-hero-cta">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => goToEbooks(null)}>
                  <Icon name="book" size={19} />
                  Browse books
                </button>
                <a href="#courses" className="lp-btn lp-btn-outline lp-btn-lg">
                  <Icon name="cap" size={19} />
                  Explore courses
                </a>
              </div>

              <form className="lp-search" onSubmit={onHeroSearch} role="search">
                <Icon name="search" size={18} className="lp-search-icon" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveSubject('all') }}
                  placeholder="Search by title, author or subject…"
                  aria-label="Search the library"
                />
                <button type="submit" className="lp-btn lp-btn-primary">Search</button>
              </form>

              <div className="lp-chips" aria-label="Popular subjects">
                {subjectChips.map((s) => (
                  <button key={s.id} type="button" className="lp-chip" onClick={() => goToEbooks(s.id)}>
                    {s.id}
                  </button>
                ))}
                <button type="button" className="lp-chip lp-chip-more" onClick={() => goToEbooks(null)}>
                  +{SUBJECTS.length - subjectChips.length} more
                </button>
              </div>
            </div>

            <div className="lp-hero-art" data-reveal style={{ '--reveal-delay': '120ms' }}>
              <HeroArt />
              <div className="lp-hero-card lp-hero-card-a">
                <span className="lp-hero-card-icon" style={{ '--accent': '#2563eb' }}><Icon name="progress" size={18} /></span>
                <div>
                  <strong>Reading progress</strong>
                  <span>Pick up where you left off</span>
                </div>
              </div>
              <div className="lp-hero-card lp-hero-card-b">
                <span className="lp-hero-card-icon" style={{ '--accent': '#16a34a' }}><Icon name="check" size={18} /></span>
                <div>
                  <strong>Course-aligned</strong>
                  <span>Mapped to your syllabus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- stats ---------------------------- */}
        <section className="lp-stats-wrap">
          <div className="lp-container">
            <div className="lp-stats">
              {stats.map((s, i) => (
                <div className="lp-stat" key={s.label} data-reveal style={{ '--reveal-delay': `${i * 70}ms` }}>
                  <span className="lp-stat-icon"><Icon name={s.icon} size={20} /></span>
                  <div className="lp-stat-body">
                    <span className="lp-stat-value">{s.value}</span>
                    <span className="lp-stat-label">{s.label}</span>
                    <span className="lp-stat-hint">{s.hint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------- categories -------------------------- */}
        <section className="lp-section" id="categories">
          <div className="lp-container">
            <SectionHead
              kicker="Categories"
              title="Browse the library by subject"
              sub="Everything on the BCA reading list, organised into the subjects you actually study."
              align="center"
            />
            <div className="lp-cat-grid">
              {SUBJECTS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="lp-cat"
                  onClick={() => goToEbooks(s.id)}
                  data-reveal
                  style={{ '--accent': s.accent, '--reveal-delay': `${Math.min(i, 8) * 45}ms` }}
                >
                  <span className="lp-cat-icon"><Icon name={s.icon} size={22} /></span>
                  <span className="lp-cat-name">{s.id}</span>
                  <span className="lp-cat-blurb">{s.blurb}</span>
                  <span className="lp-cat-foot">
                    {counts[s.id] ? `${counts[s.id]} ${counts[s.id] === 1 ? 'title' : 'titles'}` : 'Explore'}
                    <Icon name="arrowUpRight" size={15} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- e-books ---------------------------- */}
        <section className="lp-section lp-section-alt" id="ebooks" ref={ebooksRef}>
          <div className="lp-container">
            <SectionHead
              kicker="E-Books"
              title="Latest additions & trending reads"
              sub="Fresh titles added to the catalogue and the books your peers rate the highest."
            />

            <div className="lp-toolbar" data-reveal>
              <div className="lp-toolbar-search">
                <Icon name="search" size={17} className="lp-search-icon" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveSubject('all') }}
                  placeholder="Search titles, authors or subjects…"
                  aria-label="Filter books"
                />
              </div>
              <div className="lp-filters" role="group" aria-label="Filter by subject">
                <button
                  type="button"
                  className={`lp-filter${activeSubject === 'all' ? ' is-active' : ''}`}
                  onClick={() => setActiveSubject('all')}
                >
                  All
                </button>
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`lp-filter${activeSubject === s.id ? ' is-active' : ''}`}
                    onClick={() => setActiveSubject(s.id)}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            {showTrending ? (
              <div className="lp-showcase" data-reveal>
                <div className="lp-showcase-head">
                  <h3 className="lp-showcase-title"><Icon name="star" size={18} /> Trending now</h3>
                  <button type="button" className="lp-link-btn" onClick={() => goToEbooks(null)}>
                    View all
                  </button>
                </div>
                <div className="lp-rail">
                  {loading
                    ? [0, 1, 2, 3, 4, 5].map((k) => <BookSkeleton key={k} />)
                    : trending.map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
                </div>
              </div>
            ) : null}

            <div className="lp-showcase">
              <div className="lp-showcase-head">
                <h3 className="lp-showcase-title">
                  <Icon name="download" size={18} />
                  {showTrending ? 'Latest additions' : 'Results'}
                </h3>
                {loading ? null : <span className="lp-showcase-count">{filtered.length} books</span>}
              </div>

              {loading ? (
                <div className="lp-book-grid">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <BookSkeleton key={k} />)}
                </div>
              ) : (showTrending ? latest : filtered).length === 0 ? (
                <div className="lp-empty" data-reveal>
                  <span className="lp-empty-icon"><Icon name="search" size={26} /></span>
                  <h4>No books match your search</h4>
                  <p>Try a different subject, author or keyword.</p>
                  <button
                    type="button"
                    className="lp-btn lp-btn-outline"
                    onClick={() => { setQuery(''); setActiveSubject('all') }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="lp-book-grid">
                  {(showTrending ? latest : filtered).map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
                </div>
              )}
            </div>

            <div className="lp-section-cta" data-reveal>
              <Link to="/welcome" className="lp-btn lp-btn-primary lp-btn-lg">
                Open the full library
                <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------- courses ---------------------------- */}
        <section className="lp-section" id="courses">
          <div className="lp-container">
            <SectionHead
              kicker="Courses"
              title="Guided study tracks"
              sub="Follow a structured path through the BCA syllabus — from first programs to advanced systems."
              align="center"
            />
            <div className="lp-track-grid">
              {COURSE_TRACKS.map((t, i) => (
                <article
                  key={t.title}
                  className="lp-track"
                  data-reveal
                  style={{ '--accent': t.accent, '--reveal-delay': `${Math.min(i, 6) * 60}ms` }}
                >
                  <span className="lp-track-icon"><Icon name={t.icon} size={24} /></span>
                  <h3 className="lp-track-title">{t.title}</h3>
                  <p className="lp-track-desc">{t.blurb}</p>
                  <ul className="lp-track-subjects">
                    {t.subjects.map((s) => (
                      <li key={s}>
                        <Icon name="check" size={14} />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="lp-link-btn" onClick={() => goToEbooks(t.subjects[0])}>
                    Explore track
                    <Icon name="arrowRight" size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- features ---------------------------- */}
        <section className="lp-section lp-section-alt" id="features">
          <div className="lp-container">
            <SectionHead
              kicker="Why Learnova"
              title="A library designed for deep study"
              sub="Thoughtful tools that remove friction so you can focus on understanding, not searching."
              align="center"
            />
            <div className="lp-feature-grid">
              {FEATURES.map((f, i) => (
                <article
                  key={f.title}
                  className="lp-feature"
                  data-reveal
                  style={{ '--accent': f.accent, '--reveal-delay': `${Math.min(i, 6) * 60}ms` }}
                >
                  <span className="lp-feature-icon"><Icon name={f.icon} size={22} /></span>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------- research --------------------------- */}
        <section className="lp-section" id="research">
          <div className="lp-container lp-research">
            <div className="lp-research-copy" data-reveal>
              <span className="lp-kicker">Research Papers</span>
              <h2 className="lp-sec-title">Beyond the textbook</h2>
              <p className="lp-sec-sub">
                Extend your coursework with reference material, survey papers and concise revision
                notes — so assignments and exams feel less like guesswork.
              </p>
              <ul className="lp-research-list">
                {RESOURCES.map((r) => (
                  <li key={r.title} style={{ '--accent': r.accent }} data-reveal>
                    <span className="lp-research-icon"><Icon name={r.icon} size={20} /></span>
                    <div>
                      <strong>{r.title}</strong>
                      <span>{r.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-research-card" data-reveal style={{ '--reveal-delay': '120ms' }}>
              <span className="lp-research-badge"><Icon name="sparkles" size={16} /> Curated for BCA</span>
              <h3>Reference &amp; citation ready</h3>
              <p>
                Every resource is mapped to a subject and level, so you can move from fundamentals
                to research-grade reading without leaving the library.
              </p>
              <Link to="/welcome" className="lp-btn lp-btn-primary">
                Start reading
                <Icon name="arrowRight" size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* -------------------------- testimonials -------------------------- */}
        <section className="lp-section lp-section-alt">
          <div className="lp-container">
            <SectionHead
              kicker="Community"
              title="Loved by students"
              sub="What readers say about studying with Learnova."
              align="center"
            />
            <div className="lp-quote-grid">
              {TESTIMONIALS.map((t, i) => (
                <figure
                  className="lp-quote"
                  key={t.name}
                  data-reveal
                  style={{ '--reveal-delay': `${i * 80}ms` }}
                >
                  <div className="lp-quote-stars" aria-label="5 out of 5">
                    {[0, 1, 2, 3, 4].map((s) => <Icon key={s} name="star" size={15} />)}
                  </div>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <span className="lp-quote-avatar" aria-hidden="true">{t.name.charAt(0)}</span>
                    <span>
                      <strong>{t.name}</strong>
                      <em>{t.meta}</em>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- about ----------------------------- */}
        <section className="lp-section" id="about">
          <div className="lp-container lp-about">
            <div className="lp-about-copy" data-reveal>
              <span className="lp-kicker">About</span>
              <h2 className="lp-sec-title">A calmer way to learn</h2>
              <p className="lp-sec-sub">
                Learnova is a digital library built for university computer-application programmes.
                It pairs a curated, course-aligned catalogue with a focused reading experience —
                no clutter, no noise, just the material you need.
              </p>
              <ul className="lp-about-points">
                <li data-reveal><Icon name="check" size={16} /> Course-aligned, syllabus-first catalogue</li>
                <li data-reveal><Icon name="check" size={16} /> Progress, bookmarks and favorites in one place</li>
                <li data-reveal><Icon name="check" size={16} /> Fast, accessible and built for every device</li>
              </ul>
            </div>
            <div className="lp-about-panel" data-reveal style={{ '--reveal-delay': '120ms' }}>
              <div className="lp-about-metric">
                <span className="lp-about-metric-value">{totalBooks || '—'}</span>
                <span className="lp-about-metric-label">Books in the catalogue</span>
              </div>
              <div className="lp-about-metric">
                <span className="lp-about-metric-value">{SUBJECTS.length}</span>
                <span className="lp-about-metric-label">Core BCA subjects</span>
              </div>
              <div className="lp-about-metric">
                <span className="lp-about-metric-value">{COURSE_TRACKS.length}</span>
                <span className="lp-about-metric-label">Guided study tracks</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------ cta ------------------------------ */}
        <section className="lp-cta">
          <div className="lp-container lp-cta-inner" data-reveal>
            <div className="lp-cta-copy">
              <h2>Start reading today</h2>
              <p>Create your free account and open the full Learnova library in seconds.</p>
            </div>
            <div className="lp-cta-actions">
              <Link to="/signup" className="lp-btn lp-btn-white lp-btn-lg">
                Get started free
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/login" className="lp-btn lp-btn-ghost-light lp-btn-lg">Log in</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------- footer ---------------------------- */}
      <footer className="lp-footer" id="contact">
        <div className="lp-container lp-footer-grid">
          <div className="lp-footer-brand">
            <a href="#home" className="lp-brand">
              <img src="/Logo of Learnova with Book Icon.png" alt="" className="lp-brand-logo" />
              <span className="lp-brand-name">Learnova</span>
            </a>
            <p>A modern university e-library for computer-application programmes. Built for curious minds.</p>
          </div>

          <nav className="lp-footer-col" aria-label="Explore">
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <a href="#categories">Categories</a>
            <a href="#ebooks">E-Books</a>
            <a href="#courses">Courses</a>
          </nav>

          <nav className="lp-footer-col" aria-label="Resources">
            <h4>Resources</h4>
            <a href="#research">Research papers</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/welcome">Library access</Link>
          </nav>

          <div className="lp-footer-col">
            <h4>Contact</h4>
            <a href="mailto:library@learnova.edu"><Icon name="mail" size={16} /> library@learnova.edu</a>
            <a href="tel:+919876543210"><Icon name="phone" size={16} /> +91 98765 43210</a>
            <span className="lp-footer-addr"><Icon name="pin" size={16} /> Department of Computer Applications</span>
          </div>
        </div>

        <div className="lp-container lp-footer-bottom">
          <span>© {new Date().getFullYear()} Learnova. Built for curious minds.</span>
          <span className="lp-footer-made">University digital library</span>
        </div>
      </footer>
    </div>
  )
}
