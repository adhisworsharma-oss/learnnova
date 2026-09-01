export default function AuthLayout({ children }) {
  return (
    <div className="app app--centered">
      <div className="ambient" aria-hidden="true">
        <span className="blob blob-a"></span>
        <span className="blob blob-b"></span>
        <span className="blob blob-c"></span>
      </div>

      <main className="form-panel">
        <div className="form-column">{children}</div>
      </main>
    </div>
  )
}
