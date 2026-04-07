import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  type PublicVendorProduct,
  fetchUserVendorById,
  fetchVendorProductsForUser,
  logoutRequest,
} from '../api'
import { useCart } from '../hooks/useCart'
import './UserVendorShop.css'

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

export default function UserVendorShop() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { vendorId: vendorIdParam } = useParams<{ vendorId: string }>()
  const vendorId = Number.parseInt(vendorIdParam ?? '', 10)

  const [businessName, setBusinessName] = useState<string>('')
  const [products, setProducts] = useState<PublicVendorProduct[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<number | null>(null)

  useEffect(() => {
    if (!Number.isFinite(vendorId)) {
      setError('Invalid vendor')
      setProducts([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [v, items] = await Promise.all([
          fetchUserVendorById(vendorId),
          fetchVendorProductsForUser(vendorId),
        ])
        if (cancelled) return
        setBusinessName(v.businessName)
        setProducts(items)
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
          setProducts([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [vendorId])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  function handleAdd(p: PublicVendorProduct) {
    if (!Number.isFinite(vendorId)) return
    addItem({
      vendorId,
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    })
    setJustAdded(p.id)
    window.setTimeout(() => {
      setJustAdded((id) => (id === p.id ? null : id))
    }, 2000)
  }

  return (
    <div className="user-shop-page">
      <header className="user-shop-header">
        <Link className="user-shop-header-btn" to="/user">
          Home
        </Link>
        <div className="user-shop-title-block">
          <h1 className="user-shop-title">Shop Item</h1>
          {businessName ? (
            <p className="user-shop-sub">{businessName}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="user-shop-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="user-shop-panel">
        {error ? (
          <p className="user-shop-error" role="alert">
            {error}
          </p>
        ) : null}
        {products === null && !error ? (
          <p className="user-shop-loading">Loading…</p>
        ) : null}
        {products && products.length === 0 && !error ? (
          <p className="user-shop-empty">
            This vendor has not listed any products yet.
          </p>
        ) : null}
        {products && products.length > 0 ? (
          <div className="user-shop-grid">
            {products.map((p) => (
              <article key={p.id} className="user-shop-card">
                <div className="user-shop-card-img-wrap">
                  {p.imageUrl ? (
                    <img
                      className="user-shop-card-img"
                      src={p.imageUrl}
                      alt=""
                    />
                  ) : (
                    <span className="user-shop-card-img-ph">No image</span>
                  )}
                </div>
                <div className="user-shop-card-body">
                  <h2 className="user-shop-card-name">{p.name}</h2>
                  <p className="user-shop-card-price">{formatRs(p.price)}</p>
                  <button
                    type="button"
                    className="user-shop-card-add"
                    onClick={() => handleAdd(p)}
                  >
                    {justAdded === p.id ? 'Added' : 'Add'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
