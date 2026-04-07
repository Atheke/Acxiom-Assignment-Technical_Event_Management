import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10

/** Verifies login password only against bcrypt hashes stored in the database. */
export async function passwordMatches(plain, stored) {
  if (stored == null || stored === '') return false
  const s = String(stored)
  if (!s.startsWith('$2a$') && !s.startsWith('$2b$') && !s.startsWith('$2y$')) {
    return false
  }
  return bcrypt.compare(plain, s)
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}
