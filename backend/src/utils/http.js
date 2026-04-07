/** Logs failed login attempts (never logs passwords). */
export function logLoginFailure(req, payload) {
  const entry = {
    event: 'login_failure',
    ip: clientIp(req),
    ...payload,
  }
  console.warn('[auth]', JSON.stringify(entry))
}

export function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || req.ip || 'unknown'
}
