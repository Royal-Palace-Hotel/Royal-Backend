import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { roomSchema, roomUpdateSchema } from './validation.js'
import * as c from './controller.js'

const router = Router()
router.get('/', c.list)
router.get('/:id', c.getOne)
router.post('/', validate(roomSchema), c.create)
router.put('/:id', validate(roomUpdateSchema), c.update)
router.delete('/:id', c.remove)

export default router