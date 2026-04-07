import { Router } from 'express'
import * as vendor from '../controllers/vendor.controller.js'

const router = Router()

router.get('/orders', vendor.listVendorOrders)
router.get('/orders/:orderId', vendor.getVendorOrder)
router.patch('/orders/:orderId', vendor.patchVendorOrder)
router.get('/sales', vendor.listSales)

export default router
