import { useEffect, useState, useRef } from 'react'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter')
  const videoRef = useRef(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onComplete(), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div className={`splash splash--${phase}`} aria-hidden="true">
      <div className="splash-blobs">
        <span className="splash-blob splash-blob--2"></span>
        <span className="splash-blob splash-blob--3"></span>
      </div>
      <div className="splash-content">
        <video
          ref={videoRef}
          src="/Logo of Learnova with Book Icon.mp4"
          className="splash-video"
          autoPlay
          muted
          playsInline
        />
      </div>
    </div>
  )
}
