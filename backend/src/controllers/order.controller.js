import { pool } from '../config/pool.js'
import { userOrRespond } from '../middleware/role.middleware.js'

export async function listUserOrders(req, res) {
  const d = userOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT id,
              user_id AS "userId",
              total_amount AS "totalAmount",
              status,
              created_at AS "createdAt"
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC NULLS LAST, id DESC`,
      [d.sub],
    )
    const orderRows = r.rows
    const orderIds = orderRows.map((row) => row.id)
    const linesByOrderId = new Map()

    if (orderIds.length > 0) {
      const lr = await pool.query(
        `SELECT oi.order_id AS "orderId",
                oi.product_id AS "productId",
                COALESCE(v.business_name, 'Vendor') AS "vendorName",
                COALESCE(p.name, 'Product') AS "productName",
                oi.quantity,
                oi.price AS "unitPrice"
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         LEFT JOIN vendors v ON v.user_id = oi.vendor_id
         WHERE oi.order_id = ANY($1::int[])
         ORDER BY oi.order_id, oi.id`,
        [orderIds],
      )
      for (const line of lr.rows) {
        const oid = line.orderId
        const qty = Number(line.quantity)
        const unit = Number(line.unitPrice)
        const entry = {
          productId: line.productId,
          vendorName: line.vendorName,
          productName: line.productName,
          quantity: qty,
          unitPrice: unit,
          lineTotal: qty * unit,
        }
        const list = linesByOrderId.get(oid)
        if (list) list.push(entry)
        else linesByOrderId.set(oid, [entry])
      }
    }

    const items = orderRows.map((row) => ({
      id: row.id,
      userId: Number(row.userId),
      totalAmount: Number(row.totalAmount),
      status: row.status,
      createdAt: row.createdAt,
      lines: linesByOrderId.get(row.id) ?? [],
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

export async function createUserOrder(req, res) {
  const decoded = userOrRespond(req, res)
  if (!decoded) return

  const paymentMethodRaw =
    typeof req.body?.paymentMethod === 'string'
      ? req.body.paymentMethod.trim().toUpperCase()
      : ''
  const PAYMENT = ['CASH', 'UPI']
  if (!PAYMENT.includes(paymentMethodRaw)) {
    return res.status(400).json({ error: 'Payment method must be Cash or UPI' })
  }

  const customerName =
    typeof req.body?.customerName === 'string' ? req.body.customerName.trim() : ''
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const phone =
    typeof req.body?.phone === 'string' ? req.body.phone.trim() : ''
  const addressLine =
    typeof req.body?.address === 'string' ? req.body.address.trim() : ''
  const city = typeof req.body?.city === 'string' ? req.body.city.trim() : ''
  const state =
    typeof req.body?.state === 'string' ? req.body.state.trim() : ''
  const pinCode =
    typeof req.body?.pinCode === 'string' ? req.body.pinCode.trim() : ''

  if (
    !customerName ||
    !email ||
    !phone ||
    !addressLine ||
    !city ||
    !state ||
    !pinCode
  ) {
    return res.status(400).json({ error: 'All address and contact fields are required' })
  }

  const linesIn = req.body?.lines
  if (!Array.isArray(linesIn) || linesIn.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' })
  }

  let client
  try {
    client = await pool.connect()
  } catch (err) {
    console.error('[db] connect failed', err.code || '', err.message || err)
    return res.status(503).json({ error: 'Database unavailable' })
  }

  try {
    await client.query('BEGIN')

    const verifiedLines = []
    let grandTotal = 0

    for (const raw of linesIn) {
      const vendorId = Number(raw.vendorId)
      const productId = Number(raw.productId)
      const qty = Math.floor(Number(raw.quantity))
      if (
        !Number.isFinite(vendorId) ||
        !Number.isFinite(productId) ||
        !Number.isFinite(qty) ||
        qty < 1
      ) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Invalid line item' })
      }

      const pr = await client.query(
        `SELECT p.id, p.name, p.price, v.user_id AS vendor_user_id
         FROM products p
         INNER JOIN vendors v
           ON v.user_id = p.vendor_id
           AND v.id = $1
           AND v.approval_status = 'APPROVED'
         WHERE p.id = $2`,
        [vendorId, productId],
      )
      if (pr.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Invalid product or vendor' })
      }

      const row = pr.rows[0]
      const unitPrice = Number(row.price)
      const lineTotal = unitPrice * qty
      grandTotal += lineTotal
      verifiedLines.push({
        vendorUserId: row.vendor_user_id,
        productId,
        unitPrice,
        quantity: qty,
      })
    }

    const ins = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING id`,
      [decoded.sub, grandTotal],
    )
    const orderId = ins.rows[0].id

    for (const ln of verifiedLines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          ln.productId,
          ln.vendorUserId,
          ln.quantity,
          ln.unitPrice,
        ],
      )
    }

    await client.query('COMMIT')
    res.status(201).json({
      orderId,
      grandTotal,
    })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
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
  } finally {
    client.release()
  }
}
