import { Router } from 'express'
import * as product from '../controllers/product.controller.js'

const router = Router()

router.get('/products', product.listProducts)
router.post('/products', product.createProduct)
router.patch('/products/:productId', product.updateProduct)
router.delete('/products/:productId', product.deleteProduct)

export default router
