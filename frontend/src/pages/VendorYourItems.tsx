import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type VendorProduct,
  deleteVendorProduct,
  fetchVendorProducts,
  logoutRequest,
} from '../api'
import './VendorYourItems.css'

export default function VendorYourItems() {
  const navigate = useNavigate()
  const [items, setItems] = useState<VendorProduct[] | null>(null)
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

  function formatRs(n: number) {
    return `Rs ${n.toFixed(2)}`
  }

  return (
    <div className="vendor-yours-page">
      <header className="vendor-yours-header">
        <Link className="vendor-yours-header-btn" to="/vendor">
          Home
        </Link>
        <h1 className="vendor-yours-title">Your Item</h1>
        <button
          type="button"
          className="vendor-yours-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="vendor-yours-toolbar">
        <Link className="vendor-yours-insert" to="/vendor/add-item">
          Insert
        </Link>
      </div>

      <div className="vendor-yours-panel">
        {error ? (
          <p className="vendor-yours-error" role="alert">
            {error}
          </p>
        ) : null}
        {items === null && !error ? (
          <p className="vendor-yours-loading">Loading…</p>
        ) : null}
        {items && items.length === 0 && !error ? (
          <p className="vendor-yours-empty">
            No items yet. Use <strong>Insert</strong> to add a product.
          </p>
        ) : null}
        {items && items.length > 0 ? (
          <div className="vendor-yours-table-wrap">
            <table className="vendor-yours-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.imageUrl ? (
                        <img
                          className="vendor-yours-thumb"
                          src={p.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="vendor-yours-thumb-ph">No image</div>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{formatRs(p.price)}</td>
                    <td>
                      <button
                        type="button"
                        className="vendor-yours-delete"
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
