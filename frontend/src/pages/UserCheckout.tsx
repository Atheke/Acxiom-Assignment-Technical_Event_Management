import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type PaymentMethod,
  placeOrder,
} from '../services/api'
import { useCart } from '../hooks/useCart'
import './UserCheckout.css'

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

const defaultForm = {
  customerName: '',
  email: '',
  address: '',
  city: '',
  phone: '',
  paymentMethod: 'CASH' as PaymentMethod,
  state: '',
  pinCode: '',
}

export default function UserCheckout() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** When true, cart was cleared after placing an order — do not redirect to /user/cart. */
  const skipEmptyCartRedirectRef = useRef(false)

  useEffect(() => {
    if (items.length > 0) {
      skipEmptyCartRedirectRef.current = false
    }
  }, [items.length])

  useEffect(() => {
    if (items.length === 0 && !skipEmptyCartRedirectRef.current) {
      navigate('/user/cart', { replace: true })
    }
  }, [items.length, navigate])

  if (items.length === 0) {
    return null
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await placeOrder({
        paymentMethod: form.paymentMethod,
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
        lines: items.map((l) => ({
          vendorId: l.vendorId,
          productId: l.productId,
          quantity: l.quantity,
        })),
      })
      const paymentMethodLabel =
        form.paymentMethod === 'CASH' ? 'Cash' : 'UPI'
      skipEmptyCartRedirectRef.current = true
      navigate('/user/order-status', {
        replace: true,
        state: {
          orderConfirmation: {
            orderId: result.orderId,
            grandTotal: result.grandTotal,
            customerName: form.customerName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pinCode: form.pinCode.trim(),
            paymentMethodLabel,
          },
        },
      })
      clear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="user-co-page">
      <section className="user-co-summary" aria-label="Order summary">
        <h2 className="user-co-summary-title">Item</h2>
        <ul className="user-co-summary-lines">
          {items.map((l) => (
            <li key={`${l.vendorId}-${l.productId}`}>
              {l.name} × {l.quantity} — {formatRs(l.price * l.quantity)}
            </li>
          ))}
        </ul>
        <p className="user-co-grand">Grand Total {formatRs(subtotal)}</p>
      </section>

      <p className="user-co-details-label">Details</p>

      <form className="user-co-form" onSubmit={onSubmit} noValidate>
        <div className="user-co-field">
          <label htmlFor="co-name">Name</label>
          <input
            id="co-name"
            name="customerName"
            autoComplete="name"
            required
            value={form.customerName}
            onChange={(e) => update('customerName', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-phone">Number</label>
          <input
            id="co-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-email">E-mail</label>
          <input
            id="co-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-pay">Payment Method</label>
          <select
            id="co-pay"
            name="paymentMethod"
            required
            value={form.paymentMethod}
            onChange={(e) =>
              update('paymentMethod', e.target.value as PaymentMethod)
            }
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div className="user-co-field">
          <label htmlFor="co-address">Address</label>
          <input
            id="co-address"
            name="address"
            autoComplete="street-address"
            required
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-state">State</label>
          <input
            id="co-state"
            name="state"
            autoComplete="address-level1"
            required
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-city">City</label>
          <input
            id="co-city"
            name="city"
            autoComplete="address-level2"
            required
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </div>
        <div className="user-co-field">
          <label htmlFor="co-pin">Pin Code</label>
          <input
            id="co-pin"
            name="pinCode"
            autoComplete="postal-code"
            required
            value={form.pinCode}
            onChange={(e) => update('pinCode', e.target.value)}
          />
        </div>

        {error ? (
          <p className="user-co-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="user-co-actions">
          <button
            type="submit"
            className="user-co-order-btn"
            disabled={submitting}
          >
            {submitting ? 'Placing order…' : 'Order Now'}
          </button>
        </div>
      </form>

      <p className="user-co-back">
        <Link to="/user/cart">← Back to cart</Link>
      </p>
    </div>
  )
}
