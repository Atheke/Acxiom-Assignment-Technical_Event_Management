import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type EndUserDirectoryRow,
  fetchEndUsers,
  logoutRequest,
} from '../services/api'
import './AdminHome.css'
import './AdminMaintenance.css'
import './PendingApprovals.css'

export default function AdminUserManagementUpdate() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<EndUserDirectoryRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchEndUsers()
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
            onClick={() => navigate('/admin/users')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">User Management — Update</p>
        <p className="admin-maint-muted">All user accounts (role: User).</p>
        {error ? (
          <p className="pending-error" role="alert">
            {error}
          </p>
        ) : null}
        {rows === null && !error ? (
          <p className="pending-empty">Loading…</p>
        ) : null}
        {rows && rows.length === 0 && !error ? (
          <p className="pending-empty">No users yet.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="admin-maint-wide-table-wrap">
            <table className="admin-maint-wide-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
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
