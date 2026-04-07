#!/usr/bin/env node
import bcrypt from 'bcryptjs'

const plain = process.argv[2]
if (!plain) {
  console.error('Usage: node scripts/hash-password.mjs <plain-password>')
  process.exit(1)
}

const rounds = 10
const hash = await bcrypt.hash(plain, rounds)
console.log(hash)
