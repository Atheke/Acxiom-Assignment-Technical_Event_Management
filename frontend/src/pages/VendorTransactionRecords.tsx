import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type VendorOrderSummary,
  fetchVendorOrders,
  logoutRequest,
} from '../api'
import './VendorTransactionRecords.css'

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

function formatDate(iso: string | null) {
  if (iso == null || iso === '') return '—'
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

function formatOrderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    Recieved: 'Recieved',
    'Ready for Shipping': 'Ready for Shipping',
    'Out For Delivery': 'Out For Delivery',
    RECEIVED: 'Recieved',
    READY_FOR_SHIPPING: 'Ready for Shipping',
    OUT_FOR_DELIVERY: 'Out For Delivery',
  }
  const t = status.trim()
  if (map[t] != null) return map[t]
  const key = t.toUpperCase().replace(/\s+/g, '_')
  return map[key] ?? status
}

export default function VendorTransactionRecords() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<VendorOrderSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchVendorOrders()
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
    <div className="vendor-tx-rec-page">
      <header className="vendor-tx-rec-header">
        <Link className="vendor-tx-rec-header-btn" to="/vendor">
          Home
        </Link>
        <h1 className="vendor-tx-rec-title">Transaction</h1>
        <button
          type="button"
          className="vendor-tx-rec-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <Link className="vendor-tx-rec-back" to="/vendor/transactions">
        ← Transaction menu
      </Link>

      <div className="vendor-tx-rec-panel">
        {error ? (
          <p className="vendor-tx-rec-error" role="alert">
            {error}
          </p>
        ) : null}
        {rows === null && !error ? (
          <p className="vendor-tx-rec-loading">Loading…</p>
        ) : null}
        {rows && rows.length === 0 && !error ? (
          <p className="vendor-tx-rec-empty">
            No orders yet. When a customer orders your products, orders will
            appear here.
          </p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="vendor-tx-rec-table-wrap">
            <table className="vendor-tx-rec-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{formatRs(o.totalAmount)}</td>
                    <td>{formatOrderStatusLabel(o.status)}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      <Link
                        className="vendor-tx-rec-action"
                        to={`/vendor/transactions/orders/${o.id}/update-status`}
                      >
                        Update status
                      </Link>
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
