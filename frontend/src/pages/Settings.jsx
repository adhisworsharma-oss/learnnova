import { useState, useEffect } from 'react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('learnova_dark') === 'true')
  const [notifications, setNotifications] = useState({
    groupPosts: true,
    groupJoin: true,
    dueReminders: true,
    bookRecommendations: true,
    weeklyDigest: false,
    soundEffects: true,
  })
  const [emailNotif, setEmailNotif] = useState({
    groupActivity: true,
    dueDates: true,
    newBooks: false,
    newsletter: false,
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [language, setLanguage] = useState('en')
  const [fontSize, setFontSize] = useState('medium')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('learnova_dark', darkMode)
  }, [darkMode])

  function handlePasswordChange(e) {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.newPw || !passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'All fields are required.' })
      return
    }
    if (passwordForm.newPw.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    if (passwordForm.newPw !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
    setPasswordForm({ current: '', newPw: '', confirm: '' })
  }

  function toggleNotif(key) {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleEmail(key) {
    setEmailNotif(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Dark Mode</h3>
              <p>Switch between light and dark themes</p>
            </div>
            <button className={`toggle-switch ${darkMode ? 'toggle-switch--on' : ''}`} onClick={() => setDarkMode(!darkMode)}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Font Size</h3>
              <p>Adjust text size across the app</p>
            </div>
            <div className="settings-options">
              {['small', 'medium', 'large'].map(s => (
                <button key={s} className={`settings-option-btn ${fontSize === s ? 'settings-option-btn--active' : ''}`} onClick={() => setFontSize(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Notifications</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Group Posts</h3>
              <p>When someone posts in your groups</p>
            </div>
            <button className={`toggle-switch ${notifications.groupPosts ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('groupPosts')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Group Join Requests</h3>
              <p>When someone joins or requests your groups</p>
            </div>
            <button className={`toggle-switch ${notifications.groupJoin ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('groupJoin')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Due Date Reminders</h3>
              <p>Remind you before reading goals are due</p>
            </div>
            <button className={`toggle-switch ${notifications.dueReminders ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('dueReminders')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Book Recommendations</h3>
              <p>Personalized suggestions based on your reading</p>
            </div>
            <button className={`toggle-switch ${notifications.bookRecommendations ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('bookRecommendations')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Weekly Digest</h3>
              <p>Summary of your weekly reading activity</p>
            </div>
            <button className={`toggle-switch ${notifications.weeklyDigest ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('weeklyDigest')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Sound Effects</h3>
              <p>Play sounds for notifications and interactions</p>
            </div>
            <button className={`toggle-switch ${notifications.soundEffects ? 'toggle-switch--on' : ''}`} onClick={() => toggleNotif('soundEffects')}>
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Email Notifications</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Group Activity</h3>
              <p>Email when there's activity in your groups</p>
            </div>
            <button className={`toggle-switch ${emailNotif.groupActivity ? 'toggle-switch--on' : ''}`} onClick={() => toggleEmail('groupActivity')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Due Dates</h3>
              <p>Email reminders for reading deadlines</p>
            </div>
            <button className={`toggle-switch ${emailNotif.dueDates ? 'toggle-switch--on' : ''}`} onClick={() => toggleEmail('dueDates')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>New Books</h3>
              <p>Email when books matching your interests are added</p>
            </div>
            <button className={`toggle-switch ${emailNotif.newBooks ? 'toggle-switch--on' : ''}`} onClick={() => toggleEmail('newBooks')}>
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Newsletter</h3>
              <p>Monthly Learnova newsletter with tips and updates</p>
            </div>
            <button className={`toggle-switch ${emailNotif.newsletter ? 'toggle-switch--on' : ''}`} onClick={() => toggleEmail('newsletter')}>
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Change Password</h2>
        <div className="settings-card">
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="field">
              <label>Current Password</label>
              <div className="control">
                <input type="password" placeholder="Enter current password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>New Password</label>
              <div className="control">
                <input type="password" placeholder="Minimum 8 characters" value={passwordForm.newPw} onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <div className="control">
                <input type="password" placeholder="Re-enter new password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
              </div>
            </div>
            {passwordMsg && (
              <div className={`settings-msg ${passwordMsg.type === 'error' ? 'settings-msg--error' : 'settings-msg--success'}`}>
                {passwordMsg.text}
              </div>
            )}
            <button type="submit" className="settings-save-btn">Update Password</button>
          </form>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Language & Region</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Language</h3>
              <p>Choose your preferred language</p>
            </div>
            <select className="settings-select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
              <option value="ne">नेपाली</option>
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Time Zone</h3>
              <p>Your local time zone for events and reminders</p>
            </div>
            <span className="settings-static">UTC+5:45 (Nepal)</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="settings-danger-btn">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
