import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { resolve } from 'node:path'
import { errorHandler } from './middleware/errorHandler'

// Routes
import contentRoutes from './modules/content/routes'
import bookingRoutes from './modules/bookings/routes'
import contactRoutes from './modules/contact/routes'
import newsletterRoutes from './modules/newsletter/routes'
import authRoutes from './modules/auth/routes'
import adminRoutes from './modules/admin/routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3002']
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [...new Set([...defaultOrigins, ...configuredOrigins])]

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(resolve(process.cwd(), 'public/uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/content', contentRoutes)
app.use('/api/bookings', generalLimiter, bookingRoutes)
app.use('/api/contact', generalLimiter, contactRoutes)
app.use('/api/newsletter', generalLimiter, newsletterRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Royal Palace API server running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
})
