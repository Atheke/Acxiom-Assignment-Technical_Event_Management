import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type AdminVendorDirectoryRow,
  fetchAllVendorsAdmin,
  logoutRequest,
} from '../services/api'
import './AdminHome.css'
import './AdminMaintenance.css'
import './PendingApprovals.css'

export default function AdminVendorManagementUpdate() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminVendorDirectoryRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchAllVendorsAdmin()
        if (!cancelled) setRows(items)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
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
            onClick={() => navigate('/admin/vendors')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">Vendor Management — Update</p>
        <p className="admin-maint-muted">
          All vendor accounts and approval status.
        </p>
        {error ? <p className="pending-error">{error}</p> : null}
        {rows === null && !error ? <p className="pending-empty">Loading…</p> : null}
        {rows && rows.length === 0 && !error ? (
          <p className="pending-empty">No vendors yet.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="admin-maint-wide-table-wrap">
            <table className="admin-maint-wide-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Approval</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.vendorId}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.businessName}</td>
                    <td>{r.category}</td>
                    <td>{r.approvalStatus}</td>
                    <td>{formatDate(r.createdAt)}</td>
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
