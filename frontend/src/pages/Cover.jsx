import { useNavigate } from 'react-router-dom'

export default function Cover() {
  const navigate = useNavigate()
  const enter = () => navigate('/welcome')

  return (
    <div
      className="cover-screen cover-enter-zone"
      onClick={enter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          enter()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Enter Learnova"
    >
      <div className="cover-ambient" aria-hidden="true">
        <span className="blob blob-a"></span>
        <span className="blob blob-b"></span>
        <span className="blob blob-c"></span>
        <span className="cover-flare" aria-hidden="true"></span>
      </div>

      <header className="cover-top">
        <span className="brand">
          <img src="/Logo of Learnova with Book Icon.png" alt="Learnova" className="brand-logo" />
        </span>
      </header>

      <main className="cover-main">
        <p className="eyebrow">A smarter place to learn</p>
        <h1 className="cover-title">
          Learn a little,
          <br />
          grow a lot.
        </h1>
        <p className="cover-tagline">
          A calm, intelligent space built for curious minds.
        </p>

        <button type="button" className="cover-enter">
          Enter Learnova
          <span className="cover-enter-arrow" aria-hidden="true">→</span>
        </button>
      </main>

      <footer className="cover-foot">
        <span>© {new Date().getFullYear()} Learnova. Built for curious minds.</span>
      </footer>
    </div>
  )
}