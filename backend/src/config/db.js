import pg from 'pg'

const { Pool } = pg

export function isDbConnectionError(err) {
  const code = err && err.code
  return (
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    code === 'ENOTFOUND'
  )
}

export function createPgPool() {
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
