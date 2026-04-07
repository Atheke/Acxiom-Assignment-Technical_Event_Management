import { Fragment, useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import {
  fetchUserOrders,
  logoutRequest,
  type UserOrderLine,
  type UserOrderRow,
} from '../api'
import type { OrderConfirmationState } from '../orderConfirmationState'
import './UserOrderSuccess.css'
import './UserOrderStatus.css'

type LocationState = {
  orderConfirmation?: OrderConfirmationState
}

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

function formatLineSummary(lines: UserOrderLine[]) {
  if (lines.length === 0) return 'No line items'
  return lines
    .map(
      (l) =>
        `${l.productName} × ${l.quantity} @ ${formatRs(l.unitPrice)} · ${l.vendorName} · line ${formatRs(l.lineTotal)}`,
    )
    .join(' · ')
}

function formatPlacedAt(iso: string | null) {
  if (iso == null || iso === '') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatOrderStatus(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    Recieved: 'Recieved',
    'Ready for Shipping': 'Ready for Shipping',
    'Out For Delivery': 'Out For Delivery',
    RECEIVED: 'Recieved',
    READY_FOR_SHIPPING: 'Ready for Shipping',
    OUT_FOR_DELIVERY: 'Out For Delivery',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  }
  const t = status.trim()
  if (map[t] != null) return map[t]
  const key = t.toUpperCase().replace(/\s+/g, '_')
  return map[key] ?? status
}

function OrderSuccessModal({
  confirmation,
  onContinue,
}: {
  confirmation: OrderConfirmationState
  onContinue: () => void
}) {
  const c = confirmation
  return (
    <div className="order-success-overlay">
      <div
        className="order-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-thanks"
      >
        <p className="order-success-popup-label">PopUp</p>
        <h2 id="order-success-thanks" className="order-success-thanks">
          THANK YOU
        </h2>
        <div className="order-success-total-box">
          <span>Total Amount</span>
          {formatRs(c.grandTotal)}
        </div>
        <div className="order-success-grid">
          <div className="order-success-cell">
            <span className="order-success-cell-label">Name</span>
            <span className="order-success-cell-value">{c.customerName}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">Number</span>
            <span className="order-success-cell-value">{c.phone}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">E-mail</span>
            <span className="order-success-cell-value">{c.email}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">Payment Method</span>
            <span className="order-success-cell-value">
              {c.paymentMethodLabel}
            </span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">Address</span>
            <span className="order-success-cell-value">{c.address}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">State</span>
            <span className="order-success-cell-value">{c.state}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">City</span>
            <span className="order-success-cell-value">{c.city}</span>
          </div>
          <div className="order-success-cell">
            <span className="order-success-cell-label">Pin Code</span>
            <span className="order-success-cell-value">{c.pinCode}</span>
          </div>
        </div>
        <button
          type="button"
          className="order-success-continue"
          onClick={onContinue}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default function UserOrderStatus() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search] = useSearchParams()
  const placed = search.get('placed') === '1'

  const confirmation = (location.state as LocationState | null)
    ?.orderConfirmation

  const [orders, setOrders] = useState<UserOrderRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (confirmation) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchUserOrders()
        if (!cancelled) {
          setOrders(rows)
          setLoadError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load orders')
          setOrders([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [confirmation])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  if (confirmation) {
    return (
      <OrderSuccessModal
        confirmation={confirmation}
        onContinue={() => {
          navigate('/user', { replace: true, state: {} })
        }}
      />
    )
  }

  return (
    <div className="user-order-status-page">
      <header className="user-order-status-header">
        <Link className="user-order-status-header-btn" to="/user">
          Home
        </Link>
        <h1 className="user-order-status-title">User Order Status</h1>
        <button
          type="button"
          className="user-order-status-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      {placed ? (
        <p className="user-order-status-placed-note">
          Thank you. Your order was placed successfully.
        </p>
      ) : null}

      <div className="user-order-status-panel">
        {loadError ? (
          <p className="user-order-status-error" role="alert">
            {loadError}
          </p>
        ) : null}
        {orders === null && !loadError ? (
          <p className="user-order-status-loading">Loading…</p>
        ) : null}
        {orders !== null && orders.length === 0 && !loadError ? (
          <p className="user-order-status-empty">
            No orders yet. When you place an order, it will appear here with
            totals, status, and line items from your orders.
          </p>
        ) : null}
        {orders !== null && orders.length > 0 ? (
          <div className="user-order-status-table-wrap">
            <table className="user-order-status-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr>
                      <td>
                        <span className="user-order-status-value">
                          #{o.id}
                        </span>
                      </td>
                      <td>
                        <span className="user-order-status-value">
                          {formatRs(o.totalAmount)}
                        </span>
                      </td>
                      <td>
                        <span className="user-order-status-value">
                          {formatPlacedAt(o.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className="user-order-status-value">
                          {formatOrderStatus(o.status)}
                        </span>
                      </td>
                    </tr>
                    <tr className="user-order-status-lines-row">
                      <td colSpan={4}>
                        <div className="user-order-status-lines">
                          <span className="user-order-status-lines-label">
                            Order #{o.id} · Items (
                            {formatRs(o.totalAmount)} total)
                          </span>
                          <p className="user-order-status-lines-text">
                            {formatLineSummary(o.lines)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
