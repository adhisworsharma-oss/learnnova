import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { AlertIcon, MailIcon, LockIcon, EyeIcon } from '../components/Icons'
import { api, setToken } from '../api'

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const errors = (() => {
    const err = {}
    if (!values.email.trim()) err.email = 'Membership ID / email is required'
    if (!values.password) err.password = 'Password is required'
    return err
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (Object.keys(errors).length > 0 || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: {
          identifier: values.email.trim(),
          password: values.password,
        },
      })
      setToken(data.token)
      navigate('/confirm', {
        state: { mode: 'login', name: data.user.name },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, config) => {
    const invalid = touched[name] && errors[name]
    const valid = touched[name] && !errors[name] && String(values[name] ?? '').length > 0
    const isPassword = name === 'password'
    const msgId = `${name}-help`

    return (
      <div className="field">
        <label htmlFor={name}>{config.label}</label>
        <div className="control">
          <span className="control-icon" aria-hidden="true">
            {config.icon}
          </span>
          <input
            id={name}
            name={name}
            type={isPassword && showPw ? 'text' : config.type}
            placeholder={config.placeholder}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete={config.autoComplete}
            className={
              'has-icon' +
              (invalid ? ' invalid' : '') +
              (isPassword ? ' has-toggle' : '') +
              ((valid && !isPassword) || (invalid && !isPassword) ? ' has-status' : '')
            }
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? msgId : undefined}
          />
          {valid && !isPassword && (
            <span className="status-icon valid" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path pathLength="1" d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
          )}
          {invalid && !isPassword && (
            <span className="status-icon bad" aria-hidden="true">
              <AlertIcon />
            </span>
          )}
          {isPassword && (
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              aria-pressed={showPw}
            >
              <EyeIcon open={showPw} />
            </button>
          )}
        </div>
        <div className={invalid ? 'msg open' : 'msg'} id={msgId} aria-live="polite">
          {invalid && (
            <span>
              <span className="msg-line error">
                <AlertIcon />
                {errors[name]}
              </span>
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <div className="card">
        <header className="form-head">
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Log in to your Learnova account</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {field('email', {
            label: 'Membership ID / Email',
            type: 'text',
            placeholder: 'you@yourcollege.edu or LRN-2026-XXXXXX',
            autoComplete: 'username',
            icon: <MailIcon />,
          })}

          {field('password', {
            label: 'Password',
            type: 'password',
            placeholder: 'Enter your password',
            autoComplete: 'current-password',
            icon: <LockIcon />,
          })}

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <AlertIcon />
              {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Logging in…
              </>
            ) : (
              'Log In'
            )}
          </button>

          <p className="login-link">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
