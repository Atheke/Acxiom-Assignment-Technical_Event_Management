import { isDbConnectionError } from '../config/db.js'
import { pool } from '../config/pool.js'
import { VENDOR_CATEGORIES } from '../constants.js'
import { userOrRespond } from '../middleware/role.middleware.js'

export async function listVendorsByCategory(req, res) {
  if (!userOrRespond(req, res)) return
  const cat =
    typeof req.query.category === 'string' ? req.query.category.trim() : ''
  if (!VENDOR_CATEGORIES.includes(cat)) {
    return res.status(400).json({ error: 'Valid category is required' })
  }
  try {
    const r = await pool.query(
      `SELECT v.id AS "vendorId",
              v.business_name AS "businessName",
              u.email AS "contactEmail",
              u.name AS "contactName"
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.approval_status = 'APPROVED' AND v.category = $1
       ORDER BY v.business_name ASC`,
      [cat],
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getVendor(req, res) {
  if (!userOrRespond(req, res)) return
  const vendorId = Number.parseInt(req.params.vendorId, 10)
  if (!Number.isFinite(vendorId)) {
    return res.status(400).json({ error: 'Invalid vendor id' })
  }
  try {
    const r = await pool.query(
      `SELECT v.id AS "vendorId",
              v.business_name AS "businessName",
              v.category,
              u.email AS "contactEmail",
              u.name AS "contactName"
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.id = $1 AND v.approval_status = 'APPROVED'`,
      [vendorId],
    )
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' })
    }
    res.json({ vendor: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getVendorProducts(req, res) {
  if (!userOrRespond(req, res)) return
  const vendorId = Number.parseInt(req.params.vendorId, 10)
  if (!Number.isFinite(vendorId)) {
    return res.status(400).json({ error: 'Invalid vendor id' })
  }
  try {
    const vRow = await pool.query(
      `SELECT user_id FROM vendors WHERE id = $1 AND approval_status = 'APPROVED'`,
      [vendorId],
    )
    if (vRow.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' })
    }
    const vendorUserId = vRow.rows[0].user_id
    const r = await pool.query(
      `SELECT id,
              name,
              price,
              image_url AS "imageUrl",
              created_at AS "createdAt"
       FROM products
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [vendorUserId],
    )
    const items = r.rows.map((row) => ({
      ...row,
      price: row.price != null ? Number(row.price) : row.price,
    }))
    res.json({ items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function listGuests(req, res) {
  const d = userOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT id,
              guest_name AS "guestName",
              contact_info AS "contactInfo",
              created_at AS "createdAt"
       FROM guest_list
       WHERE user_id = $1
       ORDER BY guest_name ASC`,
      [d.sub],
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('guest_list') && msg.includes('does not exist')) {
      return res.status(500).json({
        error:
          'Database is missing guest_list. Run backend/sql/guest_list.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createGuest(req, res) {
  const d = userOrRespond(req, res)
  if (!d) return
  const guestName =
    typeof req.body?.guestName === 'string'
      ? req.body.guestName.trim()
      : typeof req.body?.guest_name === 'string'
        ? req.body.guest_name.trim()
        : ''
  const contactInfoRaw =
    typeof req.body?.contactInfo === 'string'
      ? req.body.contactInfo.trim()
      : typeof req.body?.contact_info === 'string'
        ? req.body.contact_info.trim()
        : ''
  if (!guestName) {
    return res.status(400).json({ error: 'Guest name is required' })
  }
  try {
    const r = await pool.query(
      `INSERT INTO guest_list (user_id, guest_name, contact_info)
       VALUES ($1, $2, $3)
       RETURNING id,
                 guest_name AS "guestName",
                 contact_info AS "contactInfo",
                 created_at AS "createdAt"`,
      [d.sub, guestName, contactInfoRaw || null],
    )
    res.status(201).json({ guest: r.rows[0] })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('guest_list') && msg.includes('does not exist')) {
      return res.status(500).json({
        error:
          'Database is missing guest_list. Run backend/sql/guest_list.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateGuest(req, res) {
  const d = userOrRespond(req, res)
  if (!d) return
  const guestId = Number.parseInt(req.params.guestId, 10)
  if (!Number.isFinite(guestId)) {
    return res.status(400).json({ error: 'Invalid guest id' })
  }
  const guestName =
    typeof req.body?.guestName === 'string'
      ? req.body.guestName.trim()
      : typeof req.body?.guest_name === 'string'
        ? req.body.guest_name.trim()
        : ''
  const contactInfoRaw =
    typeof req.body?.contactInfo === 'string'
      ? req.body.contactInfo.trim()
      : typeof req.body?.contact_info === 'string'
        ? req.body.contact_info.trim()
        : ''
  if (!guestName) {
    return res.status(400).json({ error: 'Guest name is required' })
  }
  try {
    const r = await pool.query(
      `UPDATE guest_list
       SET guest_name = $1,
           contact_info = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id,
                 guest_name AS "guestName",
                 contact_info AS "contactInfo",
                 created_at AS "createdAt"`,
      [guestName, contactInfoRaw || null, guestId, d.sub],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    res.json({ guest: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteGuest(req, res) {
  const d = userOrRespond(req, res)
  if (!d) return
  const guestId = Number.parseInt(req.params.guestId, 10)
  if (!Number.isFinite(guestId)) {
    return res.status(400).json({ error: 'Invalid guest id' })
  }
  try {
    const r = await pool.query(
      `DELETE FROM guest_list WHERE id = $1 AND user_id = $2 RETURNING id`,
      [guestId, d.sub],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Guest not found' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
