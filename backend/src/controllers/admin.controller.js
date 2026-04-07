import { isDbConnectionError } from '../config/db.js'
import { pool } from '../config/pool.js'
import { VENDOR_CATEGORIES } from '../constants.js'
import { adminOrRespond } from '../middleware/role.middleware.js'
import { hashPassword } from '../utils/hash.js'

export async function createVendor(req, res) {
  if (!adminOrRespond(req, res)) return

  const name =
    typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const password =
    typeof req.body?.password === 'string' ? req.body.password : ''
  const businessName =
    typeof req.body?.businessName === 'string'
      ? req.body.businessName.trim()
      : ''
  const category =
    typeof req.body?.category === 'string' ? req.body.category.trim() : ''

  if (!name || !email || !password || !businessName || !category) {
    return res.status(400).json({
      error:
        'Name, email, password, business name, and category are required',
    })
  }

  if (!VENDOR_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Valid category is required' })
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

    const dup = await client.query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ])
    if (dup.rows.length > 0) {
      await client.query('ROLLBACK')
      return res
        .status(409)
        .json({ error: 'An account with this email already exists' })
    }

    const passwordToStore = await hashPassword(password)

    const insUser = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'VENDOR')
       RETURNING id, name, email, role`,
      [name, email, passwordToStore],
    )

    const userRow = insUser.rows[0]

    await client.query(
      `INSERT INTO vendors (user_id, business_name, approval_status, category)
       VALUES ($1, $2, 'APPROVED', $3)`,
      [userRow.id, businessName, category],
    )

    await client.query('COMMIT')

    res.status(201).json({
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        businessName,
      },
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
}

export async function pendingVendors(req, res) {
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
}

export async function pendingUsers(req, res) {
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
}

export async function approveVendor(req, res) {
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
}

export async function rejectVendor(req, res) {
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
}

export async function listMemberships(req, res) {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT id, name, price::float8 AS price, duration_days AS "durationDays",
              features, created_at AS "createdAt"
       FROM memberships
       ORDER BY name ASC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createMembership(req, res) {
  if (!adminOrRespond(req, res)) return

  const name =
    typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const priceRaw = req.body?.price
  const durationRaw = req.body?.durationDays ?? req.body?.duration_days
  const features =
    typeof req.body?.features === 'string' ? req.body.features.trim() : ''

  const price =
    typeof priceRaw === 'number'
      ? priceRaw
      : typeof priceRaw === 'string'
        ? Number.parseFloat(priceRaw)
        : NaN
  const durationDays =
    typeof durationRaw === 'number'
      ? durationRaw
      : typeof durationRaw === 'string'
        ? Number.parseInt(durationRaw, 10)
        : NaN

  if (!name || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'Name and a valid price are required' })
  }
  if (!Number.isFinite(durationDays) || durationDays < 1) {
    return res.status(400).json({ error: 'Duration must be at least 1 day' })
  }

  try {
    const r = await pool.query(
      `INSERT INTO memberships (name, price, duration_days, features)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, price::float8 AS price, duration_days AS "durationDays",
                 features, created_at AS "createdAt"`,
      [name, price, durationDays, features || null],
    )
    res.status(201).json({ membership: r.rows[0] })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('memberships') && msg.includes('does not exist')) {
      return res.status(500).json({
        error: 'Database is missing memberships tables. Run backend/sql/memberships.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  }
}

export async function approvedVendorsForMembership(req, res) {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT v.user_id AS "vendorUserId", u.name, u.email,
              v.business_name AS "businessName"
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.approval_status = 'APPROVED'
       ORDER BY v.business_name ASC NULLS LAST, u.name ASC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createVendorMembership(req, res) {
  if (!adminOrRespond(req, res)) return

  const rawVendor = req.body?.vendorUserId
  const rawMem = req.body?.membershipId
  const vendorUserId =
    typeof rawVendor === 'number' && Number.isFinite(rawVendor)
      ? Math.trunc(rawVendor)
      : Number.parseInt(String(rawVendor ?? ''), 10)
  const membershipId =
    typeof rawMem === 'number' && Number.isFinite(rawMem)
      ? Math.trunc(rawMem)
      : Number.parseInt(String(rawMem ?? ''), 10)
  const startRaw = req.body?.startDate ?? req.body?.start_date
  let startDate = null
  if (typeof startRaw === 'string' && startRaw.trim()) {
    const d = new Date(startRaw)
    if (!Number.isFinite(d.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' })
    }
    startDate = d
  }

  if (!Number.isFinite(vendorUserId) || !Number.isFinite(membershipId)) {
    return res.status(400).json({ error: 'Vendor and membership are required' })
  }

  let client
  try {
    client = await pool.connect()
  } catch (err) {
    console.error('[db] connect failed', err.code || '', err.message || err)
    return res.status(503).json({ error: 'Could not reach the database' })
  }

  try {
    await client.query('BEGIN')

    const v = await client.query(
      `SELECT user_id FROM vendors
       WHERE user_id = $1 AND approval_status = 'APPROVED'`,
      [vendorUserId],
    )
    if (v.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Approved vendor not found' })
    }

    const m = await client.query(
      `SELECT id, duration_days FROM memberships WHERE id = $1`,
      [membershipId],
    )
    if (m.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Membership plan not found' })
    }

    const durationDays = m.rows[0].duration_days
    const start = startDate ?? new Date()
    const end = new Date(
      start.getTime() + durationDays * 24 * 60 * 60 * 1000,
    )

    const ins = await client.query(
      `INSERT INTO vendor_memberships
         (vendor_id, membership_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       RETURNING id, vendor_id AS "vendorUserId", membership_id AS "membershipId",
                 start_date AS "startDate", end_date AS "endDate", status`,
      [vendorUserId, membershipId, start, end],
    )

    await client.query('COMMIT')
    res.status(201).json({ vendorMembership: ins.rows[0] })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (msg.includes('vendor_memberships') && msg.includes('does not exist')) {
      return res.status(500).json({
        error: 'Database is missing vendor_memberships. Run backend/sql/memberships.sql',
      })
    }
    res.status(500).json({ error: 'Server error' })
  } finally {
    client.release()
  }
}

export async function listVendorMembershipRows(req, res) {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT vm.id,
              vm.vendor_id AS "vendorUserId",
              u.name AS "vendorName",
              u.email AS "vendorEmail",
              v.business_name AS "businessName",
              v.approval_status AS "vendorApprovalStatus",
              m.id AS "membershipId",
              m.name AS "planName",
              m.price::float8 AS "planPrice",
              m.duration_days AS "planDurationDays",
              m.features AS "planFeatures",
              vm.start_date AS "startDate",
              vm.end_date AS "endDate",
              vm.status
       FROM vendor_memberships vm
       JOIN memberships m ON m.id = vm.membership_id
       JOIN vendors v ON v.user_id = vm.vendor_id
       JOIN users u ON u.id = vm.vendor_id
       ORDER BY vm.start_date DESC NULLS LAST`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    const msg = String(err && err.message ? err.message : err)
    if (
      msg.includes('vendor_memberships') &&
      (msg.includes('does not exist') || msg.includes('relation'))
    ) {
      return res.json({ items: [] })
    }
    res.status(500).json({ error: 'Server error' })
  }
}

export async function listAllVendors(req, res) {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT v.id AS "vendorId", v.user_id AS "userId", u.name, u.email,
              v.business_name AS "businessName", v.category,
              v.approval_status AS "approvalStatus", v.created_at AS "createdAt"
       FROM vendors v
       JOIN users u ON u.id = v.user_id
       ORDER BY v.created_at DESC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function listEndUsers(req, res) {
  if (!adminOrRespond(req, res)) return
  try {
    const r = await pool.query(
      `SELECT id, name, email, created_at AS "createdAt"
       FROM users WHERE role = 'USER' ORDER BY created_at DESC`,
    )
    res.json({ items: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function createEndUser(req, res) {
  if (!adminOrRespond(req, res)) return

  const name =
    typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  const password =
    typeof req.body?.password === 'string' ? req.body.password : ''

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Name, email, and password are required' })
  }

  try {
    const dup = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ])
    if (dup.rows.length > 0) {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists' })
    }

    const passwordToStore = await hashPassword(password)
    const ins = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'USER')
       RETURNING id, name, email, role`,
      [name, email, passwordToStore],
    )

    res.status(201).json({ user: ins.rows[0] })
  } catch (err) {
    console.error(err)
    if (isDbConnectionError(err)) {
      return res.status(503).json({ error: 'Database unavailable' })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
