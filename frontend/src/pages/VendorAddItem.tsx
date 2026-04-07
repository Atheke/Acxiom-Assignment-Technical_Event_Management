import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  type VendorProduct,
  createVendorProduct,
  deleteVendorProduct,
  fetchVendorProducts,
  meRequest,
  updateVendorProduct,
  logoutRequest,
} from '../services/api'
import './VendorAddItem.css'

export default function VendorAddItem() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [welcomeName, setWelcomeName] = useState<string>('')
  const [items, setItems] = useState<VendorProduct[] | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function loadProducts() {
    const rows = await fetchVendorProducts()
    setItems(rows)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user } = await meRequest()
        if (cancelled) return
        const label =
          user.role === 'VENDOR' && user.businessName?.trim()
            ? user.businessName.trim()
            : user.name?.trim() || 'Vendor'
        setWelcomeName(label)
      } catch {
        if (!cancelled) setWelcomeName('Vendor')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadProducts()
      } catch {
        if (!cancelled) {
          setError('Could not load products')
          setItems([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const editParam = searchParams.get('edit')
  useEffect(() => {
    if (items === null || !editParam) return
    const id = Number.parseInt(editParam, 10)
    const clearEditParam = () =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('edit')
          return next
        },
        { replace: true },
      )
    if (!Number.isFinite(id)) {
      clearEditParam()
      return
    }
    const p = items.find((x) => x.id === id)
    clearEditParam()
    if (!p) return
    setEditingId(p.id)
    setName(p.name)
    setPrice(String(p.price))
    setImageUrl(p.imageUrl ?? '')
    setError(null)
  }, [items, editParam, setSearchParams])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  function resetForm() {
    setName('')
    setPrice('')
    setImageUrl('')
    setEditingId(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const priceNum = Number(price)
    if (!name.trim()) {
      setError('Product name is required')
      return
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Valid price is required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        price: priceNum,
        imageUrl: imageUrl.trim(),
      }
      if (editingId != null) {
        await updateVendorProduct(editingId, payload)
      } else {
        await createVendorProduct(payload)
      }
      await loadProducts()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(p: VendorProduct) {
    setEditingId(p.id)
    setName(p.name)
    setPrice(String(p.price))
    setImageUrl(p.imageUrl ?? '')
    setError(null)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return
    setError(null)
    setBusyId(id)
    try {
      await deleteVendorProduct(id)
      await loadProducts()
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  function formatRs(n: number) {
    return `Rs ${n.toFixed(2)}`
  }

  return (
    <div className="vendor-add-page">
      <header className="vendor-add-topbar">
        <p className="vendor-add-welcome">
          Welcome <span>&apos;{welcomeName || '…'}&apos;</span>
        </p>
        <nav className="vendor-add-nav">
          <Link className="vendor-add-nav-btn" to="/vendor/product-status">
            Product Status
          </Link>
          <Link className="vendor-add-nav-btn" to="/vendor/request-item">
            Request Item
          </Link>
          <Link className="vendor-add-nav-btn" to="/vendor/your-items">
            View Product
          </Link>
          <button
            type="button"
            className="vendor-add-nav-btn"
            onClick={onLogout}
          >
            Log Out
          </button>
        </nav>
      </header>

      <div className="vendor-add-main">
        <section className="vendor-add-form-panel">
          <h2 className="vendor-add-form-title">
            {editingId != null ? 'Update product' : 'Add product'}
          </h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="vendor-add-field">
              <label htmlFor="vp-name">Product Name</label>
              <input
                id="vp-name"
                className="vendor-add-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="vendor-add-field">
              <label htmlFor="vp-price">Product Price</label>
              <input
                id="vp-price"
                className="vendor-add-input"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="vendor-add-field">
              <label htmlFor="vp-img">Product Image</label>
              <input
                id="vp-img"
                className="vendor-add-input"
                type="url"
                placeholder="https://…"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            {error ? (
              <p className="vendor-add-msg vendor-add-msg-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="vendor-add-submit"
              disabled={submitting}
            >
              {submitting
                ? 'Saving…'
                : editingId != null
                  ? 'Save changes'
                  : 'Add the Product'}
            </button>
            {editingId != null ? (
              <button
                type="button"
                className="vendor-add-cancel"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            ) : null}
          </form>
        </section>

        <section className="vendor-add-table-panel">
          {items === null ? (
            <p className="vendor-add-empty">Loading products…</p>
          ) : items.length === 0 ? (
            <p className="vendor-add-empty">No products yet.</p>
          ) : (
            <table className="vendor-add-table">
              <thead>
                <tr>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>Product Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.imageUrl ? (
                        <img
                          className="vendor-add-thumb"
                          src={p.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="vendor-add-thumb-placeholder">
                          No image
                        </div>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{formatRs(p.price)}</td>
                    <td>
                      <div className="vendor-add-actions">
                        <button
                          type="button"
                          className="vendor-add-row-btn vendor-add-row-btn-delete"
                          disabled={busyId === p.id}
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="vendor-add-row-btn"
                          disabled={busyId === p.id}
                          onClick={() => startEdit(p)}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
