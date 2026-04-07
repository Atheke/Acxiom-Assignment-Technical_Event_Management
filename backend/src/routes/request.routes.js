import { Router } from 'express'
import * as request from '../controllers/request.controller.js'

const router = Router()

router.get('/user-requests', request.listUserProductRequests)

export default router
