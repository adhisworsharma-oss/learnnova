import { useState, useEffect, useRef } from 'react'
import './App.css'

const STRENGTH_LABELS = { 1: 'Fair', 2: 'Good', 3: 'Strong' }

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path pathLength="1" d="M4 12.5l5 5L20 6.5" />
  </svg>
)

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z" />
  </svg>
)

const PARTICLES = [
  { x: 120, y: 254, tx: 0, ty: -18, s: 1.6, d: 7, dl: 0.3, in: false },
  { x: 140, y: 252, tx: 0, ty: -20, s: 1.8, d: 8, dl: 1.1, in: false },
  { x: 130, y: 266, tx: 2, ty: -26, s: 1.4, d: 9, dl: 1.9, in: false },
  { x: 114, y: 246, tx: 0, ty: -12, s: 1.3, d: 6.5, dl: 2.7, in: false },
  { x: 148, y: 244, tx: 0, ty: -12, s: 1.5, d: 7.5, dl: 3.5, in: false },
  { x: 134, y: 230, tx: 0, ty: -10, s: 1.2, d: 8.5, dl: 4.3, in: false },
  { x: 78, y: 238, tx: 34, ty: 6, s: 1.5, d: 10, dl: 1.2, in: true },
  { x: 200, y: 226, tx: -40, ty: 4, s: 1.6, d: 11, dl: 2.2, in: true },
  { x: 168, y: 120, tx: 0, ty: 66, s: 1.2, d: 12, dl: 3.8, in: true },
  { x: 58, y: 308, tx: 34, ty: -14, s: 1.3, d: 9, dl: 5.6, in: true },
  { x: 96, y: 300, tx: 10, ty: -6, s: 1.3, d: 12, dl: 2.6, in: true },
  { x: 170, y: 300, tx: -10, ty: -8, s: 1.3, d: 13, dl: 4.6, in: true },
  { x: 112, y: 198, tx: 0, ty: -8, s: 1.1, d: 11, dl: 7.0, in: false },
  { x: 150, y: 202, tx: 0, ty: -6, s: 1.2, d: 10, dl: 6.2, in: false },
  { x: 78, y: 182, tx: 20, ty: 26, s: 1.2, d: 12, dl: 1.6, in: true },
  { x: 186, y: 174, tx: -18, ty: 30, s: 1.2, d: 12, dl: 3.0, in: true },
]

function LibraryScene() {
  return (
    <div className="library" aria-hidden="true">
      <svg viewBox="0 0 260 420" focusable="false">
          <defs>
            <linearGradient id="lib-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f1e8ff" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="lib-page" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0.16" />
            </linearGradient>
            <radialGradient id="lib-glow">
              <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#6d28d9" stopOpacity="0.16" />
              <stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* faint library shelves + arcade grid */}
          <g className="lib-bg" stroke="#e9d5ff" fill="none">
            <line x1="20" y1="130" x2="20" y2="398" strokeOpacity="0.04" />
            <line x1="240" y1="150" x2="240" y2="398" strokeOpacity="0.04" />
            <line x1="10" y1="354" x2="250" y2="354" strokeOpacity="0.05" />
            <path d="M18 238 h9 v42 h-9 z" strokeOpacity="0.3" />
            <path d="M32 248 h9 v32 h-9 z" strokeOpacity="0.22" />
            <line x1="12" y1="284" x2="56" y2="284" strokeOpacity="0.25" />
          </g>

          {/* soft glow behind the book */}
          <circle cx="128" cy="258" r="94" fill="url(#lib-glow)" className="lib-glow" />

          {/* faint interactive canvas frame around the book */}
          <rect
            x="30"
            y="222"
            width="196"
            height="96"
            rx="16"
            fill="none"
            stroke="#c9b3f8"
            strokeOpacity="0.1"
            className="lib-frame"
          />

          {/* knowledge links: book -> knowledge -> discovery */}
          <g className="lib-net" stroke="#c9b3f8" fill="none" strokeWidth="1">
            <path d="M60 178 Q 78 204 98 226" strokeOpacity="0.4" className="lib-conn" />
            <path d="M202 182 Q 186 204 166 226" strokeOpacity="0.4" className="lib-conn" />
            <path d="M52 316 Q 68 294 88 274" strokeOpacity="0.4" className="lib-conn" />
            <path d="M208 318 Q 192 302 178 288" strokeOpacity="0.4" className="lib-conn" />
          </g>

          {/* tiny data anchors at each connected element */}
          <g fill="#e9d5ff">
            <path d="M60 176 l3 2.5 -3 2.5 -3 -2.5 Z" className="lib-anchor" transform="translate(0 -1)" />
            <path d="M202 180 l3 2.5 -3 2.5 -3 -2.5 Z" className="lib-anchor" />
            <path d="M52 314 l3 2.5 -3 2.5 -3 -2.5 Z" className="lib-anchor" />
            <path d="M208 316 l3 2.5 -3 2.5 -3 -2.5 Z" className="lib-anchor" />
          </g>

          {/* connected knowledge sources */}
          <g className="lib-float f1" stroke="#e6d5ff" fill="rgba(139,92,246,0.3)" strokeWidth="1.2">
            <path d="M60 148 L48 143 L48 159 L60 163 Z" />
            <path d="M60 148 L72 143 L72 159 L60 163 Z" />
            <path d="M60 148 L60 163" strokeWidth="1" strokeOpacity="0.9" stroke="#f1e8ff" />
            <circle cx="66" cy="140" r="1.4" fill="#ffffff" stroke="none" className="lib-spec" />
          </g>

          <g className="lib-float f2" stroke="#e6d5ff" fill="rgba(139,92,246,0.26)" strokeWidth="1.2">
            <rect x="192" y="146" width="30" height="36" rx="3.5" />
            <path d="M198 156 h18 M198 162 h18 M198 168 h12" strokeWidth="1.05" strokeOpacity="0.8" />
            <path d="M204 180 h6 M213 180 a4 4 0 0 1 4 4 l0 2 h-10 l0 -6 z" strokeWidth="0.9" strokeOpacity="0.65" />
            <circle cx="222" cy="154" r="1.4" fill="#ffffff" stroke="none" className="lib-spec" />
          </g>

          <g className="lib-card" stroke="#e6d5ff" fill="rgba(139,92,246,0.24)" strokeWidth="1.1">
            <rect x="38" y="286" width="28" height="34" rx="4" className="lib-float f3" />
            <path className="lib-float f3" d="M44 296 h16 M44 302 h16 M44 308 h9" strokeWidth="1" strokeOpacity="0.8" />
            <rect className="lib-float f3" x="44" y="314" width="7" height="2.5" rx="1.2" fill="#e9d5ff" stroke="none" />
          </g>

          <g className="lib-float f4" stroke="#e6d5ff" fill="rgba(139,92,246,0.26)" strokeWidth="1.2">
            <rect x="186" y="306" width="32" height="11" rx="2.5" />
            <path d="M186 309.5 h32" strokeOpacity="0.7" strokeWidth="1" />
            <rect x="191" y="293" width="27" height="10" rx="2.5" />
            <path d="M191 296.5 h27" strokeOpacity="0.7" strokeWidth="1" />
            <path d="M204 293 v-9 l5 3.2 -5 3.2 z" fill="#e9d5ff" stroke="none" />
          </g>

          {/* rising knowledge beams -> core */}
          <path
            d="M124 254 l0 -14 M128 258 l0 -24 M134 254 l0 -14"
            className="lib-beam"
          />
          <path d="M128 226 l5.5 7 -5.5 7 -5.5 -7 Z" className="lib-core" />

          {/* central open digital book */}
          <g className="lib-book">
            <g transform="translate(128 262) scale(1.08) translate(-128 -262)">
              <ellipse cx="128" cy="306" rx="72" ry="8" fill="#1e0b3d" opacity="0.7" />
              <path
                className="lib-page-left"
                d="M128 250 C 88 232, 60 232, 46 252 L 46 298 C 62 285, 90 285, 128 300 Z"
                fill="url(#lib-page)"
                stroke="url(#lib-stroke)"
                strokeWidth="1.4"
              />
              <path
                className="lib-page-right"
                d="M128 250 C 168 232, 200 232, 214 252 L 214 298 C 198 285, 166 285, 128 300 Z"
                fill="url(#lib-page)"
                stroke="url(#lib-stroke)"
                strokeWidth="1.4"
              />
              <path d="M128 248 L128 302" stroke="#f1e8ff" strokeOpacity="0.9" strokeWidth="1.3" />
              <g stroke="#f1e8ff" strokeOpacity="0.55" strokeWidth="1.05" fill="none">
                <path d="M58 268 C 78 260, 98 260, 118 266" />
                <path d="M58 280 C 80 272, 100 272, 118 278" />
                <path d="M202 268 C 182 260, 162 260, 142 266" />
                <path d="M202 280 C 180 272, 162 272, 142 278" />
              </g>
              <circle cx="78" cy="272" r="1.2" fill="#ffffff" stroke="none" className="lib-spec" />
              <circle cx="182" cy="274" r="1.2" fill="#ffffff" stroke="none" className="lib-spec" />
              <path d="M156 290 L204 290" stroke="#e9d5ff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <path d="M156 290 L180 290" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" className="lib-progress" />
            </g>
          </g>

          {/* discovered-knowledge particles */}
          <g fill="#d8c7ff">
            {PARTICLES.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.s}
                className={p.in ? 'lib-p in' : 'lib-p'}
                style={{
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  animationDuration: `${p.d}s`,
                  animationDelay: `${p.dl}s`,
                }}
              />
            ))}
          </g>
        </svg>
    </div>
  )
}

export default function App() {
  const [values, setValues] = useState({
    name: '',
    surname: '',
    regNo: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
  })

  const [touched, setTouched] = useState({})
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submitTimer = useRef(null)

  useEffect(() => {
    return () => clearTimeout(submitTimer.current)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const errors = (() => {
    const err = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!values.name.trim()) err.name = 'Name is required'
    if (!values.surname.trim()) err.surname = 'Surname is required'
    if (!values.regNo.trim()) err.regNo = 'Registration number is required'
    if (!values.email.trim()) {
      err.email = 'College email is required'
    } else if (!emailRe.test(values.email)) {
      err.email = 'Enter a valid email address'
    } else if (!/\.edu/.test(values.email) && !/\.ac\./.test(values.email)) {
      err.email = 'Please use your college (edu / ac) email'
    }
    if (!values.password) {
      err.password = 'Password is required'
    } else if (values.password.length < 8) {
      err.password = 'Password must be at least 8 characters'
    }
    if (values.confirmPassword !== values.password) {
      err.confirmPassword = 'Passwords do not match'
    }
    if (!values.dob) err.dob = 'Date of birth is required'

    return err
  })()

  const showError = (field) => touched[field] && errors[field]
  const isValidField = (field) =>
    touched[field] && !errors[field] && String(values[field] ?? '').length > 0

  const passwordStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score += 1
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1
    return score
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      name: true,
      surname: true,
      regNo: true,
      email: true,
      password: true,
      confirmPassword: true,
      dob: true,
    })
    if (Object.keys(errors).length === 0 && !submitting) {
      setSubmitting(true)
      submitTimer.current = setTimeout(() => {
        setSubmitting(false)
        setSubmitted(true)
      }, 1500)
    }
  }

  const togglePw = (field) =>
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }))

  const field = (label, type, name, placeholder, extra = {}, index) => {
    const invalid = showError(name)
    const valid = isValidField(name)
    const isPassword = extra.password
    const isDob = type === 'date'
    const delay = (0.22 + (index ?? 0) * 0.07).toFixed(2)
    const msgId = `${name}-help`
    const inputType = isPassword && showPw[name] ? 'text' : type

    let msg = null
    if (invalid) {
      msg = (
        <span className="msg-line error">
          <AlertIcon />
          {errors[name]}
        </span>
      )
    } else if (name === 'password' && touched.password && values.password) {
      const score = passwordStrength(values.password)
      msg = (
        <span className="msg-line strength">
          <span className="strength-bars" data-level={score}>
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="strength-label">{STRENGTH_LABELS[score]}</span>
        </span>
      )
    } else if (
      name === 'confirmPassword' &&
      touched.confirmPassword &&
      values.confirmPassword &&
      values.confirmPassword === values.password
    ) {
      msg = (
        <span className="msg-line ok">
          <CheckIcon />
          Passwords match
        </span>
      )
    } else if (valid && !isPassword && !isDob) {
      msg = (
        <span className="msg-line ok">
          <CheckIcon />
          Looks good
        </span>
      )
    }

    return (
      <div className="field" style={{ animationDelay: `${delay}s` }}>
        <label htmlFor={name}>{label}</label>
        <div className="control">
          <input
            id={name}
            name={name}
            type={inputType}
            placeholder={placeholder}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              (invalid ? ' invalid' : '') +
              (isPassword ? ' has-toggle' : '') +
              (((valid && !isPassword && !isDob) || (invalid && !isDob)) ? ' has-status' : '')
            }
            aria-invalid={invalid || undefined}
            aria-describedby={invalid || msg ? msgId : undefined}
          />
          {valid && !isPassword && !isDob && (
            <span className="status-icon valid" aria-hidden="true">
              <CheckIcon />
            </span>
          )}
          {invalid && !isPassword && !isDob && (
            <span className="status-icon bad" aria-hidden="true">
              <AlertIcon />
            </span>
          )}
          {isPassword && (
            <button
              type="button"
              className="pw-toggle"
              onClick={() => togglePw(name)}
              aria-label={showPw[name] ? 'Hide password' : 'Show password'}
              aria-pressed={showPw[name]}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={showPw[name] ? 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z' : 'M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.3M6.6 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.9'} />
              </svg>
            </button>
          )}
        </div>
        <div
          className={msg ? 'msg open' : 'msg'}
          id={msgId}
          aria-live="polite"
        >
          {msg && <span>{msg}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="ambient" aria-hidden="true">
        <span className="blob blob-a"></span>
        <span className="blob blob-b"></span>
        <span className="blob blob-c"></span>
      </div>

      <aside className="aside">
        <div className="aside-inner">
          <div className="brand">
            <img src="/learnova-logo.png" alt="Learnova" className="brand-logo" />
            <span className="brand-name">Learnova</span>
          </div>

          <div className="brand-copy">
            <p className="eyebrow">A smarter place to learn</p>
            <h1 className="headline">
              Learn a little,
              <br />
              grow a lot.
            </h1>
            <p className="tagline">A calm, intelligent space built for curious minds.</p>
          </div>

          <LibraryScene />
        </div>
      </aside>

      <main className="form-panel">
        <div className="form-column">
          {submitted ? (
            <div className="card success-card">
              <div className="success-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path pathLength="1" d="M4 12.5l5 5L20 6.5" />
                </svg>
              </div>
              <h2 className="success-title">Welcome, {values.name}!</h2>
              <p className="success-text">
                Your account has been created successfully. A confirmation has been sent to{' '}
                <strong>{values.email}</strong>.
              </p>
              <button className="submit-btn" onClick={() => setSubmitted(false)}>
                Create another account
              </button>
            </div>
          ) : (
            <div className="card">
              <header className="form-head">
                <h2 className="title">Create Account</h2>
                <p className="subtitle">Join Learnova to unlock your learning journey</p>
              </header>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  {field('Name', 'text', 'name', 'First name', {}, 1)}
                  {field('Surname', 'text', 'surname', 'Last name', {}, 2)}
                </div>

                {field('Registration Number', 'text', 'regNo', 'e.g. 2201CS032', {}, 3)}

                {field('College Email', 'email', 'email', 'you@yourcollege.edu', {}, 4)}

                <div className="row">
                  {field('Password', 'password', 'password', 'Minimum 8 characters', { password: true }, 5)}
                  {field('Confirm Password', 'password', 'confirmPassword', 'Re-enter password', { password: true }, 6)}
                </div>

                {field('Date of Birth', 'date', 'dob', '', {}, 7)}

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner" aria-hidden="true"></span>
                      Creating account…
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>

                <p className="login-link">
                  Already have an account? <a href="#">Log in</a>
                </p>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}