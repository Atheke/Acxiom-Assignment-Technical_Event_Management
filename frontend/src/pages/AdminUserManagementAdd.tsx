import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEndUserAsAdmin, logoutRequest } from '../services/api'
import './AdminHome.css'
import './Login.css'

export default function AdminUserManagementAdd() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await createEndUserAsAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      setSuccess('User account created.')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-panel admin-dashboard-panel--narrow">
        <div className="admin-dashboard-top">
          <button
            type="button"
            className="admin-dash-nav"
            onClick={() => navigate('/admin/users')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">User Management — Add</p>
        <p className="admin-form-hint">
          Create a user account (role: User).
        </p>
        {success ? (
          <p className="login-notice" role="status">
            {success}
          </p>
        ) : null}
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="u-add-name">
              Name
            </label>
            <input
              id="u-add-name"
              className="login-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="u-add-email">
              Email
            </label>
            <input
              id="u-add-email"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="u-add-password">
              Password
            </label>
            <input
              id="u-add-password"
              className="login-input"
              type="password"
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
              {submitting ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
