import { useNavigate } from 'react-router-dom'
import { logoutRequest } from '../api'

export default function VendorHome() {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <h1 className="app-title">Vendor</h1>
      <p className="app-muted">Signed in as vendor.</p>
      <button type="button" className="app-button" onClick={onLogout}>
        Log out
      </button>
    </div>
  )
}
