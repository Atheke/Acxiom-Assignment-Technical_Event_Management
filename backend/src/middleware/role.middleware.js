import { COOKIE_NAME } from '../constants.js'
import { verifyToken } from '../utils/jwt.js'

export function adminOrRespond(req, res) {
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

export function vendorOrRespond(req, res) {
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

export function userOrRespond(req, res) {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  try {
    const decoded = verifyToken(token)
    if (decoded.role !== 'USER') {
      res.status(403).json({ error: 'Forbidden' })
      return null
    }
    return decoded
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
}
