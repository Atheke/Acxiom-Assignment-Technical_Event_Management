import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type ApprovedVendorOption,
  type MembershipPlan,
  createMembershipPlan,
  createVendorMembershipAssignment,
  fetchApprovedVendorsForMembership,
  fetchMembershipPlans,
  logoutRequest,
} from '../services/api'
import './AdminHome.css'
import './Login.css'

type Props = { homeTo?: string }

export default function AdminVendorMembershipAdd({
  homeTo = '/admin/vendors',
}: Props) {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [vendors, setVendors] = useState<ApprovedVendorOption[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [planName, setPlanName] = useState('')
  const [planPrice, setPlanPrice] = useState('')
  const [planDuration, setPlanDuration] = useState('')
  const [planFeatures, setPlanFeatures] = useState('')
  const [planError, setPlanError] = useState<string | null>(null)
  const [planSuccess, setPlanSuccess] = useState<string | null>(null)
  const [planSubmitting, setPlanSubmitting] = useState(false)

  const [vendorUserId, setVendorUserId] = useState('')
  const [membershipId, setMembershipId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, v] = await Promise.all([
          fetchMembershipPlans(),
          fetchApprovedVendorsForMembership(),
        ])
        if (!cancelled) {
          setPlans(p)
          setVendors(v)
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load data')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  async function onSubmitPlan(e: FormEvent) {
    e.preventDefault()
    setPlanError(null)
    setPlanSuccess(null)
    const price = Number.parseFloat(planPrice)
    const durationDays = Number.parseInt(planDuration, 10)
    if (!planName.trim() || !Number.isFinite(price) || price < 0) {
      setPlanError('Enter a name and valid price.')
      return
    }
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      setPlanError('Duration must be at least 1 day.')
      return
    }
    setPlanSubmitting(true)
    try {
      await createMembershipPlan({
        name: planName.trim(),
        price,
        durationDays,
        features: planFeatures.trim() || undefined,
      })
      setPlanSuccess('Membership plan created.')
      setPlanName('')
      setPlanPrice('')
      setPlanDuration('')
      setPlanFeatures('')
      const next = await fetchMembershipPlans()
      setPlans(next)
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setPlanSubmitting(false)
    }
  }

  async function onSubmitAssign(e: FormEvent) {
    e.preventDefault()
    setAssignError(null)
    setAssignSuccess(null)
    const vid = Number.parseInt(vendorUserId, 10)
    const mid = Number.parseInt(membershipId, 10)
    if (!Number.isFinite(vid) || !Number.isFinite(mid)) {
      setAssignError('Select a vendor and a membership plan.')
      return
    }
    setAssignSubmitting(true)
    try {
      const { vendorMembership } = await createVendorMembershipAssignment({
        vendorUserId: vid,
        membershipId: mid,
        startDate: startDate.trim() || undefined,
      })
      setAssignSuccess(
        `Subscription active until ${new Date(vendorMembership.endDate).toLocaleString()}.`,
      )
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setAssignSubmitting(false)
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-panel admin-dashboard-panel--form-wide">
        <div className="admin-dashboard-top">
          <button
            type="button"
            className="admin-dash-nav"
            onClick={() => navigate(homeTo)}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">Membership — Add</p>
        {loadError ? (
          <p className="login-error" role="alert">
            {loadError}
          </p>
        ) : null}

        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: '1rem 0 0.5rem',
            color: '#222',
          }}
        >
          1. Create membership plan
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#444' }}>
          Defines a tier (e.g. Gold) in the <code>memberships</code> table.
        </p>
        {planSuccess ? (
          <p className="login-notice" role="status">
            {planSuccess}
          </p>
        ) : null}
        <form className="login-form" onSubmit={onSubmitPlan} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-name">
              Name
            </label>
            <input
              id="mem-name"
              className="login-input"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Gold"
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-price">
              Price
            </label>
            <input
              id="mem-price"
              className="login-input"
              type="number"
              min={0}
              step="0.01"
              value={planPrice}
              onChange={(e) => setPlanPrice(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-duration">
              Duration (days)
            </label>
            <input
              id="mem-duration"
              className="login-input"
              type="number"
              min={1}
              step={1}
              value={planDuration}
              onChange={(e) => setPlanDuration(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-features">
              Features
            </label>
            <textarea
              id="mem-features"
              className="login-input"
              rows={3}
              value={planFeatures}
              onChange={(e) => setPlanFeatures(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          {planError ? (
            <p className="login-error" role="alert">
              {planError}
            </p>
          ) : null}
          <div className="login-actions">
            <button
              className="login-submit"
              type="submit"
              disabled={planSubmitting}
            >
              {planSubmitting ? 'Saving…' : 'Create plan'}
            </button>
          </div>
        </form>

        <h2 className="admin-form-section-title admin-form-section-title--spaced">
          2. Assign membership to vendor
        </h2>
        <p className="admin-form-hint">
          Creates an <code>ACTIVE</code> row in <code>vendor_memberships</code>.
          End date is start + plan duration.
        </p>
        {assignSuccess ? (
          <p className="login-notice" role="status">
            {assignSuccess}
          </p>
        ) : null}
        <form className="login-form" onSubmit={onSubmitAssign} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-vendor">
              Vendor
            </label>
            <select
              id="mem-vendor"
              className="login-input login-select"
              value={vendorUserId}
              onChange={(e) => setVendorUserId(e.target.value)}
              required
            >
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v.vendorUserId} value={v.vendorUserId}>
                  {v.businessName} ({v.email})
                </option>
              ))}
            </select>
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-plan">
              Plan
            </label>
            <select
              id="mem-plan"
              className="login-input login-select"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              required
            >
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.durationDays} days (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div className="login-field">
            <label className="login-label" htmlFor="mem-start">
              Start (optional)
            </label>
            <input
              id="mem-start"
              className="login-input"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          {assignError ? (
            <p className="login-error" role="alert">
              {assignError}
            </p>
          ) : null}
          <div className="login-actions">
            <button
              className="login-submit"
              type="submit"
              disabled={
                assignSubmitting || vendors.length === 0 || plans.length === 0
              }
            >
              {assignSubmitting ? 'Saving…' : 'Assign membership'}
            </button>
          </div>
        </form>
        {vendors.length === 0 && !loadError ? (
          <p className="login-notice login-notice--block">
            No approved vendors yet. Create vendors under Vendor Management → Add
            first.
          </p>
        ) : null}
        {plans.length === 0 && !loadError ? (
          <p className="login-notice login-notice--block">
            Create at least one membership plan above before assigning.
          </p>
        ) : null}
      </div>
    </div>
  )
}
