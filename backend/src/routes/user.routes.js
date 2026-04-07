import { Router } from 'express'
import * as order from '../controllers/order.controller.js'
import * as user from '../controllers/user.controller.js'

const router = Router()

router.get('/vendors', user.listVendorsByCategory)
router.get('/vendors/:vendorId', user.getVendor)
router.get('/vendors/:vendorId/products', user.getVendorProducts)

router.get('/guests', user.listGuests)
router.post('/guests', user.createGuest)
router.patch('/guests/:guestId', user.updateGuest)
router.delete('/guests/:guestId', user.deleteGuest)

router.get('/orders', order.listUserOrders)
router.post('/orders', order.createUserOrder)

export default router
