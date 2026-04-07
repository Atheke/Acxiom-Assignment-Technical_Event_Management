import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { homePathForRole, loginRequest } from '../api'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromState = location.state as { error?: string; notice?: string } | null
  const fromError = fromState?.error
  const fromNotice = fromState?.notice
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(fromError ?? null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { user } = await loginRequest(email.trim(), password)
      navigate(homePathForRole(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-banner">Event Management System</header>
        {fromNotice ? (
          <p className="login-notice" role="status">
            {fromNotice}
          </p>
        ) : null}
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-row">
            <label className="login-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-row">
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="login-actions">
            <button
              className="login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Login'}
            </button>
          </div>
          <p className="login-footer">
            Need an account?{' '}
            <Link to="/signup" className="login-inline-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
