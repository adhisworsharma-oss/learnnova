import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { api, setToken } from '../api'

export default function SignUp() {
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
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

  const passwordStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score += 1
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1
    return score
  }

  const handleSubmit = async (e) => {
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
      setError(null)
      try {
        const data = await api('/auth/register', {
          method: 'POST',
          body: {
            name: values.name.trim(),
            surname: values.surname.trim(),
            email: values.email.trim(),
            password: values.password,
            dob: values.dob || undefined,
          },
        })
        setToken(data.token)
        navigate('/confirm', {
          state: {
            mode: 'signup',
            name: data.user.name,
            email: data.user.email,
            membershipId: data.user.membershipId,
          },
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const togglePw = (field) =>
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }))

  const fieldProps = {
    values,
    errors,
    touched,
    showPw,
    onTogglePw: togglePw,
    onChange: handleChange,
    onBlur: handleBlur,
    passwordStrength,
  }

  return (
    <AuthLayout>
      <div className="card">
        <header className="form-head">
          <h2 className="title">Create Account</h2>
          <p className="subtitle">Join Learnova to unlock your learning journey</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <FormField {...fieldProps} label="Name" type="text" name="name" placeholder="First name" index={1} />
            <FormField {...fieldProps} label="Surname" type="text" name="surname" placeholder="Last name" index={2} />
          </div>

          <FormField {...fieldProps} label="Registration Number" type="text" name="regNo" placeholder="e.g. 2201CS032" index={3} />

          <FormField {...fieldProps} label="College Email" type="email" name="email" placeholder="you@yourcollege.edu" index={4} />

          <div className="row">
            <FormField {...fieldProps} label="Password" type="password" name="password" placeholder="Minimum 8 characters" extra={{ password: true }} index={5} />
            <FormField {...fieldProps} label="Confirm Password" type="password" name="confirmPassword" placeholder="Re-enter password" extra={{ password: true }} index={6} />
          </div>

          <FormField {...fieldProps} label="Date of Birth" type="date" name="dob" placeholder="" index={7} />

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

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
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
