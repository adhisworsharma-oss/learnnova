import { createRoot } from 'react-dom/client'
import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen.jsx'
import PageLoader from './components/PageLoader.jsx'
import AuthGuard from './components/AuthGuard.jsx'
import AppLayout from './components/AppLayout.jsx'
import './index.css'
import './App.css'
import Cover from './pages/Cover.jsx'
import Access from './pages/Access.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Confirm from './pages/Confirm.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Books from './pages/Books.jsx'
import Groups from './pages/Groups.jsx'
import GroupDetail from './pages/GroupDetail.jsx'
import Profile from './pages/Profile.jsx'
import Events from './pages/Events.jsx'
import Settings from './pages/Settings.jsx'

function Root() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}
      <BrowserRouter>
        <Routes>
          <Route element={<PageLoader />}>
            <Route path="/" element={<Cover />} />
            <Route path="/welcome" element={<Access />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/confirm" element={<Confirm />} />
          </Route>
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/events" element={<Events />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
