import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { meRequest, logoutRequest } from '../api'
import './VendorHome.css'

export default function VendorHome() {
  const navigate = useNavigate()
  const [welcomeName, setWelcomeName] = useState<string | null>(null)

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

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-panel">
        <header className="vendor-dashboard-header">
          <p className="vendor-dashboard-welcome-line">Welcome</p>
          <p className="vendor-dashboard-welcome-line">
            {welcomeName ?? '…'}
          </p>
        </header>
        <div className="vendor-dashboard-actions">
          <Link className="vendor-dash-btn" to="/vendor/your-items">
            Your Item
          </Link>
          <Link className="vendor-dash-btn" to="/vendor/add-item">
            Add New Item
          </Link>
          <Link className="vendor-dash-btn" to="/vendor/transactions">
            Transaction
          </Link>
          <button type="button" className="vendor-dash-btn" onClick={onLogout}>
            LogOut
          </button>
        </div>
      </div>
    </div>
  )
}
