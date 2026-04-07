function normalizeOrigin(s) {
  if (s == null || typeof s !== 'string') return ''
  return s.trim().replace(/\/$/, '')
}

// FRONTEND_URL or CORS_ORIGIN — comma-separated origins.
export const CORS_ALLOWED_ORIGINS = (() => {
  const raw =
    process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173'
  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
})()

export const CORS_ORIGIN = CORS_ALLOWED_ORIGINS[0] || 'http://localhost:5173'

export const BACKEND_URL = normalizeOrigin(process.env.BACKEND_URL || '')

export function corsDynamicOrigin(origin, callback) {
  if (!origin) return callback(null, true)
  if (CORS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
  callback(null, false)
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// SameSite=None + Secure when cross-site; production defaults unless CROSS_ORIGIN_COOKIES=false.
export function sessionCookieOptions(maxAgeMs = WEEK_MS) {
  const explicitOff = process.env.CROSS_ORIGIN_COOKIES === 'false'
  const explicitOn =
    process.env.CROSS_ORIGIN_COOKIES === 'true' ||
    process.env.COOKIE_SAME_SITE === 'none'

  const cross =
    !explicitOff && (explicitOn || process.env.NODE_ENV === 'production')

  const sameSite = cross ? 'none' : process.env.COOKIE_SAME_SITE || 'lax'
  let secure = false
  if (sameSite === 'none') {
    secure = true
  } else if (
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production'
  ) {
    secure = true
  }
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: maxAgeMs,
    path: '/',
  }
}

export function clearSessionCookieOptions() {
  const o = sessionCookieOptions(WEEK_MS)
  return {
    httpOnly: o.httpOnly,
    secure: o.secure,
    sameSite: o.sameSite,
    path: o.path,
  }
}

export const COOKIE_NAME = 'access_token'

export const PORT = Number(process.env.PORT) || 3001

export const VENDOR_CATEGORIES = [
  'CATERING',
  'FLORIST',
  'DECORATION',
  'LIGHTING',
]

export const SIGNUP_ROLES = ['USER']
