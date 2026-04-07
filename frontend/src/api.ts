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

/** Orders that include a line for this vendor (`order_items.vendor_id` = vendor user id). */
export type VendorOrderSummary = {
  id: number
  totalAmount: number
  status: string
  createdAt: string | null
}

export async function fetchVendorOrders(): Promise<VendorOrderSummary[]> {
  const res = await fetch(`${API_BASE}/api/vendor/orders`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: VendorOrderSummary[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

/** Values stored in `orders.status` (must match DB CHECK constraint). */
export type VendorOrderStatusValue =
  | 'Recieved'
  | 'Ready for Shipping'
  | 'Out For Delivery'

export async function fetchVendorOrder(
  orderId: number,
): Promise<VendorOrderSummary> {
  const res = await fetch(`${API_BASE}/api/vendor/orders/${orderId}`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    order?: VendorOrderSummary
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.order) throw new Error('Invalid response')
  return data.order
}

export async function updateVendorOrderStatus(
  orderId: number,
  status: VendorOrderStatusValue,
): Promise<VendorOrderSummary> {
  const res = await fetch(`${API_BASE}/api/vendor/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    order?: VendorOrderSummary
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.order) throw new Error('Invalid response')
  return data.order
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

/** Approved vendors in a category (USER session). */
export type PublicVendorCard = {
  vendorId: number
  businessName: string
  contactEmail: string
  contactName: string
}

export async function fetchVendorsByCategory(
  category: VendorCategory,
): Promise<PublicVendorCard[]> {
  const res = await fetch(
    `${API_BASE}/api/user/vendors?category=${encodeURIComponent(category)}`,
    { credentials: 'include' },
  )
  const data = (await res.json().catch(() => ({}))) as {
    items?: PublicVendorCard[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export type PublicVendorDetail = {
  vendorId: number
  businessName: string
  category: VendorCategory
  contactEmail: string
  contactName: string
}

export async function fetchUserVendorById(
  vendorId: number,
): Promise<PublicVendorDetail> {
  const res = await fetch(`${API_BASE}/api/user/vendors/${vendorId}`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    vendor?: PublicVendorDetail
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.vendor) throw new Error('Invalid response')
  return data.vendor
}

/** Products sold by an approved vendor (USER session). */
export type PublicVendorProduct = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  createdAt: string
}

export async function fetchVendorProductsForUser(
  vendorId: number,
): Promise<PublicVendorProduct[]> {
  const res = await fetch(
    `${API_BASE}/api/user/vendors/${vendorId}/products`,
    { credentials: 'include' },
  )
  const data = (await res.json().catch(() => ({}))) as {
    items?: PublicVendorProduct[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export type PaymentMethod = 'CASH' | 'UPI'

export type PlaceOrderLine = {
  vendorId: number
  productId: number
  quantity: number
}

export async function placeOrder(body: {
  paymentMethod: PaymentMethod
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pinCode: string
  lines: PlaceOrderLine[]
}): Promise<{ orderId: number; grandTotal: number }> {
  const res = await fetch(`${API_BASE}/api/user/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    orderId?: number
    grandTotal?: number
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Order failed', res.status)
  }
  if (data.orderId == null || data.grandTotal == null) {
    throw new Error('Invalid response')
  }
  return { orderId: data.orderId, grandTotal: Number(data.grandTotal) }
}

export type UserOrderLine = {
  productId: number
  vendorName: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

/** `orders` row + `order_items` lines (product name from `products`). */
export type UserOrderRow = {
  id: number
  userId: number
  totalAmount: number
  status: string
  createdAt: string | null
  lines: UserOrderLine[]
}

export async function fetchUserOrders(): Promise<UserOrderRow[]> {
  const res = await fetch(`${API_BASE}/api/user/orders`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: UserOrderRow[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export type UserGuest = {
  id: number
  guestName: string
  contactInfo: string | null
  createdAt: string
}

export async function fetchUserGuests(): Promise<UserGuest[]> {
  const res = await fetch(`${API_BASE}/api/user/guests`, {
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as {
    items?: UserGuest[]
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  return data.items ?? []
}

export async function createUserGuest(body: {
  guestName: string
  contactInfo?: string
}): Promise<UserGuest> {
  const res = await fetch(`${API_BASE}/api/user/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    guest?: UserGuest
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.guest) throw new Error('Invalid response')
  return data.guest
}

export async function updateUserGuest(
  guestId: number,
  body: {
    guestName: string
    contactInfo?: string
  },
): Promise<UserGuest> {
  const res = await fetch(`${API_BASE}/api/user/guests/${guestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    guest?: UserGuest
    error?: string
  }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
  if (!data.guest) throw new Error('Invalid response')
  return data.guest
}

export async function deleteUserGuest(guestId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/user/guests/${guestId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new HttpError(data.error || 'Request failed', res.status)
  }
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
