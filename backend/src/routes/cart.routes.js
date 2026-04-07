import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.status(404).json({
    error: 'Cart is stored in the browser for this app. Use checkout and orders APIs.',
  })
})

export default router
