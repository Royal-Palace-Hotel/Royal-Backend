import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import pool from '../../config/db'
import { ADMIN_INVITE_CODE } from '../../config/env'
import { AdminUserRow } from '../../types/database'
import { AppError } from '../../middleware/errorHandler'
import { recordAudit } from '../admin/audit'
import { issueToken } from './token'

<<<<<<< HEAD
export const JWT_SECRET = process.env.JWT_SECRET || 'LOCAL_DEV_ONLY_CHANGE_BEFORE_PRODUCTION'
=======
const ADMIN_FIELDS = 'id, email, password, name, role, is_active, token_version, created_at, updated_at'
>>>>>>> 94231c016bba1d428e09faf829daddaeeae4e86c

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body.email).trim().toLowerCase()
    const { password } = req.body

    const [users] = await pool.execute<AdminUserRow[]>(
      `SELECT ${ADMIN_FIELDS} FROM admin_users WHERE email = ? LIMIT 1`,
      [email],
    )
    const user = users[0]

    // Same message either way, so the response cannot be used to enumerate accounts.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401)
    }

    // A deactivated account keeps its password but can no longer sign in.
    if (user.is_active === 0) {
      throw new AppError('This account has been deactivated', 403)
    }

    await pool.execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [user.id])
    await recordAudit(
      { ...req, user: { userId: user.id, email: user.email, role: user.role } } as Request,
      'login', 'account', user.id, null,
    )

    res.json({
      message: 'Login successful',
      data: {
        token: issueToken(user),
        user: { id: user.id, email: user.email, role: user.role },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body.email).trim().toLowerCase()
    const { password, role, adminInviteCode } = req.body

    if (!ADMIN_INVITE_CODE || adminInviteCode !== ADMIN_INVITE_CODE) {
      throw new AppError('Invalid admin invite code', 403)
    }

    const [existing] = await pool.execute<AdminUserRow[]>(
      'SELECT id FROM admin_users WHERE email = ? LIMIT 1',
      [email],
    )
    if (existing.length > 0) {
      throw new AppError('User already exists', 409)
    }

    const id = randomUUID()
    await pool.execute(
      'INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [id, email, await bcrypt.hash(password, 10), role],
    )

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        token: issueToken({ id, email, role }),
        user: { id, email, role },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const [users] = await pool.execute<AdminUserRow[]>(
      'SELECT id, email, name, role, is_active, last_login_at FROM admin_users WHERE id = ? LIMIT 1',
      [req.user!.userId],
    )
    const user = users[0]
    if (!user) throw new AppError('Account no longer exists', 401)
    if (user.is_active === 0) throw new AppError('This account has been deactivated', 403)

    res.json({
      data: {
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLoginAt: user.last_login_at,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
