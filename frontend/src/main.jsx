import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageLoader from './components/PageLoader.jsx'
import './index.css'
import './App.css'
import Cover from './pages/Cover.jsx'
import Access from './pages/Access.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Confirm from './pages/Confirm.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route element={<PageLoader />}>
        <Route path="/" element={<Cover />} />
        <Route path="/welcome" element={<Access />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirm" element={<Confirm />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
