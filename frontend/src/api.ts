const API_BASE = ''

export class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export type Role = 'ADMIN' | 'VENDOR' | 'USER'

export type AuthUser = {
  id: number
  name: string
  email: string
  role: Role
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    user?: AuthUser
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Login failed', res.status)
  }
  if (!data.user) {
    throw new Error('Invalid response')
  }
  return { user: data.user }
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    user?: AuthUser
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Not authenticated', res.status)
  }
  if (!data.user) {
    throw new Error('Invalid response')
  }
  return { user: data.user }
}

export async function logoutRequest(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export type SignupRole = 'USER' | 'VENDOR'

export type VendorCategory =
  | 'CATERING'
  | 'FLORIST'
  | 'DECORATION'
  | 'LIGHTING'

export const VENDOR_CATEGORY_OPTIONS: {
  value: VendorCategory
  label: string
}[] = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'FLORIST', label: 'Florist' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'LIGHTING', label: 'Lighting' },
]

export async function signupRequest(body: {
  name: string
  email: string
  password: string
  role: SignupRole
  businessName?: string
  category?: VendorCategory
}): Promise<{ user: AuthUser; sessionIssued: boolean }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    user?: AuthUser
    sessionIssued?: boolean
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Signup failed', res.status)
  }
  if (!data.user || typeof data.sessionIssued !== 'boolean') {
    throw new Error('Invalid response')
  }
  return { user: data.user, sessionIssued: data.sessionIssued }
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'VENDOR':
      return '/vendor'
    case 'USER':
      return '/user'
    default:
      return '/login'
  }
}
