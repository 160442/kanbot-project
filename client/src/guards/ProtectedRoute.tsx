import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import GuardLoader from './GuardLoader'

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const initializing = useAuthStore((s) => s.initializing)
  const location = useLocation()

  if (!initialized || initializing) {
    return <GuardLoader message="Checking session…" />
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
