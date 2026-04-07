import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import { corsDynamicOrigin } from './constants.js'
import adminRoutes from './routes/admin.routes.js'
import authRoutes from './routes/auth.routes.js'
import cartRoutes from './routes/cart.routes.js'
import productRoutes from './routes/product.routes.js'
import requestRoutes from './routes/request.routes.js'
import userRoutes from './routes/user.routes.js'
import vendorRoutes from './routes/vendor.routes.js'

const app = express()

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: corsDynamicOrigin,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/vendor', productRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api/vendor', requestRoutes)
app.use('/api/cart', cartRoutes)

export default app
