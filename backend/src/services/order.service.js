/** Must match PostgreSQL `orders_status_check` (human-readable labels). */
export const VENDOR_ORDER_DB_STATUSES = [
  'Recieved',
  'Ready for Shipping',
  'Out For Delivery',
]

export function normalizeVendorOrderStatusForDb(rawInput) {
  const raw = typeof rawInput === 'string' ? rawInput.trim() : ''
  if (VENDOR_ORDER_DB_STATUSES.includes(raw)) return raw
  const legacy = {
    RECEIVED: 'Recieved',
    RECIEVED: 'Recieved',
    READY_FOR_SHIPPING: 'Ready for Shipping',
    OUT_FOR_DELIVERY: 'Out For Delivery',
  }
  const snake = raw.toUpperCase().replace(/\s+/g, '_')
  if (legacy[snake]) return legacy[snake]
  const lower = raw.toLowerCase()
  for (const s of VENDOR_ORDER_DB_STATUSES) {
    if (s.toLowerCase() === lower) return s
  }
  return null
}

/** Matches lines where vendor_id is either the vendor's user id or vendors.id. */
export function sqlVendorOwnsOrderLine(paramIdx) {
  return `(oi.vendor_id = $${paramIdx} OR oi.vendor_id IN (SELECT id FROM vendors WHERE user_id = $${paramIdx}))`
}
