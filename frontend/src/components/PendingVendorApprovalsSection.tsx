import { useEffect, useState } from 'react'
import {
  type PendingVendor,
  approveVendor,
  fetchPendingVendors,
  rejectVendor,
} from '../services/api'
import '../pages/PendingApprovals.css'

export default function PendingVendorApprovalsSection() {
  const [items, setItems] = useState<PendingVendor[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyVendorId, setBusyVendorId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchPendingVendors()
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

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  async function handleApprove(vendorId: number) {
    setError(null)
    setBusyVendorId(vendorId)
    try {
      await approveVendor(vendorId)
      setItems((prev) => prev?.filter((r) => r.vendorId !== vendorId) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed')
    } finally {
      setBusyVendorId(null)
    }
  }

  async function handleReject(vendorId: number) {
    setError(null)
    setBusyVendorId(vendorId)
    try {
      await rejectVendor(vendorId)
      setItems((prev) => prev?.filter((r) => r.vendorId !== vendorId) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed')
    } finally {
      setBusyVendorId(null)
    }
  }

  return (
    <>
      {error ? <p className="pending-error">{error}</p> : null}
      {items === null && !error ? (
        <p className="pending-empty">Loading…</p>
      ) : null}
      {items && items.length === 0 && !error ? (
        <p className="pending-empty">No vendors pending approval.</p>
      ) : null}
      {items && items.length > 0 ? (
        <div className="pending-table-wrap">
          <table className="pending-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Business</th>
                <th>Category</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.vendorId}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.businessName}</td>
                  <td>{row.category}</td>
                  <td>{formatDate(row.createdAt)}</td>
                  <td>
                    <div className="pending-actions">
                      <button
                        type="button"
                        className="pending-btn pending-btn-approve"
                        disabled={busyVendorId === row.vendorId}
                        onClick={() => handleApprove(row.vendorId)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="pending-btn pending-btn-reject"
                        disabled={busyVendorId === row.vendorId}
                        onClick={() => handleReject(row.vendorId)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  )
}
