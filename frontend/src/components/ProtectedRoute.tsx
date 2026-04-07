import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  HttpError,
  type AuthUser,
  type Role,
  homePathForRole,
  logoutRequest,
  meRequest,
} from '../services/api'

type Props = {
  allowedRole: Role
  children: ReactNode
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'wrong-role' | 'redirecting'
  >('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user: u } = await meRequest()
        if (cancelled) return
        if (u.role !== allowedRole) {
          setUser(u)
          setStatus('wrong-role')
          return
        }
        setUser(u)
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        await logoutRequest().catch(() => {})
        const msg = e instanceof HttpError ? e.message : 'Not authenticated'
        if (e instanceof HttpError && e.status === 403) {
          navigate('/login', { replace: true, state: { error: msg } })
        } else {
          navigate('/login', { replace: true, state: { from: location } })
        }
        if (!cancelled) setStatus('redirecting')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allowedRole, navigate, location])

  if (status === 'loading') {
    return (
      <div className="app-shell">
        <p className="app-muted">Loading…</p>
      </div>
    )
  }

  if (status === 'redirecting') {
    return null
  }

  if (status === 'wrong-role' && user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  if (status === 'ready') {
    return <>{children}</>
  }

  return null
}
