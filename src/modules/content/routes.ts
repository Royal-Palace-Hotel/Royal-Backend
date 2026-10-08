import { Router } from 'express'
import { validate } from '../../middleware/validate'
import { availabilityCalendarSchema } from '../bookings/validation'
import { availabilityCalendar, getContent } from './controller'

const router = Router()

router.get('/rooms', getContent('rooms'))
router.get('/menu', getContent('menu'))
router.get('/spa', getContent('spa'))
router.get('/events', getContent('events'))
router.get('/gallery', getContent('gallery'))
router.get('/discover', getContent('discover'))

// Disponibilité jour par jour, pour afficher un calendrier côté site.
router.get('/availability', validate(availabilityCalendarSchema, 'query'), availabilityCalendar)

export default router
