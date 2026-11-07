import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import GuardLoader from './GuardLoader'

export default function GuestRoute() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const initializing = useAuthStore((s) => s.initializing)

  if (!initialized || initializing) {
    return <GuardLoader message="Loading…" />
  }

  if (user) {
    return <Navigate to="/projects" replace />
  }

  return <Outlet />
}
