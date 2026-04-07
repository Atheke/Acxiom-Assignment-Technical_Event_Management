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
  /** Present for vendors: `vendors.business_name` from the API. */
  businessName?: string
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

export type PendingVendor = {
  vendorId: number
  userId: number
  name: string
  email: string
  businessName: string
  category: string
  createdAt: string
}

export type PendingUser = {
  id: number
  vendorId: number
  name: string
  email: string
  createdAt: string
}

export async function fetchPendingVendors(): Promise<PendingVendor[]> {
  const res = await fetch(`${API_BASE}/api/admin/pending-vendors`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: PendingVendor[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export async function fetchPendingUsers(): Promise<PendingUser[]> {
  const res = await fetch(`${API_BASE}/api/admin/pending-users`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: PendingUser[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export async function approveVendor(vendorId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/admin/vendors/${vendorId}/approve`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
}

export async function rejectVendor(vendorId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/admin/vendors/${vendorId}/reject`,
    {
      method: 'POST',
      credentials: 'include',
    },
  )
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
}

export type VendorProduct = {
  id: number
  vendorId: number
  name: string
  price: number
  imageUrl: string | null
  createdAt: string
}

export async function fetchVendorProducts(): Promise<VendorProduct[]> {
  const res = await fetch(`${API_BASE}/api/vendor/products`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: VendorProduct[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export async function createVendorProduct(body: {
  name: string
  price: number
  imageUrl: string
}): Promise<VendorProduct> {
  const res = await fetch(`${API_BASE}/api/vendor/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    product?: VendorProduct
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.product) throw new Error('Invalid response')
  return data.product
}

export async function updateVendorProduct(
  productId: number,
  body: { name: string; price: number; imageUrl: string },
): Promise<VendorProduct> {
  const res = await fetch(
    `${API_BASE}/api/vendor/products/${productId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    },
  )
  const data = (await res.json().catch(() => ({}))) as {
    product?: VendorProduct
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.product) throw new Error('Invalid response')
  return data.product
}

export async function deleteVendorProduct(productId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/vendor/products/${productId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
}

export type VendorSale = {
  id: number
  buyerName: string
  productName: string | null
  amount: number
  quantity: number
  createdAt: string
}

export async function fetchVendorSales(): Promise<VendorSale[]> {
  const res = await fetch(`${API_BASE}/api/vendor/sales`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: VendorSale[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export type VendorUserRequestRow = {
  id: number
  requesterName: string
  productName: string | null
  message: string | null
  status: string
  createdAt: string
}

export async function fetchVendorUserRequests(): Promise<VendorUserRequestRow[]> {
  const res = await fetch(`${API_BASE}/api/vendor/user-requests`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: VendorUserRequestRow[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
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
