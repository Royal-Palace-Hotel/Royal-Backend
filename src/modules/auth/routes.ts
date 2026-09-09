import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middleware/validate'
import { loginSchema, registerSchema } from './validation'
import { login, register, authenticate } from './controller'

const router = Router()

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, validate(loginSchema), login)
router.post('/register', validate(registerSchema), register)

// Protected routes (for future admin CRUD)
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

export default router
