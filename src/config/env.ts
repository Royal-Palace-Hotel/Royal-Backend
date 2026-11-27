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

/** Resend email delivery is optional; without all three values, emails are skipped. */
export const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim()
export const MAIL_FROM = (process.env.MAIL_FROM || '').trim()
export const MAIL_TO = (process.env.MAIL_TO || '').trim()

/**
 * Traduction française → anglaise des champs du back-office (DeepL).
 *
 * Optionnel : sans clé, les champs « (EN) » se remplissent à la main comme
 * avant, et le back-office masque simplement la proposition automatique.
 *
 * Les clés de l'offre gratuite se terminent par « :fx » et visent un autre
 * domaine que les clés payantes. On le déduit de la clé plutôt que de le faire
 * configurer : interverti, DeepL répond un 403 difficile à relier à sa cause.
 */
export const DEEPL_API_KEY = (process.env.DEEPL_API_KEY || '').trim()
export const DEEPL_API_URL = process.env.DEEPL_API_URL || (DEEPL_API_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate')

/** DeepL exige une variante pour l'anglais : `EN-GB` ou `EN-US`. */
export const DEEPL_TARGET_LANG = process.env.DEEPL_TARGET_LANG || 'EN-GB'

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
