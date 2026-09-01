import { Link } from 'react-router-dom'

export default function Access() {
  return (
    <div className="cover-screen">
      <div className="cover-ambient" aria-hidden="true">
        <span className="blob blob-a"></span>
        <span className="blob blob-b"></span>
        <span className="blob blob-c"></span>
        <span className="cover-flare" aria-hidden="true"></span>
      </div>

      <header className="cover-top">
        <span className="brand">
          <img src="/learnova-logo.png" alt="Learnova" className="brand-logo" />
          <span className="brand-name">Learnova</span>
        </span>
      </header>

      <main className="cover-main">
        <p className="eyebrow">Welcome to Learnova</p>
        <h1 className="cover-title cover-title-sm">How would you like to continue?</h1>
        <p className="cover-tagline">
          Choose a path below to get started.
        </p>

        <div className="cover-options">
          <Link to="/login" className="cover-option">
            <span className="cover-option-icon" aria-hidden="true">↪</span>
            <span className="cover-option-text">
              <span className="cover-option-title">Log In</span>
              <span className="cover-option-desc">
                I already have an account and want to sign in
              </span>
            </span>
            <span className="cover-option-cta">Log in →</span>
          </Link>

          <Link to="/signup" className="cover-option alt">
            <span className="cover-option-icon" aria-hidden="true">✦</span>
            <span className="cover-option-text">
              <span className="cover-option-title">Sign Up</span>
              <span className="cover-option-desc">
                I&apos;m new here — create my account
              </span>
            </span>
            <span className="cover-option-cta">Sign up →</span>
          </Link>
        </div>

        <Link to="/" className="cover-back">← Back to cover</Link>
      </main>

      <footer className="cover-foot">
        <span>© {new Date().getFullYear()} Learnova. Built for curious minds.</span>
      </footer>
    </div>
  )
}