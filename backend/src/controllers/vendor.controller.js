import { pool } from '../config/pool.js'
import { vendorOrRespond } from '../middleware/role.middleware.js'
import {
  normalizeVendorOrderStatusForDb,
  sqlVendorOwnsOrderLine,
} from '../services/order.service.js'

export async function listVendorOrders(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT o.id,
              o.total_amount AS "totalAmount",
              o.status,
              o.created_at AS "createdAt"
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM order_items oi
         WHERE oi.order_id = o.id AND ${sqlVendorOwnsOrderLine(1)}
       )
       ORDER BY o.created_at DESC NULLS LAST, o.id DESC`,
      [d.sub],
    )
    const items = r.rows.map((row) => ({
      id: row.id,
      totalAmount: Number(row.totalAmount),
      status: row.status,
      createdAt: row.createdAt,
    }))
    res.json({ items })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (
      (msg.includes('orders') || msg.includes('order_items')) &&
      msg.includes('does not exist')
    ) {
      return res.status(500).json({
        error:
          'Database is missing orders or order_items. Ensure those tables exist.',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getVendorOrder(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  const orderId = Number.parseInt(req.params.orderId, 10)
  if (!Number.isFinite(orderId)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }
  try {
    const r = await pool.query(
      `SELECT o.id,
              o.total_amount AS "totalAmount",
              o.status,
              o.created_at AS "createdAt"
       FROM orders o
       WHERE o.id = $1
         AND EXISTS (
           SELECT 1 FROM order_items oi
           WHERE oi.order_id = o.id AND ${sqlVendorOwnsOrderLine(2)}
         )`,
      [orderId, d.sub],
    )
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    const row = r.rows[0]
    res.json({
      order: {
        id: row.id,
        totalAmount: Number(row.totalAmount),
        status: row.status,
        createdAt: row.createdAt,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function patchVendorOrder(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  const orderId = Number.parseInt(req.params.orderId, 10)
  if (!Number.isFinite(orderId)) {
    return res.status(400).json({ error: 'Invalid order id' })
  }
  const status = normalizeVendorOrderStatusForDb(req.body?.status)
  if (!status) {
    return res.status(400).json({
      error:
        'Status must be Recieved, Ready for Shipping, or Out For Delivery',
    })
  }
  try {
    const r = await pool.query(
      `UPDATE orders o
       SET status = $1
       WHERE o.id = $2
         AND EXISTS (
           SELECT 1 FROM order_items oi
           WHERE oi.order_id = o.id AND ${sqlVendorOwnsOrderLine(3)}
         )
       RETURNING o.id,
                 o.total_amount AS "totalAmount",
                 o.status,
                 o.created_at AS "createdAt"`,
      [status, orderId, d.sub],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    const row = r.rows[0]
    res.json({
      order: {
        id: row.id,
        totalAmount: Number(row.totalAmount),
        status: row.status,
        createdAt: row.createdAt,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function listSales(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT s.id,
              u.name AS "buyerName",
              p.name AS "productName",
              s.amount,
              s.quantity,
              s.created_at AS "createdAt"
       FROM vendor_sales s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN products p ON p.id = s.product_id
       WHERE s.vendor_id = $1
       ORDER BY s.created_at DESC`,
      [d.sub],
    )
    const items = r.rows.map((row) => ({
      ...row,
      amount: row.amount != null ? Number(row.amount) : row.amount,
    }))
    res.json({ items })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('vendor_sales') && msg.includes('does not exist')) {
      return res.status(500).json({
        error:
          'Database is missing vendor_sales. Run backend/sql/vendor_sales_and_requests.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
