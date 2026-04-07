export const CART_STORAGE_KEY = 'tem_user_cart_v1'

export type CartLine = {
  vendorId: number
  productId: number
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

function lineKey(vendorId: number, productId: number) {
  return `${vendorId}:${productId}`
}

function emitUpdated() {
  window.dispatchEvent(new Event('local-cart-updated'))
}

export function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (row): row is CartLine =>
        row != null &&
        typeof row === 'object' &&
        typeof (row as CartLine).vendorId === 'number' &&
        typeof (row as CartLine).productId === 'number' &&
        typeof (row as CartLine).name === 'string' &&
        typeof (row as CartLine).price === 'number' &&
        typeof (row as CartLine).quantity === 'number',
    )
  } catch {
    return []
  }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  emitUpdated()
}

export function getCartItemCount(): number {
  return loadCart().reduce((n, l) => n + l.quantity, 0)
}

export function getCartSubtotal(): number {
  return loadCart().reduce((sum, l) => sum + l.price * l.quantity, 0)
}

export function addToCart(
  item: {
    vendorId: number
    productId: number
    name: string
    price: number
    imageUrl: string | null
  },
  quantity = 1,
): void {
  const q = Math.max(1, Math.floor(quantity))
  const lines = loadCart()
  const k = lineKey(item.vendorId, item.productId)
  const idx = lines.findIndex(
    (l) => lineKey(l.vendorId, l.productId) === k,
  )
  if (idx >= 0) {
    lines[idx] = {
      ...lines[idx],
      quantity: lines[idx].quantity + q,
    }
  } else {
    lines.push({
      vendorId: item.vendorId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: q,
    })
  }
  saveCart(lines)
}

export function setLineQuantity(
  vendorId: number,
  productId: number,
  quantity: number,
): void {
  const q = Math.max(0, Math.floor(quantity))
  let lines = loadCart()
  const k = lineKey(vendorId, productId)
  if (q === 0) {
    lines = lines.filter((l) => lineKey(l.vendorId, l.productId) !== k)
  } else {
    const idx = lines.findIndex((l) => lineKey(l.vendorId, l.productId) === k)
    if (idx >= 0) lines[idx] = { ...lines[idx], quantity: q }
  }
  saveCart(lines)
}

export function removeLine(vendorId: number, productId: number): void {
  const lines = loadCart().filter(
    (l) => lineKey(l.vendorId, l.productId) !== lineKey(vendorId, productId),
  )
  saveCart(lines)
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY)
  emitUpdated()
}
