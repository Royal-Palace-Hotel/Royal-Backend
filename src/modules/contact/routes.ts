import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { contactSchema, eventInquirySchema } from './validation'
import { createContactMessage, createEventInquiry } from './controller'

const router = Router()

router.post('/', validate(contactSchema), createContactMessage)
router.post('/event-inquiry', validate(eventInquirySchema), createEventInquiry)

export default router
