import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  type VendorOrderStatusValue,
  fetchVendorOrder,
  logoutRequest,
  updateVendorOrderStatus,
} from '../api'
import './VendorOrderUpdateStatus.css'

const STATUS_OPTIONS: { value: VendorOrderStatusValue; label: string }[] = [
  { value: 'Recieved', label: 'Recieved' },
  { value: 'Ready for Shipping', label: 'Ready for Shipping' },
  { value: 'Out For Delivery', label: 'Out For Delivery' },
]

function isVendorStatus(s: string): s is VendorOrderStatusValue {
  return STATUS_OPTIONS.some((o) => o.value === s)
}

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

export default function VendorOrderUpdateStatus() {
  const navigate = useNavigate()
  const { orderId: orderIdParam } = useParams<{ orderId: string }>()
  const orderId = Number.parseInt(orderIdParam ?? '', 10)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderTotal, setOrderTotal] = useState<number | null>(null)
  const [selected, setSelected] = useState<VendorOrderStatusValue | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      setLoading(false)
      setError('Invalid order')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const o = await fetchVendorOrder(orderId)
        if (cancelled) return
        setOrderTotal(o.totalAmount)
        setError(null)
        if (isVendorStatus(o.status)) {
          setSelected(o.status)
        } else {
          setSelected('')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load order')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [orderId])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!Number.isFinite(orderId) || !selected) return
    setError(null)
    setSaving(true)
    try {
      await updateVendorOrderStatus(orderId, selected)
      navigate('/vendor/transactions/records', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const invalidId = !Number.isFinite(orderId)

  return (
    <div className="vendor-ous-page">
      <header className="vendor-ous-header">
        <Link className="vendor-ous-header-btn" to="/vendor">
          Home
        </Link>
        <button
          type="button"
          className="vendor-ous-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <Link className="vendor-ous-back" to="/vendor/transactions/records">
        ← Orders list
      </Link>

      <div className="vendor-ous-main">
        {error ? (
          <p className="vendor-ous-error" role="alert">
            {error}
          </p>
        ) : null}
        {loading ? <p className="vendor-ous-loading">Loading…</p> : null}
        {!loading && !invalidId && !error ? (
          <form onSubmit={onSubmit}>
            <div className="vendor-ous-card">
              <h1 className="vendor-ous-card-title">Update</h1>
              {orderTotal != null ? (
                <p className="vendor-ous-meta">
                  Order #{orderId} · {formatRs(orderTotal)}
                </p>
              ) : null}
              <div className="vendor-ous-options" role="radiogroup" aria-label="Order status">
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="vendor-ous-option">
                    <input
                      type="radio"
                      name="order-status"
                      value={opt.value}
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                    />
                    <span className="vendor-ous-option-label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="vendor-ous-submit-wrap">
              <button
                type="submit"
                className="vendor-ous-submit"
                disabled={saving || !selected}
              >
                {saving ? 'Updating…' : 'Update'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  )
}
