import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PendingVendorApprovalsSection from '../components/PendingVendorApprovalsSection'
import {
  type VendorMembershipSubscription,
  fetchVendorMembershipSubscriptions,
  logoutRequest,
} from '../services/api'
import './AdminHome.css'
import './AdminMaintenance.css'
import './PendingApprovals.css'

type Props = { homeTo?: string }

export default function AdminVendorMembershipUpdate({
  homeTo = '/admin/vendors',
}: Props) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<VendorMembershipSubscription[] | null>(null)
  const [subError, setSubError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchVendorMembershipSubscriptions()
        if (!cancelled) setRows(items)
      } catch (e) {
        if (!cancelled) {
          setSubError(e instanceof Error ? e.message : 'Failed to load')
          setRows([])
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

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-maint-wrap">
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
        <p className="admin-dashboard-welcome">Membership — Update</p>

        <h2 className="admin-maint-h2">Pending vendor approvals</h2>
        <p className="pending-subtitle">
          New vendor registrations awaiting your decision.
        </p>
        <PendingVendorApprovalsSection />

        <h2 className="admin-maint-h2">Vendor memberships</h2>
        <p className="admin-maint-muted">
          All subscription records with plan details and status.
        </p>
        {subError ? <p className="pending-error">{subError}</p> : null}
        {rows === null && !subError ? (
          <p className="pending-empty">Loading subscriptions…</p>
        ) : null}
        {rows && rows.length === 0 && !subError ? (
          <p className="pending-empty">No vendor memberships recorded yet.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="admin-maint-wide-table-wrap">
            <table className="admin-maint-wide-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Email</th>
                  <th>Business</th>
                  <th>Vendor status</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Features</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Sub. status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.vendorName}</td>
                    <td>{r.vendorEmail}</td>
                    <td>{r.businessName}</td>
                    <td>{r.vendorApprovalStatus}</td>
                    <td>{r.planName}</td>
                    <td>${r.planPrice.toFixed(2)}</td>
                    <td>{r.planDurationDays} d</td>
                    <td>{r.planFeatures ?? '—'}</td>
                    <td>{formatDate(r.startDate)}</td>
                    <td>{formatDate(r.endDate)}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
