import { Link, useNavigate } from 'react-router-dom'
import { logoutRequest } from '../api'
import { useCart } from '../hooks/useCart'
import './UserCart.css'

const QTY_OPTIONS = Array.from({ length: 99 }, (_, i) => i + 1)

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

export default function UserCart() {
  const navigate = useNavigate()
  const { items, subtotal, setQuantity, removeItem, clear } = useCart()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  function onDeleteAll() {
    if (items.length === 0) return
    if (!window.confirm('Remove all items from your cart?')) return
    clear()
  }

  function onCheckout() {
    if (items.length === 0) return
    navigate('/user/checkout')
  }

  return (
    <div className="user-cart-page">
      <nav className="user-cart-nav" aria-label="Cart navigation">
        <Link className="user-cart-nav-btn" to="/user">
          Home
        </Link>
        <Link className="user-cart-nav-btn" to="/user">
          View Product
        </Link>
        <Link className="user-cart-nav-btn" to="/user/guest-list">
          Request Item
        </Link>
        <Link className="user-cart-nav-btn" to="/user/order-status">
          Product Status
        </Link>
        <button
          type="button"
          className="user-cart-nav-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </nav>

      <div className="user-cart-banner">
        <h1 className="user-cart-banner-title">Shopping Cart</h1>
      </div>

      <div className="user-cart-body">
        {items.length === 0 ? (
          <>
            <p className="user-cart-empty">Your cart is empty.</p>
            <div className="user-cart-checkout-wrap">
              <button
                type="button"
                className="user-cart-checkout"
                disabled
              >
                Proceed to CheckOut
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="user-cart-table-scroll">
              <table className="user-cart-table">
                <thead>
                  <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total Price</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((line) => (
                    <tr key={`${line.vendorId}-${line.productId}`}>
                      <td className="user-cart-cell-img">
                        <div className="user-cart-thumb-wrap">
                          {line.imageUrl ? (
                            <img
                              className="user-cart-thumb"
                              src={line.imageUrl}
                              alt=""
                            />
                          ) : (
                            <span className="user-cart-thumb-ph">Image</span>
                          )}
                        </div>
                      </td>
                      <td className="user-cart-cell-name">{line.name}</td>
                      <td className="user-cart-cell-price">
                        {formatRs(line.price)}
                      </td>
                      <td className="user-cart-cell-qty">
                        <label className="user-cart-sr-only" htmlFor={`qty-${line.vendorId}-${line.productId}`}>
                          Quantity
                        </label>
                        <select
                          id={`qty-${line.vendorId}-${line.productId}`}
                          className="user-cart-qty-select"
                          aria-label={`Quantity for ${line.name}`}
                          value={String(line.quantity)}
                          onChange={(e) => {
                            const v = Number.parseInt(e.target.value, 10)
                            if (Number.isFinite(v) && v >= 1) {
                              setQuantity(
                                line.vendorId,
                                line.productId,
                                v,
                              )
                            }
                          }}
                        >
                          {QTY_OPTIONS.map((n) => (
                            <option key={n} value={String(n)}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="user-cart-cell-total">
                        {formatRs(line.price * line.quantity)}
                      </td>
                      <td className="user-cart-cell-action">
                        <button
                          type="button"
                          className="user-cart-remove-btn"
                          onClick={() =>
                            removeItem(line.vendorId, line.productId)
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="user-cart-grand-bar">
              <span className="user-cart-grand-label">
                Grand Total {formatRs(subtotal)}
              </span>
              <button
                type="button"
                className="user-cart-delete-all"
                onClick={onDeleteAll}
              >
                Delete All
              </button>
            </div>

            <div className="user-cart-checkout-wrap">
              <button
                type="button"
                className="user-cart-checkout"
                disabled={items.length === 0}
                onClick={onCheckout}
              >
                Proceed to CheckOut
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
