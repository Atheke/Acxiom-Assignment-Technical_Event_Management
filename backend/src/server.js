import './env.js'

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment')
  process.exit(1)
}

import {
  BACKEND_URL,
  CORS_ALLOWED_ORIGINS,
  PORT,
} from './constants.js'
import app from './app.js'

app.listen(PORT, () => {
  const host = BACKEND_URL || `http://localhost:${PORT}`
  console.log(`API listening on port ${PORT} (${host})`)
  console.log(`CORS allowed origins: ${CORS_ALLOWED_ORIGINS.join(', ')}`)
  if (process.env.CROSS_ORIGIN_COOKIES === 'true') {
    console.log('Cross-origin cookies: SameSite=None; Secure (HTTPS required)')
  }
})
