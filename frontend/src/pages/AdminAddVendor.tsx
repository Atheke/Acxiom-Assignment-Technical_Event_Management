import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type VendorCategory,
  VENDOR_CATEGORY_OPTIONS,
  createVendorAsAdmin,
  logoutRequest,
} from '../services/api'
import './AdminHome.css'
import './Login.css'

export default function AdminAddVendor() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState<VendorCategory>('CATERING')
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
      await createVendorAsAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim(),
        category,
      })
      setSuccess('Vendor account created. They can sign in with the email and password you set.')
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
            onClick={() => navigate('/admin/vendors')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">Vendor Management — Add</p>
        <p className="admin-form-hint">
          Create a vendor user with an approved vendor profile.
        </p>
        {success ? (
          <p className="login-notice" role="status">
            {success}
          </p>
        ) : null}
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="admin-vendor-name">
              Name
            </label>
            <input
              id="admin-vendor-name"
              className="login-input"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="admin-vendor-email">
              Email
            </label>
            <input
              id="admin-vendor-email"
              className="login-input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="admin-vendor-password">
              Password
            </label>
            <input
              id="admin-vendor-password"
              className="login-input"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="admin-vendor-business">
              Business name
            </label>
            <input
              id="admin-vendor-business"
              className="login-input"
              type="text"
              name="businessName"
              autoComplete="organization"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="admin-vendor-category">
              Category
            </label>
            <select
              id="admin-vendor-category"
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
              {submitting ? 'Creating…' : 'Create vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
