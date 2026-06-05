import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loading } from '@components/ui/loading'
import { useAuth } from '@hooks/auth/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loading fullPage label="Loading session" size="lg" />
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/" />
  }

  return <Outlet />
}
