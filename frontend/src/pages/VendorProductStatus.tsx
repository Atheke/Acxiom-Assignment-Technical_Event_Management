import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type AuthUser,
  type VendorProduct,
  deleteVendorProduct,
  fetchVendorProducts,
  logoutRequest,
  meRequest,
} from '../services/api'
import './VendorProductStatus.css'

export default function VendorProductStatus() {
  const navigate = useNavigate()
  const [items, setItems] = useState<VendorProduct[] | null>(null)
  const [vendorUser, setVendorUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    const rows = await fetchVendorProducts()
    setItems(rows)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user } = await meRequest()
        if (!cancelled) setVendorUser(user)
      } catch {
        if (!cancelled) setVendorUser(null)
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
        await load()
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

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return
    setError(null)
    setBusyId(id)
    try {
      await deleteVendorProduct(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  const vendorEmail = vendorUser?.email ?? '—'

  return (
    <div className="vendor-product-status-page">
      <header className="vendor-product-status-header">
        <Link className="vendor-product-status-header-btn" to="/vendor">
          Home
        </Link>
        <h1 className="vendor-product-status-title">Product Status</h1>
        <button
          type="button"
          className="vendor-product-status-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="vendor-product-status-panel">
        {error ? (
          <p className="vendor-product-status-error" role="alert">
            {error}
          </p>
        ) : null}
        {items === null && !error ? (
          <p className="vendor-product-status-muted">Loading…</p>
        ) : null}
        {items && items.length === 0 && !error ? (
          <p className="vendor-product-status-muted">
            No products yet. Add items from <strong>Add Item</strong> in the
            vendor menu.
          </p>
        ) : null}
        {items && items.length > 0 ? (
          <div className="vendor-product-status-table-wrap">
            <table className="vendor-product-status-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{vendorEmail}</td>
                    <td className="vendor-product-status-na">—</td>
                    <td>
                      <span className="vendor-product-status-badge">Listed</span>
                    </td>
                    <td>
                      <Link
                        className="vendor-product-status-action vendor-product-status-action--update"
                        to={`/vendor/add-item?edit=${p.id}`}
                      >
                        Update
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="vendor-product-status-action vendor-product-status-action--delete"
                        disabled={busyId === p.id}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
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
