import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
<<<<<<< HEAD
import { resolve } from 'node:path'
import { errorHandler } from './middleware/errorHandler'
=======
>>>>>>> 94231c016bba1d428e09faf829daddaeeae4e86c

import { ALLOWED_ORIGINS, IS_PRODUCTION, NODE_ENV, PORT, RATE_LIMIT_DISABLED } from './config/env'
import { assertDatabaseConnection, databaseName, pool } from './config/db'
import { AppError, errorHandler } from './middleware/errorHandler'

import { UPLOAD_DIR } from './modules/admin/uploads'
import contentRoutes from './modules/content/routes'
import restaurantRoutes from './modules/restaurant/routes'
import bookingRoutes from './modules/bookings/routes'
import contactRoutes from './modules/contact/routes'
import newsletterRoutes from './modules/newsletter/routes'
import authRoutes from './modules/auth/routes'
import adminRoutes from './modules/admin/routes'

const app = express()

// Needed for correct client IPs (and therefore rate limiting) behind a proxy.
if (IS_PRODUCTION) app.set('trust proxy', 1)

// Throttles the public write endpoints; generous enough for normal form use.
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
})

app.use(helmet())
app.use(cors({
  origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(resolve(process.cwd(), 'public/uploads')))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * Images envoyées depuis le back-office.
 *
 * `helmet()` pose par défaut `Cross-Origin-Resource-Policy: same-origin`, ce
 * qui empêcherait le front (autre origine) d'afficher ces fichiers : on relâche
 * cette règle pour ce seul dossier. Les fichiers sont inertes (images
 * uniquement, nom régénéré) et servis avec `X-Content-Type-Options: nosniff`,
 * donc jamais interprétés comme du code.
 */
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
)

// Public
app.use('/api/content', contentRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/bookings', publicWriteLimiter, bookingRoutes)
app.use('/api/contact', publicWriteLimiter, contactRoutes)
app.use('/api/newsletter', publicWriteLimiter, newsletterRoutes)

// Authentication
app.use('/api/auth', authRoutes)

// Authenticated admin area. Every route below /api/admin requires a token;
// no router may be mounted on the bare /api prefix, or it would intercept
// the public routes above as well.
app.use('/api/admin', adminRoutes)

app.use('/api', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
})

app.use(errorHandler)

async function start() {
  try {
    await assertDatabaseConnection()
    console.log(`🗄️  MySQL connected: ${databaseName}`)
  } catch (error) {
    console.error('❌ Could not connect to MySQL. Check DATABASE_URL in .env')
    console.error(`   ${(error as Error).message}`)
    process.exit(1)
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Royal Palace API running on http://localhost:${PORT}`)
    console.log(`📡 Environment: ${NODE_ENV}`)
  })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      server.close(() => {
        pool.end().finally(() => process.exit(0))
      })
    })
  }
}

start()

export default app
