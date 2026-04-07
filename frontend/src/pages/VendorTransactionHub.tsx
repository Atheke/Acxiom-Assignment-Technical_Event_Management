import { Link, useNavigate } from 'react-router-dom'
import { logoutRequest } from '../services/api'
import './VendorTransactionHub.css'

export default function VendorTransactionHub() {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="vendor-tx-hub-page">
      <header className="vendor-tx-hub-header">
        <Link className="vendor-tx-hub-header-btn" to="/vendor">
          Home
        </Link>
        <h1 className="vendor-tx-hub-title">Transaction</h1>
        <button
          type="button"
          className="vendor-tx-hub-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="vendor-tx-hub-body">
        <hr className="vendor-tx-hub-line" aria-hidden />
        <nav className="vendor-tx-hub-stack" aria-label="Transaction sections">
          <Link className="vendor-tx-hub-card" to="/vendor/transactions/records">
            Transaction
          </Link>
          <Link
            className="vendor-tx-hub-card"
            to="/vendor/transactions/user-requests"
          >
            User Request
          </Link>
        </nav>
      </div>
    </div>
  )
}
