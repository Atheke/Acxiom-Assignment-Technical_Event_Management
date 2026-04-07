import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type SignupRole,
  type VendorCategory,
  VENDOR_CATEGORY_OPTIONS,
  homePathForRole,
  signupRequest,
} from '../api'
import './Login.css'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const [role, setRole] = useState<SignupRole>('USER')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState<VendorCategory>('CATERING')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload =
        role === 'VENDOR'
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              businessName: businessName.trim(),
              category,
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
              role,
            }

      const { user, sessionIssued } = await signupRequest(payload)

      if (sessionIssued) {
        navigate(homePathForRole(user.role), { replace: true })
      } else {
        navigate('/login', {
          replace: true,
          state: {
            notice:
              'Vendor account created. You can sign in after an administrator approves your application.',
          },
        })
      }
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
          <button
            type="button"
            className="signup-toolbar-btn"
            disabled
            title="Flow chart (optional in the final app)"
          >
            Chart
          </button>
          <Link to="/login" className="signup-toolbar-btn signup-toolbar-link">
            Back
          </Link>
        </div>
        <header className="login-banner">Event Management System</header>
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-row">
            <label className="login-label" htmlFor="signup-role">
              Role
            </label>
            <select
              id="signup-role"
              className="login-input login-select"
              value={role}
              onChange={(e) => setRole(e.target.value as SignupRole)}
            >
              <option value="USER">User</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </div>
          <div className="login-row">
            <label className="login-label" htmlFor="signup-name">
              Name
            </label>
            <input
              id="signup-name"
              className="login-input"
              type="text"
              name="name"
              autoComplete="name"
              placeholder={role === 'VENDOR' ? 'Vendor' : 'Your name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="login-row">
            <label className="login-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className="login-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={role === 'VENDOR' ? 'Vendor' : 'you@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-row">
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
          {role === 'VENDOR' ? (
            <>
              <div className="login-row">
                <label className="login-label" htmlFor="signup-business">
                  Business
                </label>
                <input
                  id="signup-business"
                  className="login-input"
                  type="text"
                  name="businessName"
                  autoComplete="organization"
                  placeholder="Business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="login-row">
                <label className="login-label" htmlFor="signup-category">
                  Category
                </label>
                <select
                  id="signup-category"
                  className="login-input login-select"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as VendorCategory)
                  }
                >
                  {VENDOR_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
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
