import { pool } from '../config/pool.js'
import { vendorOrRespond } from '../middleware/role.middleware.js'

export async function listProducts(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT id,
              vendor_id AS "vendorId",
              name,
              price,
              image_url AS "imageUrl",
              created_at AS "createdAt"
       FROM products
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [d.sub],
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

export async function createProduct(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const priceRaw = req.body?.price
  const imageUrl =
    typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : ''
  if (!name) {
    return res.status(400).json({ error: 'Product name is required' })
  }
  const price = Number(priceRaw)
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Valid price is required' })
  }
  try {
    const r = await pool.query(
      `INSERT INTO products (vendor_id, name, price, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id,
                 vendor_id AS "vendorId",
                 name,
                 price,
                 image_url AS "imageUrl",
                 created_at AS "createdAt"`,
      [d.sub, name, price, imageUrl || null],
    )
    const row = r.rows[0]
    row.price = Number(row.price)
    res.status(201).json({ product: row })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateProduct(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  const productId = Number.parseInt(req.params.productId, 10)
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const priceRaw = req.body?.price
  const imageUrl =
    typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : ''
  if (!name) {
    return res.status(400).json({ error: 'Product name is required' })
  }
  const price = Number(priceRaw)
  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Valid price is required' })
  }
  try {
    const r = await pool.query(
      `UPDATE products
       SET name = $1, price = $2, image_url = $3
       WHERE id = $4 AND vendor_id = $5
       RETURNING id,
                 vendor_id AS "vendorId",
                 name,
                 price,
                 image_url AS "imageUrl",
                 created_at AS "createdAt"`,
      [name, price, imageUrl || null, productId, d.sub],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const row = r.rows[0]
    row.price = Number(row.price)
    res.json({ product: row })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteProduct(req, res) {
  const d = vendorOrRespond(req, res)
  if (!d) return
  const productId = Number.parseInt(req.params.productId, 10)
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' })
  }
  try {
    const r = await pool.query(
      `DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING id`,
      [productId, d.sub],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
