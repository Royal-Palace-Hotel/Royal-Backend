import jwt from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config/env'

/**
 * Signe un jeton de session.
 *
 * `tv` porte la version de mot de passe du compte. `ensureActiveUser` la
 * compare à celle enregistrée en base : tout changement de mot de passe
 * incrémente le compteur et invalide donc les jetons déjà émis.
 */
export function issueToken(user: {
  id: string
  email: string
  role: string
  token_version?: number
}) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tv: user.token_version ?? 0,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  )
}
