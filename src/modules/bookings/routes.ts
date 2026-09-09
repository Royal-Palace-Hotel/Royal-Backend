import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { bookingSchema, availabilitySchema } from './validation'
import { checkAvailability, createBooking } from './controller'

const router = Router()

router.post('/availability', validate(availabilitySchema), checkAvailability)
router.post('/', validate(bookingSchema), createBooking)

export default router
