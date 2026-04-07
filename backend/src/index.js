import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const { Pool } = pg

const app = express()
const PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment')
  process.exit(1)
}

function createPgPool() {
  const connectionString = process.env.DATABASE_URL
  const urlWantsSsl = /sslmode=(require|verify-full|verify-ca)/i.test(
    connectionString || '',
  )
  const useSsl = process.env.DATABASE_SSL === 'true' || urlWantsSsl

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    ...(useSsl
      ? {
          ssl:
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
              ? { rejectUnauthorized: true }
              : { rejectUnauthorized: false },
        }
      : {}),
  })

  pool.on('error', (err) => {
    console.error(
      '[pg] pool client error',
      err.code || '',
      err.message || err,
    )
  })

  return pool
}

const pool = createPgPool()

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10

function isDbConnectionError(err) {
  const code = err && err.code
  return (
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    code === 'ENOTFOUND'
  )
}

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

const COOKIE_NAME = 'access_token'

function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || 'unknown'
}

/** Logs failed login attempts (never logs passwords). */
function logLoginFailure(req, payload) {
  const entry = {
    event: 'login_failure',
    ip: clientIp(req),
    ...payload,
  }
  console.warn('[auth]', JSON.stringify(entry))
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

/** Verifies login password only against bcrypt hashes stored in the database. */
async function passwordMatches(plain, stored) {
  if (stored == null || stored === '') return false
  const s = String(stored)
  if (!s.startsWith('$2a$') && !s.startsWith('$2b$') && !s.startsWith('$2y$')) {
    return false
  }
  return bcrypt.compare(plain, s)
}

const VENDOR_CATEGORIES = [
  'CATERING',
  'FLORIST',
  'DECORATION',
  'LIGHTING',
]

const SIGNUP_ROLES = ['USER', 'VENDOR']

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/signup', async (req, res) => {
  const name =
    typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const password =
    typeof req.body?.password === 'string' ? req.body.password : ''
  const role = typeof req.body?.role === 'string' ? req.body.role.trim() : ''
  const businessName =
    typeof req.body?.businessName === 'string'
      ? req.body.businessName.trim()
      : ''
  const category =
    typeof req.body?.category === 'string' ? req.body.category.trim() : ''

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' })
  }

  if (!SIGNUP_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role for signup' })
  }

  if (role === 'VENDOR') {
    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required for vendors' })
    }
    if (!VENDOR_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Valid category is required for vendors' })
    }
  }

  let client
  try {
    client = await pool.connect()
  } catch (err) {
    console.error('[db] connect failed', err.code || '', err.message || err)
    return res.status(503).json({
      error:
        'Could not reach the database. For hosted Postgres, set DATABASE_SSL=true in .env (or add sslmode=require to DATABASE_URL). Check that Postgres is running and DATABASE_URL is correct.',
    })
  }

  try {
    await client.query('BEGIN')

    const dup = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    )
    if (dup.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordToStore = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const insUser = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, passwordToStore, role],
    )

    const userRow = insUser.rows[0]

    if (role === 'VENDOR') {
      await client.query(
        `INSERT INTO vendors (user_id, business_name, approval_status, category)
         VALUES ($1, $2, 'PENDING', $3)`,
        [userRow.id, businessName, category],
      )
    }

    await client.query('COMMIT')

    let sessionIssued = false
    if (role === 'USER') {
      const token = signToken({
        sub: userRow.id,
        email: userRow.email,
        role: userRow.role,
      })
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAgeMs,
        path: '/',
      })
      sessionIssued = true
    }

    res.status(201).json({
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
      },
      sessionIssued,
    })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(err)
    if (isDbConnectionError(err)) {
      return res.status(503).json({
        error:
          'Database connection was lost. If you use Neon, Supabase, or similar, set DATABASE_SSL=true in .env.',
      })
    }
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('category') && msg.includes('does not exist')) {
      return res.status(500).json({
        error:
          'Database is missing vendors.category. Run backend/sql/add_vendor_category.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  } finally {
    client.release()
  }
})

function adminOrRespond(req, res) {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  try {
    const decoded = verifyToken(token)
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' })
      return null
    }
    return decoded
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
}

function vendorOrRespond(req, res) {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  try {
    const decoded = verifyToken(token)
    if (decoded.role !== 'VENDOR') {
      res.status(403).json({ error: 'Forbidden' })
      return null
    }
    return decoded
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
}

app.get('/api/admin/pending-vendors', async (req, res) => {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT v.id AS "vendorId", u.id AS "userId", u.name, u.email,
              v.business_name AS "businessName", v.category,
              v.created_at AS "createdAt"
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.approval_status = 'PENDING'
       ORDER BY v.created_at ASC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/admin/pending-users', async (req, res) => {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at AS "createdAt",
              v.id AS "vendorId"
       FROM users u
       INNER JOIN vendors v ON v.user_id = u.id
       WHERE v.approval_status = 'PENDING'
       ORDER BY v.created_at ASC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/vendors/:vendorId/approve', async (req, res) => {
  if (!adminOrRespond(req, res)) return
  const vendorId = Number.parseInt(req.params.vendorId, 10)
  if (!Number.isFinite(vendorId)) {
    return res.status(400).json({ error: 'Invalid vendor id' })
  }
  try {
    const r = await pool.query(
      `UPDATE vendors
       SET approval_status = 'APPROVED'
       WHERE id = $1 AND approval_status = 'PENDING'
       RETURNING id`,
      [vendorId],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Pending vendor not found' })
    }
    res.json({ ok: true, vendorId: r.rows[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/vendors/:vendorId/reject', async (req, res) => {
  if (!adminOrRespond(req, res)) return
  const vendorId = Number.parseInt(req.params.vendorId, 10)
  if (!Number.isFinite(vendorId)) {
    return res.status(400).json({ error: 'Invalid vendor id' })
  }
  try {
    const r = await pool.query(
      `UPDATE vendors
       SET approval_status = 'REJECTED'
       WHERE id = $1 AND approval_status = 'PENDING'
       RETURNING id`,
      [vendorId],
    )
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Pending vendor not found' })
    }
    res.json({ ok: true, vendorId: r.rows[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  try {
    const decoded = verifyToken(token)
    const r = await pool.query(
      `SELECT u.id, u.name, u.email, u.role,
              v.business_name AS vendor_business_name,
              v.approval_status AS vendor_approval_status
       FROM users u
       LEFT JOIN vendors v ON v.user_id = u.id
       WHERE u.id = $1`,
      [decoded.sub],
    )
    if (r.rows.length === 0) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const row = r.rows[0]
    if (row.role === 'VENDOR') {
      if (!row.vendor_approval_status) {
        return res.status(403).json({ error: 'Vendor profile is incomplete' })
      }
      if (row.vendor_approval_status !== 'APPROVED') {
        return res.status(403).json({
          error:
            row.vendor_approval_status === 'PENDING'
              ? 'Vendor account is pending approval'
              : 'Vendor application was rejected',
        })
      }
    }
    const userOut = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    }
    if (row.role === 'VENDOR' && row.vendor_business_name) {
      userOut.businessName = row.vendor_business_name
    }
    res.json({ user: userOut })
  } catch {
    return res.status(401).json({ error: 'Not authenticated' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const password =
    typeof req.body?.password === 'string' ? req.body.password : ''

  if (!email || !password) {
    logLoginFailure(req, {
      reason: 'missing_credentials',
      emailPresent: Boolean(email),
      passwordPresent: Boolean(password),
    })
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role,
              v.id AS vendor_id,
              v.business_name AS vendor_business_name,
              v.approval_status AS vendor_approval_status
       FROM users u
       LEFT JOIN vendors v ON v.user_id = u.id
       WHERE u.email = $1`,
      [email],
    )

    if (r.rows.length === 0) {
      logLoginFailure(req, {
        reason: 'unknown_user',
        email,
      })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const row = r.rows[0]
    const match = await passwordMatches(password, row.password)
    if (!match) {
      logLoginFailure(req, {
        reason: 'invalid_password',
        userId: row.id,
        email: row.email,
        role: row.role,
      })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (row.role === 'VENDOR') {
      if (!row.vendor_id) {
        logLoginFailure(req, {
          reason: 'vendor_profile_incomplete',
          userId: row.id,
          email: row.email,
          role: row.role,
        })
        return res.status(403).json({ error: 'Vendor profile is incomplete' })
      }
      if (row.vendor_approval_status === 'PENDING') {
        logLoginFailure(req, {
          reason: 'vendor_pending_approval',
          userId: row.id,
          email: row.email,
          role: row.role,
          approvalStatus: row.vendor_approval_status,
        })
        return res
          .status(403)
          .json({ error: 'Vendor account is pending approval' })
      }
      if (row.vendor_approval_status === 'REJECTED') {
        logLoginFailure(req, {
          reason: 'vendor_rejected',
          userId: row.id,
          email: row.email,
          role: row.role,
          approvalStatus: row.vendor_approval_status,
        })
        return res
          .status(403)
          .json({ error: 'Vendor application was rejected' })
      }
    }

    const token = signToken({
      sub: row.id,
      email: row.email,
      role: row.role,
    })

    const maxAgeMs = 7 * 24 * 60 * 60 * 1000
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeMs,
      path: '/',
    })

    const userOut = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    }
    if (row.role === 'VENDOR' && row.vendor_business_name) {
      userOut.businessName = row.vendor_business_name
    }
    res.json({ user: userOut })
  } catch (err) {
    console.error(err)
    if (isDbConnectionError(err)) {
      return res.status(503).json({
        error:
          'Database unavailable. Try DATABASE_SSL=true for remote Postgres, or verify DATABASE_URL.',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.json({ ok: true })
})

app.get('/api/vendor/products', async (req, res) => {
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
})

app.post('/api/vendor/products', async (req, res) => {
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
})

app.patch('/api/vendor/products/:productId', async (req, res) => {
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
})

app.delete('/api/vendor/products/:productId', async (req, res) => {
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
})

app.get('/api/vendor/sales', async (req, res) => {
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
})

app.get('/api/vendor/user-requests', async (req, res) => {
  const d = vendorOrRespond(req, res)
  if (!d) return
  try {
    const r = await pool.query(
      `SELECT r.id,
              u.name AS "requesterName",
              p.name AS "productName",
              r.message,
              r.status,
              r.created_at AS "createdAt"
       FROM user_product_requests r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN products p ON p.id = r.product_id
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
          'Database is missing user_product_requests. Run backend/sql/vendor_sales_and_requests.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
