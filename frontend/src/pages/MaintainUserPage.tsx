import { Link, useNavigate } from 'react-router-dom'
import { logoutRequest } from '../api'
import './AdminHome.css'
import './MaintainUser.css'

export default function MaintainUserPage() {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-dashboard-page">
      <div className="maintain-user-panel">
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

        <div className="maintain-user-rows">
          <div className="maintain-user-row">
            <div className="maintain-user-label" role="presentation">
              Membership
            </div>
            <div className="maintain-user-actions">
              <Link
                className="maintain-user-action"
                to="/admin/users/membership/add"
              >
                Add
              </Link>
              <Link
                className="maintain-user-action"
                to="/admin/users/membership/update"
              >
                Update
              </Link>
            </div>
          </div>

          <div className="maintain-user-row">
            <div className="maintain-user-label" role="presentation">
              User Management
            </div>
            <div className="maintain-user-actions">
              <Link
                className="maintain-user-action"
                to="/admin/users/management/add"
              >
                Add
              </Link>
              <Link
                className="maintain-user-action"
                to="/admin/users/management/update"
              >
                Update
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
