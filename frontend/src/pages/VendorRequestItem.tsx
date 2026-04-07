import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type VendorProduct, fetchVendorProducts, logoutRequest } from '../api'
import './VendorRequestItem.css'

export default function VendorRequestItem() {
  const navigate = useNavigate()
  const [items, setItems] = useState<VendorProduct[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchVendorProducts()
        if (!cancelled) setItems(rows)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
          setItems([])
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

  function formatRs(n: number) {
    return `Rs ${n.toFixed(2)}`
  }

  return (
    <div className="vendor-request-page">
      <header className="vendor-request-header">
        <button
          type="button"
          className="vendor-request-header-btn"
          onClick={() => navigate('/vendor')}
        >
          Home
        </button>
        <h1 className="vendor-request-title">Request Item</h1>
        <button
          type="button"
          className="vendor-request-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="vendor-request-grid">
        {error ? (
          <p className="vendor-request-empty" role="alert">
            {error}
          </p>
        ) : null}
        {items === null && !error ? (
          <p className="vendor-request-loading">Loading…</p>
        ) : null}
        {items && items.length === 0 && !error ? (
          <p className="vendor-request-empty">
            No products yet. Add items from{' '}
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#1a4a7a',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                font: 'inherit',
              }}
              onClick={() => navigate('/vendor/add-item')}
            >
              Add Item
            </button>
            .
          </p>
        ) : null}
        {items && items.length > 0
          ? items.map((p) => (
              <article key={p.id} className="vendor-request-card">
                <div className="vendor-request-card-img-wrap">
                  {p.imageUrl ? (
                    <img
                      className="vendor-request-card-img"
                      src={p.imageUrl}
                      alt=""
                    />
                  ) : (
                    <span className="vendor-request-card-placeholder">
                      No image
                    </span>
                  )}
                </div>
                <div className="vendor-request-card-body">
                  <p className="vendor-request-card-name">{p.name}</p>
                  <p className="vendor-request-card-price">
                    {formatRs(p.price)}
                  </p>
                </div>
              </article>
            ))
          : null}
      </div>
    </div>
  )
}
