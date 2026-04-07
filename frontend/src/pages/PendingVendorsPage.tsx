import { useNavigate } from 'react-router-dom'
import PendingVendorApprovalsSection from '../components/PendingVendorApprovalsSection'
import { logoutRequest } from '../services/api'
import './AdminHome.css'
import './PendingApprovals.css'

export default function PendingVendorsPage() {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-dashboard-page">
      <div className="pending-wrap">
        <div className="admin-dashboard-top">
          <button
            type="button"
            className="admin-dash-nav"
            onClick={() => navigate('/admin/vendors')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <h1 className="pending-title">Pending vendor approvals</h1>
        <p className="pending-subtitle">
          Vendor registrations awaiting approval.
        </p>
        <PendingVendorApprovalsSection />
      </div>
    </div>
  )
}
