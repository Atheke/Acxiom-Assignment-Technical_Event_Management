import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homePathForRole, signupRequest } from '../services/api'
import './Login.css'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { user } = await signupRequest({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      navigate(homePathForRole(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card signup-card">
        <div className="signup-toolbar">
          <Link to="/login" className="signup-toolbar-btn signup-toolbar-link">
            Back to login
          </Link>
        </div>
        <header className="login-banner">Event Management System</header>
        <p className="login-notice">
          Create a user account. Vendor accounts are created by an administrator
          under Admin → Maintain Vendor → Vendor Management → Add.
        </p>
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="signup-name">
              Name
            </label>
            <input
              id="signup-name"
              className="login-input"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
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
          <div className="login-field">
            <label className="login-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className="login-input"
              type="password"
              name="password"
              autoComplete="new-password"
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
          <div className="signup-actions">
            <button
              className="login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </div>
          <p className="login-footer">
            Already have an account?{' '}
            <Link to="/login" className="login-inline-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
