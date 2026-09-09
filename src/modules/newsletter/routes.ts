import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { newsletterSchema } from './validation'
import { subscribe } from './controller'

const router = Router()

router.post('/', validate(newsletterSchema), subscribe)

export default router
