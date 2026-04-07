import { Link, useNavigate } from 'react-router-dom'
import { logoutRequest } from '../api'
import './UserPlaceholderPage.css'

type Props = {
  title: string
  /** Short description under the title (optional). */
  description?: string
}

export default function UserPlaceholderPage({ title, description }: Props) {
  const navigate = useNavigate()

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-section-page">
      <header className="user-section-header">
        <Link className="user-section-header-btn" to="/user">
          Home
        </Link>
        <h1 className="user-section-title">{title}</h1>
        <button
          type="button"
          className="user-section-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>
      <div className="user-section-panel">
        {description ? (
          <p className="user-section-desc">{description}</p>
        ) : (
          <p className="user-section-desc">
            This section will be implemented next.
          </p>
        )}
      </div>
    </div>
  )
}
