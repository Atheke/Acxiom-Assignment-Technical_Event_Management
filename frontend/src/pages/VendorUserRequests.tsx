import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type VendorUserRequestRow,
  fetchVendorUserRequests,
  logoutRequest,
} from '../services/api'
import './VendorUserRequests.css'

function formatRequestStatus(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  }
  return map[s.trim().toUpperCase()] ?? s
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function VendorUserRequests() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<VendorUserRequestRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchVendorUserRequests()
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

  return (
    <div className="vendor-ureq-page">
      <header className="vendor-ureq-header">
        <Link className="vendor-ureq-header-btn" to="/vendor">
          Home
        </Link>
        <h1 className="vendor-ureq-title">User Request</h1>
        <button
          type="button"
          className="vendor-ureq-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <Link className="vendor-ureq-back" to="/vendor/transactions">
        ← Transaction menu
      </Link>

      <div className="vendor-ureq-panel">
        {error ? (
          <p className="vendor-ureq-error" role="alert">
            {error}
          </p>
        ) : null}
        {rows === null && !error ? (
          <p className="vendor-ureq-loading">Loading…</p>
        ) : null}
        {rows && rows.length === 0 && !error ? (
          <p className="vendor-ureq-empty">
            No user requests yet. When customers send you a request message,
            it will appear here.
          </p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="vendor-ureq-table-wrap">
            <table className="vendor-ureq-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>{r.requesterName}</td>
                    <td className="vendor-ureq-msg">{r.message}</td>
                    <td>
                      <span className="vendor-ureq-status">
                        {formatRequestStatus(r.status)}
                      </span>
                    </td>
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
