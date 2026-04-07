import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  type PublicVendorProduct,
  type VendorCategory,
  VENDOR_CATEGORY_OPTIONS,
  fetchVendorProductsForUser,
  fetchVendorsByCategory,
  logoutRequest,
} from '../services/api'
import { useCart } from '../hooks/useCart'
import './UserVendorCategory.css'

const SLUG_TO_CATEGORY: Record<string, VendorCategory> = {
  catering: 'CATERING',
  florist: 'FLORIST',
  decoration: 'DECORATION',
  lighting: 'LIGHTING',
}

type VendorBlock = {
  vendorId: number
  businessName: string
  products: PublicVendorProduct[]
}

function formatRs(n: number) {
  return `Rs ${n.toFixed(2)}`
}

export default function UserVendorCategory() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { category } = useParams<{ category: string }>()
  const slug = category?.toLowerCase() ?? ''
  const cat = SLUG_TO_CATEGORY[slug]

  const [blocks, setBlocks] = useState<VendorBlock[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<number | null>(null)

  const categoryLabel =
    cat != null
      ? VENDOR_CATEGORY_OPTIONS.find((o) => o.value === cat)?.label ?? cat
      : ''

  useEffect(() => {
    if (!cat) return
    let cancelled = false
    ;(async () => {
      try {
        const vendors = await fetchVendorsByCategory(cat)
        if (cancelled) return
        if (vendors.length === 0) {
          setBlocks([])
          setError(null)
          return
        }
        const withProducts = await Promise.all(
          vendors.map(async (v) => ({
            vendorId: v.vendorId,
            businessName: v.businessName,
            products: await fetchVendorProductsForUser(v.vendorId),
          })),
        )
        if (!cancelled) {
          setBlocks(withProducts)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
          setBlocks([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cat])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  function handleAdd(
    vendorId: number,
    p: PublicVendorProduct,
  ) {
    addItem({
      vendorId,
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    })
    setJustAdded(p.id)
    window.setTimeout(() => setJustAdded((id) => (id === p.id ? null : id)), 2000)
  }

  if (!cat) {
    return <Navigate to="/user" replace />
  }

  return (
    <div className="user-vbrowse-page">
      <div className="user-vbrowse-top">
        <Link className="user-vbrowse-outline-btn" to="/user">
          Home
        </Link>
        <div className="user-vbrowse-category-strip" aria-label="Category">
          <span className="user-vbrowse-category-part">Vendor</span>
          <span className="user-vbrowse-category-part">{categoryLabel}</span>
        </div>
        <button
          type="button"
          className="user-vbrowse-outline-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </div>

      {error ? (
        <p className="user-vbrowse-error" role="alert">
          {error}
        </p>
      ) : null}
      {blocks === null && !error ? (
        <p className="user-vbrowse-loading">Loading…</p>
      ) : null}
      {blocks && blocks.length === 0 && !error ? (
        <p className="user-vbrowse-empty">
          No vendors in this category yet.
        </p>
      ) : null}
      {blocks && blocks.length > 0 ? (
        <div className="user-vbrowse-grid">
          {blocks.map((b) => (
            <article key={b.vendorId} className="user-vbrowse-card">
              {blocks.length > 1 ? (
                <p className="user-vbrowse-vendor-tag">{b.businessName}</p>
              ) : null}
              {b.products.length > 0 ? (
                <div className="user-vbrowse-products">
                  {b.products.map((p) => (
                    <div key={p.id} className="user-vbrowse-product">
                      <div className="user-vbrowse-product-img-wrap">
                        {p.imageUrl ? (
                          <img
                            className="user-vbrowse-product-img"
                            src={p.imageUrl}
                            alt=""
                          />
                        ) : (
                          <span className="user-vbrowse-product-img-ph">
                            No image
                          </span>
                        )}
                      </div>
                      <p className="user-vbrowse-product-name">{p.name}</p>
                      <p className="user-vbrowse-product-price">
                        {formatRs(p.price)}
                      </p>
                      <button
                        type="button"
                        className="user-vbrowse-product-add"
                        onClick={() => handleAdd(b.vendorId, p)}
                      >
                        {justAdded === p.id ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="user-vbrowse-no-products">
                  No products listed yet.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
