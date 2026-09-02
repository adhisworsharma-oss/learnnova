import { useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

export default function PageLoader() {
  const { pathname, search } = useLocation()
  const outlet = useOutlet()
  const liveKey = `${pathname}${search}`

  const [loadedKey, setLoadedKey] = useState('')

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (!active) return
      setLoadedKey(liveKey)
    }, 350)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [liveKey])

  const loading = liveKey !== loadedKey
  const contentKey = loading ? liveKey : loadedKey

  return (
    <>
      <div className={`page-loader ${loading ? 'visible' : ''}`}>
        <span className="loader-sparkles" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </span>
        <div className="loader-ring" aria-hidden="true">
          <svg viewBox="0 0 54 54">
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <circle className="ring-track" cx="27" cy="27" r="24.5" />
            <circle className="ring-progress" cx="27" cy="27" r="24.5" />
          </svg>
        </div>
        <span className="loader-brand">Learnova</span>
        <span className="loader-tag">loading…</span>
      </div>
      <div className={`page-content ${loading ? 'page-content--hidden' : ''}`}>
        <div key={contentKey}>{outlet}</div>
      </div>
    </>
  )
}
