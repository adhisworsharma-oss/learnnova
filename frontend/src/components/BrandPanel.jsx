import { Link } from 'react-router-dom'

export default function BrandPanel() {
  return (
    <aside className="aside">
      <div className="aside-inner">
        <Link to="/" className="brand">
          <img src="/Logo of Learnova with Book Icon.png" alt="Learnova" className="brand-logo" />
          <span className="brand-name">Learnova</span>
        </Link>

        <div className="brand-copy">
          <p className="eyebrow">A smarter place to learn</p>
          <h1 className="headline">
            Learn a little,
            <br />
            grow a lot.
          </h1>
          <p className="tagline">A calm, intelligent space built for curious minds.</p>
        </div>
      </div>
    </aside>
  )
}
