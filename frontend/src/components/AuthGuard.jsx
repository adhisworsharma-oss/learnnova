import { Navigate } from 'react-router-dom'
import { getToken } from '../api.js'

export default function AuthGuard({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return children
}
