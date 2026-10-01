import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required (check your .env file)`)
  }
  return value
}

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const PORT = Number(process.env.PORT || 4000)

export const DATABASE_URL = required('DATABASE_URL')

// A weak fallback is only tolerable outside production: in production an unset
// secret would silently let every previously issued token stay valid.
export const JWT_SECRET = IS_PRODUCTION
  ? required('JWT_SECRET')
  : process.env.JWT_SECRET || 'dev-only-insecure-secret'

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Registration is closed unless an invite code is configured.
export const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || ''

/**
 * Désactive les limites de débit, pour pouvoir rejouer la suite de tests
 * plusieurs fois d'affilée. Ignoré en production, où la protection est
 * toujours active.
 */
export const RATE_LIMIT_DISABLED =
  !IS_PRODUCTION && /^(1|true|yes)$/i.test(process.env.DISABLE_RATE_LIMIT || '')

export const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@royalpalaceantsirabe.com'
export const HOTEL_EMAIL = process.env.HOTEL_EMAIL || 'royalpalace.resa@moov.mg'

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3002',
]

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export const ALLOWED_ORIGINS = IS_PRODUCTION
  ? configuredOrigins
  : [...new Set([...DEFAULT_ORIGINS, ...configuredOrigins])]
