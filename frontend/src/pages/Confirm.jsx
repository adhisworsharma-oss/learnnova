import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Confirm() {
  const { state } = useLocation()
  const isSignup = state?.mode === 'signup'

  return (
    <AuthLayout>
      <div className="card success-card">
        <div className="success-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path pathLength="1" d="M4 12.5l5 5L20 6.5" />
          </svg>
        </div>

        <h2 className="success-title">
          {isSignup ? `Welcome, ${state.name}!` : `Welcome back${state.name ? `, ${state.name}` : ''}!`}
        </h2>

        <p className="success-text">
          {isSignup ? (
            <>
              Your account has been created successfully. Keep your membership ID handy —
              you&apos;ll use it to log in.
            </>
          ) : (
            <>You&apos;ve logged in successfully. Enjoy your Learnova space!</>
          )}
        </p>

        {isSignup && (
          <div className="membership-box">
            <span className="membership-label">Your membership ID</span>
            <span className="membership-id">{state.membershipId}</span>
          </div>
        )}

        <Link to="/" className="submit-btn">
          Return to cover
        </Link>
      </div>
    </AuthLayout>
  )
}