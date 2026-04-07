import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CART_STORAGE_KEY,
  addToCart as addToCartStorage,
  clearCart as clearCartStorage,
  getCartItemCount,
  getCartSubtotal,
  loadCart,
  removeLine as removeLineStorage,
  setLineQuantity as setLineQuantityStorage,
} from '../cartStorage'

export function useCart() {
  const [tick, setTick] = useState(0)

  const bump = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    function onLocal() {
      bump()
    }
    function onStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY) bump()
    }
    window.addEventListener('local-cart-updated', onLocal)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('local-cart-updated', onLocal)
      window.removeEventListener('storage', onStorage)
    }
  }, [bump])

  const items = useMemo(() => loadCart(), [tick])
  const itemCount = useMemo(() => getCartItemCount(), [tick])
  const subtotal = useMemo(() => getCartSubtotal(), [tick])

  const addItem = useCallback(
    (
      item: {
        vendorId: number
        productId: number
        name: string
        price: number
        imageUrl: string | null
      },
      quantity = 1,
    ) => {
      addToCartStorage(item, quantity)
    },
    [],
  )

  const setQuantity = useCallback(
    (vendorId: number, productId: number, quantity: number) => {
      setLineQuantityStorage(vendorId, productId, quantity)
    },
    [],
  )

  const removeItem = useCallback((vendorId: number, productId: number) => {
    removeLineStorage(vendorId, productId)
  }, [])

  const clear = useCallback(() => {
    clearCartStorage()
  }, [])

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }
}
