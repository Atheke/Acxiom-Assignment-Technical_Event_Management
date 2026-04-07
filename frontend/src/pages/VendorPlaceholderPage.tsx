import { useNavigate } from 'react-router-dom'
import { logoutRequest } from '../services/api'
import './VendorHome.css'

type Props = {
  title: string
}

export default function VendorPlaceholderPage({ title }: Props) {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-panel" style={{ minHeight: 200 }}>
        <div
          className="vendor-dashboard-actions"
          style={{ marginBottom: 8, justifyContent: 'space-between' }}
        >
          <button
            type="button"
            className="vendor-dash-btn"
            style={{ flex: '0 1 auto', minWidth: 100 }}
            onClick={() => navigate('/vendor')}
          >
            Home
          </button>
          <button
            type="button"
            className="vendor-dash-btn"
            style={{ flex: '0 1 auto', minWidth: 100 }}
            onClick={onLogout}
          >
            LogOut
          </button>
        </div>
        <header className="vendor-dashboard-header">
          <p className="vendor-dashboard-welcome-line">{title}</p>
        </header>
        <p style={{ margin: 0, textAlign: 'center', color: '#fff' }}>
          This section will be implemented next.
        </p>
      </div>
    </div>
  )
}
