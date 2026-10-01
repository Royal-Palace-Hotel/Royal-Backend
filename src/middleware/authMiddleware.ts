import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { JWT_SECRET } from '../config/env'
import pool from '../config/db'
import { AdminUserRow } from '../types/database'

export interface AuthUser {
  userId: string
  email: string
  role: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401))
  }

  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthUser
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

/** Restricts a route to the `admin` role; must run after authMiddleware. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Administrator access required', 403))
  }
  next()
}

/**
 * Vérifie que le compte porté par le jeton existe toujours et reste actif.
 *
 * Sans ce contrôle, désactiver un compte ne prendrait effet qu'à l'expiration
 * de son jeton (7 jours par défaut). Le coût est une lecture sur clé primaire
 * par requête d'administration.
 */
export async function ensureActiveUser(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await pool.execute<AdminUserRow[]>(
      'SELECT id, role, is_active FROM admin_users WHERE id = ? LIMIT 1',
      [req.user!.userId],
    )
    const user = rows[0]
    if (!user) return next(new AppError('Account no longer exists', 401))
    if (user.is_active === 0) return next(new AppError('This account has been deactivated', 403))

    // Le rôle de la base prime sur celui du jeton : une rétrogradation
    // s'applique immédiatement.
    req.user!.role = user.role
    next()
  } catch (error) {
    next(error)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}
