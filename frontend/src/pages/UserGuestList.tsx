import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type UserGuest,
  createUserGuest,
  deleteUserGuest,
  fetchUserGuests,
  logoutRequest,
  updateUserGuest,
} from '../services/api'
import './UserGuestList.css'

const emptyForm = {
  guestName: '',
  contactInfo: '',
}

export default function UserGuestList() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState<UserGuest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    const rows = await fetchUserGuests()
    setGuests(rows)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
          setGuests([])
        }
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

  function openAdd() {
    setError(null)
    setForm(emptyForm)
    setEditingId(null)
    setModalMode('add')
  }

  function openEdit(g: UserGuest) {
    setError(null)
    setEditingId(g.id)
    setForm({
      guestName: g.guestName,
      contactInfo: g.contactInfo ?? '',
    })
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    const guestName = form.guestName.trim()
    if (!guestName) {
      setError('Guest name is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      if (modalMode === 'add') {
        await createUserGuest({
          guestName,
          contactInfo: form.contactInfo.trim() || undefined,
        })
      } else if (modalMode === 'edit' && editingId != null) {
        await updateUserGuest(editingId, {
          guestName,
          contactInfo: form.contactInfo.trim() || undefined,
        })
      }
      await load()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm('Delete this guest?')) return
    setError(null)
    try {
      await deleteUserGuest(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="user-gl-page">
      <header className="user-gl-header">
        <Link className="user-gl-header-btn" to="/user">
          Home
        </Link>
        <h1 className="user-gl-title">Guest List</h1>
        <button
          type="button"
          className="user-gl-header-btn"
          onClick={onLogout}
        >
          LogOut
        </button>
      </header>

      <div className="user-gl-toolbar">
        <button type="button" className="user-gl-add" onClick={openAdd}>
          Add guest
        </button>
      </div>

      <div className="user-gl-panel">
        {error && !modalMode ? (
          <p className="user-gl-error" role="alert">
            {error}
          </p>
        ) : null}
        {guests === null && !error ? (
          <p className="user-gl-loading">Loading…</p>
        ) : null}
        {guests && guests.length === 0 && !error ? (
          <p className="user-gl-empty">
            No guests yet. Use <strong>Add guest</strong> to create one.
          </p>
        ) : null}
        {guests && guests.length > 0 ? (
          <div className="user-gl-table-wrap">
            <table className="user-gl-table">
              <thead>
                <tr>
                  <th>Guest name</th>
                  <th>Contact info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id}>
                    <td>{g.guestName}</td>
                    <td
                      className={
                        !g.contactInfo ? 'user-gl-cell-muted' : undefined
                      }
                    >
                      {g.contactInfo || '—'}
                    </td>
                    <td>
                      <div className="user-gl-actions">
                        <button
                          type="button"
                          className="user-gl-btn-update"
                          onClick={() => openEdit(g)}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="user-gl-btn-delete"
                          onClick={() => onDelete(g.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {modalMode ? (
        <div
          className="user-gl-modal-overlay"
          role="presentation"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeModal()
          }}
        >
          <div
            className="user-gl-modal"
            role="dialog"
            aria-labelledby="user-gl-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="user-gl-modal-title">
              {modalMode === 'add' ? 'Add guest' : 'Update guest'}
            </h2>
            {error ? (
              <p className="user-gl-error" role="alert">
                {error}
              </p>
            ) : null}
            <form onSubmit={onSave}>
              <div className="user-gl-field">
                <label htmlFor="gl-guest-name">Guest name *</label>
                <input
                  id="gl-guest-name"
                  value={form.guestName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guestName: e.target.value }))
                  }
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </div>
              <div className="user-gl-field">
                <label htmlFor="gl-contact-info">Contact info</label>
                <textarea
                  id="gl-contact-info"
                  value={form.contactInfo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactInfo: e.target.value }))
                  }
                  maxLength={2000}
                  autoComplete="off"
                  placeholder="Phone, email, or other contact details"
                />
              </div>
              <div className="user-gl-modal-actions">
                <button
                  type="button"
                  className="user-gl-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="user-gl-modal-save"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
