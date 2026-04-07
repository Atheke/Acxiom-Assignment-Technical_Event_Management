import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type VendorSale, fetchVendorSales, logoutRequest } from '../api'
import './VendorTransactionRecords.css'

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
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

export default function VendorTransactionRecords() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<VendorSale[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchVendorSales()
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
            No transactions yet. Completed sales will appear here.
          </p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="vendor-tx-rec-table-wrap">
            <table className="vendor-tx-rec-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>{s.buyerName}</td>
                    <td>{s.productName ?? '—'}</td>
                    <td>{s.quantity}</td>
                    <td>{formatRs(s.amount)}</td>
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
