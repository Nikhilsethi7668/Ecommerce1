import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: 16 }}>Checking authentication...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
