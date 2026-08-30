import { useState, useEffect } from 'react'
import './App.css'


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
  const [submitted, setSubmitted] = useState(false)
  const [intro, setIntro] = useState('active')

  useEffect(() => {
    const t1 = setTimeout(() => setIntro('leaving'), 1600)
    const t2 = setTimeout(() => setIntro('done'), 2250)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
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
    if (Object.keys(errors).length === 0) {
      setSubmitted(true)
    }
  }

  let fieldIndex = 0

  const field = (label, type, name, placeholder) => {
    fieldIndex += 1
    const invalid = showError(name)
    return (
      <div
        className="field"
        style={{ animationDelay: `${(0.25 + fieldIndex * 0.08).toFixed(2)}s` }}
      >
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={values[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={invalid ? 'invalid' : ''}
        />
        {invalid && <span className="error">{errors[name]}</span>}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <div className="orb orb-c"></div>
        <div className="card success-card">
          <div className="success-check">&#10003;</div>
          <h2>Welcome, {values.name}!</h2>
          <p>
            Your account has been created successfully.
            <br />
            Confirmation sent to {values.email}.
          </p>
          <button className="submit-btn" onClick={() => setSubmitted(false)}>
            Create another account
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {intro !== 'done' && (
        <div className={intro === 'leaving' ? 'intro leaving' : 'intro'}>
          <div className="intro-halo"></div>
          <div className="intro-logo">
            <img src="/learnova-logo.png" alt="Learnova" />
          </div>
          <div className="intro-word">
            {['L', 'e', 'a', 'r', 'n', 'o', 'v', 'a'].map((ch, i) => (
              <span key={i} style={{ animationDelay: `${(0.05 + i * 0.07).toFixed(2)}s` }}>
                {ch}
              </span>
            ))}
          </div>
          <span className="spark spark-1">&#10022;</span>
          <span className="spark spark-2">&#10022;</span>
          <span className="spark spark-3">&#10022;</span>
          <span className="spark spark-4">&#10022;</span>
        </div>
      )}

      <div className={intro === 'active' ? 'page' : 'page reveal'}>
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>
        <div className="orb orb-c"></div>

      <div className="card">
        <div className="logo-space">
          <div className="logo-circle">
            <img src="/learnova-logo.png" alt="Learnova" />
          </div>
          <span className="logo-text">Learnova</span>
        </div>

        <h1 className="title">Create Account</h1>
        <p className="subtitle">Join Learnova to unlock your learning journey</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {field('Name', 'text', 'name', 'First name')}
            {field('Surname', 'text', 'surname', 'Last name')}
          </div>

          {field('Registration Number', 'text', 'regNo', 'e.g. 2201CS032')}

          {field('College Email', 'email', 'email', 'you@yourcollege.edu')}

          <div className="row">
            {field('Password', 'password', 'password', 'Minimum 8 characters')}
            {field('Confirm Password', 'password', 'confirmPassword', 'Re-enter password')}
          </div>

          {field('Date of Birth', 'date', 'dob', '')}

          <button type="submit" className="submit-btn">
            Sign Up
          </button>

          <p className="login-link">
            Already have an account? <a href="#">Log in</a>
          </p>
        </form>
      </div>
    </div>
    </>
  )
}
