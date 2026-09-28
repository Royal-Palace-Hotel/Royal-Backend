import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../../config/db'
import { AdminUserRow } from '../../types/database'
import { AppError } from '../../middleware/errorHandler'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    // Find user
    const [users] = await pool.execute<AdminUserRow[]>(
      'SELECT id, email, password, role, created_at, updated_at FROM admin_users WHERE email = ? LIMIT 1',
      [email],
    )
    const user = users[0]

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role, adminInviteCode } = req.body

    // Verify admin invite code
    const validInviteCode = process.env.ADMIN_INVITE_CODE
    if (!validInviteCode || adminInviteCode !== validInviteCode) {
      throw new AppError('Invalid admin invite code', 403)
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute<AdminUserRow[]>(
      'SELECT id, email, password, role, created_at, updated_at FROM admin_users WHERE email = ? LIMIT 1',
      [email],
    )

    if (existingUsers.length > 0) {
      throw new AppError('User already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [id, email, hashedPassword, role],
    )
    const [users] = await pool.execute<AdminUserRow[]>(
      'SELECT id, email, password, role, created_at, updated_at FROM admin_users WHERE id = ? LIMIT 1',
      [id],
    )
    const user = users[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401)
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }

    req.user = decoded
    next()
  } catch (error) {
    next(new AppError('Invalid or expired token', 401))
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}
