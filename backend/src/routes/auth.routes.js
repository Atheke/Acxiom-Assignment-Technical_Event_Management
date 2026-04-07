import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'

const router = Router()

router.post('/signup', auth.signup)
router.post('/login', auth.login)
router.post('/logout', auth.logout)
router.get('/me', auth.me)

export default router
