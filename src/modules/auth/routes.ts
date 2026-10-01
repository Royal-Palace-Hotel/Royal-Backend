import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middleware/validate'
import { authMiddleware } from '../../middleware/authMiddleware'
import { RATE_LIMIT_DISABLED } from '../../config/env'
import { loginSchema, registerSchema } from './validation'
import { login, me, register } from './controller'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => RATE_LIMIT_DISABLED,
})

router.post('/login', loginLimiter, validate(loginSchema), login)
router.post('/register', loginLimiter, validate(registerSchema), register)
router.get('/me', authMiddleware, me)

export default router
