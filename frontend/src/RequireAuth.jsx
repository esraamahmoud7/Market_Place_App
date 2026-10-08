import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function RequireAuth() {
  const { authed } = useAuth()
  const location = useLocation()
  return authed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
