import { Router } from 'express'
import { getContent } from './controller'

const router = Router()

router.get('/rooms', getContent('rooms'))
router.get('/menu', getContent('menu'))
router.get('/spa', getContent('spa'))
router.get('/events', getContent('events'))
router.get('/gallery', getContent('gallery'))
router.get('/discover', getContent('discover'))

export default router
