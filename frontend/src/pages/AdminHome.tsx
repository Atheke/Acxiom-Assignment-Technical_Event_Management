import { Link, useNavigate } from 'react-router-dom'
import { logoutRequest } from '../api'
import './AdminHome.css'

export default function AdminHome() {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-panel">
        <div className="admin-dashboard-top">
          <button
            type="button"
            className="admin-dash-nav"
            onClick={() => navigate('/admin')}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">Welcome Admin</p>
        <div className="admin-dashboard-actions">
          <Link className="admin-dash-action" to="/admin/users">
            Maintain User
          </Link>
          <Link className="admin-dash-action" to="/admin/vendors">
            Maintain Vendor
          </Link>
        </div>
      </div>
    </div>
  )
}
