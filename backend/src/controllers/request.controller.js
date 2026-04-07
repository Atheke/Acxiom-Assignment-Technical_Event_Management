import { pool } from '../config/pool.js'
import { vendorOrRespond } from '../middleware/role.middleware.js'

export async function listUserProductRequests(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT r.id,
              u.name AS "requesterName",
              r.message,
              r.status,
              r.created_at AS "createdAt"
       FROM user_product_requests r
       JOIN users u ON u.id = r.user_id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [d.sub],
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('user_product_requests') && msg.includes('does not exist')) {
      return res.status(500).json({
        error:
          'Database is missing user_product_requests. Run backend/sql/user_product_requests.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
