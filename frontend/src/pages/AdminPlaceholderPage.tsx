import { useNavigate } from 'react-router-dom'
import { logoutRequest } from '../services/api'
import './AdminHome.css'

type Props = {
  title: string
  homeTo?: string
}

export default function AdminPlaceholderPage({
  title,
  homeTo = '/admin',
}: Props) {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-panel admin-dashboard-panel--placeholder">
        <div className="admin-dashboard-top">
          <button
            type="button"
            className="admin-dash-nav"
            onClick={() => navigate(homeTo)}
          >
            Home
          </button>
          <button type="button" className="admin-dash-nav" onClick={onLogout}>
            LogOut
          </button>
        </div>
        <p className="admin-dashboard-welcome">{title}</p>
      </div>
    </div>
  )
}
