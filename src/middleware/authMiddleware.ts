import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { JWT_SECRET } from '../modules/auth/controller'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401)
    }

    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string }
    }
  }
}
