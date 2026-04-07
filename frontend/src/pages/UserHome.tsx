import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VENDOR_CATEGORY_OPTIONS, meRequest, logoutRequest } from '../api'
import { useCart } from '../hooks/useCart'
import './UserHome.css'

const CATEGORY_SLUG: Record<string, string> = {
  CATERING: 'catering',
  FLORIST: 'florist',
  DECORATION: 'decoration',
  LIGHTING: 'lighting',
}

export default function UserHome() {
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const [welcomeLabel, setWelcomeLabel] = useState<string>('USER')
  const [vendorMenuOpen, setVendorMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { user } = await meRequest()
        if (cancelled) return
        const name = user.name?.trim()
        setWelcomeLabel(name && name.length > 0 ? name.toUpperCase() : 'USER')
      } catch {
        if (!cancelled) setWelcomeLabel('USER')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!vendorMenuOpen) return
    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVendorMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [vendorMenuOpen])

  async function onLogout() {
    await logoutRequest()
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-inner">
        <header className="user-dashboard-welcome">
          WELCOME {welcomeLabel}
        </header>

        <div className="user-dashboard-body">
          <div className="user-dashboard-toolbar" ref={menuRef}>
            {vendorMenuOpen ? (
              <nav className="user-dashboard-dropdown" aria-label="Vendor categories">
                <p className="user-dashboard-dropdown-title">Categories</p>
                <ul className="user-dashboard-dropdown-list">
                  {VENDOR_CATEGORY_OPTIONS.map(({ value, label }) => (
                    <li key={value}>
                      <Link
                        to={`/user/vendors/${CATEGORY_SLUG[value]}`}
                        onClick={() => setVendorMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <div className="user-dashboard-row">
              <button
                type="button"
                className={`user-dashboard-btn${vendorMenuOpen ? ' user-dashboard-btn--active' : ''}`}
                aria-expanded={vendorMenuOpen}
                aria-haspopup="true"
                onClick={() => setVendorMenuOpen((o) => !o)}
              >
                Vendor
              </button>
              <Link className="user-dashboard-btn" to="/user/cart">
                Cart{itemCount > 0 ? ` (${itemCount})` : ''}
              </Link>
              <Link className="user-dashboard-btn" to="/user/guest-list">
                Guest List
              </Link>
              <Link className="user-dashboard-btn" to="/user/order-status">
                Order Status
              </Link>
            </div>
          </div>

          <div className="user-dashboard-logout-row">
            <button
              type="button"
              className="user-dashboard-logout"
              onClick={onLogout}
            >
              LogOut
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
