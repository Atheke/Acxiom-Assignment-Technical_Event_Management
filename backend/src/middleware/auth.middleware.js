import { COOKIE_NAME } from '../constants.js'
import { verifyToken } from '../utils/jwt.js'

export function optionalAuth(req, _res, next) {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    req.user = null
    return next()
  }
  try {
    req.user = verifyToken(token)
  } catch {
    req.user = null
  }
  next()
}
