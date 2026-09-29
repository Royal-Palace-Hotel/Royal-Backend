import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware'
import { validate } from '../../middleware/validate'
import * as controller from './controller'
import {
  bookingStatusSchema, bookingsQuerySchema, contactStatusSchema, eventRoomSchema, idSchema,
  menuItemSchema, menuSectionSchema, messagesQuerySchema, roomSchema,
} from './validation'

const router = Router()
router.use(authMiddleware)

router.get('/rooms', controller.listRooms)
router.post('/rooms', validate(roomSchema), controller.createRoom)
router.get('/rooms/:id', validate(idSchema, 'params'), controller.getRoom)
router.put('/rooms/:id', validate(idSchema, 'params'), validate(roomSchema), controller.updateRoom)
router.delete('/rooms/:id', validate(idSchema, 'params'), controller.deleteRoom)

router.get('/menu/sections', controller.listMenuSections)
router.post('/menu/sections', validate(menuSectionSchema), controller.createMenuSection)
router.put('/menu/sections/:id', validate(idSchema, 'params'), validate(menuSectionSchema), controller.updateMenuSection)
router.delete('/menu/sections/:id', validate(idSchema, 'params'), controller.deleteMenuSection)
router.get('/menu/items', controller.listMenuItems)
router.post('/menu/items', validate(menuItemSchema), controller.createMenuItem)
router.put('/menu/items/:id', validate(idSchema, 'params'), validate(menuItemSchema), controller.updateMenuItem)
router.delete('/menu/items/:id', validate(idSchema, 'params'), controller.deleteMenuItem)

router.get('/event-rooms', controller.listEventRooms)
router.post('/event-rooms', validate(eventRoomSchema), controller.createEventRoom)
router.put('/event-rooms/:id', validate(idSchema, 'params'), validate(eventRoomSchema), controller.updateEventRoom)
router.delete('/event-rooms/:id', validate(idSchema, 'params'), controller.deleteEventRoom)

router.get('/bookings', validate(bookingsQuerySchema, 'query'), controller.listBookings)
router.patch('/bookings/:id', validate(idSchema, 'params'), validate(bookingStatusSchema), controller.updateBookingStatus)
router.get('/contact-messages', validate(messagesQuerySchema, 'query'), controller.listContactMessages)
router.patch('/contact-messages/:id', validate(idSchema, 'params'), validate(contactStatusSchema), controller.updateContactStatus)

export default router
