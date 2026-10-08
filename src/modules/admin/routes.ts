import { Router } from 'express'
import { authMiddleware, ensureActiveUser, requireAdmin } from '../../middleware/authMiddleware'
import { validate } from '../../middleware/validate'
import { handleImageUpload } from './upload'
import * as controller from './controller'
import { deleteUpload, handleUpload, uploadErrorHandler, uploadMiddleware } from './uploads'
import { availabilityCalendarSchema } from '../bookings/validation'
import {
  adminUserCreateSchema, adminUserUpdateSchema, auditQuerySchema, bookingStatusSchema,
  bookingsQuerySchema, changePasswordSchema, contactStatusSchema, discoverItemSchema,
  discoverQuerySchema, eventRoomSchema, galleryImageSchema, galleryQuerySchema, idSchema,
  manualBookingSchema, menuItemSchema, menuSectionSchema, messagesQuerySchema, roomBlockSchema,
  roomBlocksQuerySchema, roomSchema, spaTreatmentSchema, subscribersQuerySchema, translateSchema,
} from './validation'

const router = Router()
const id = validate(idSchema, 'params')

<<<<<<< HEAD
router.post('/uploads', handleImageUpload, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose an image file to upload.' })
  res.status(201).json({ data: { path: `/uploads/${req.file.filename}` } })
})

=======
router.use(authMiddleware)
router.use(ensureActiveUser)

// Tableau de bord
router.get('/stats', controller.stats)

// Traduction FR → EN des champs du back-office. `GET` dit si le serveur sait la
// faire (clé DeepL configurée), `POST` traduit un lot de textes.
router.get('/translate', controller.translationStatus)
router.post('/translate', validate(translateSchema), controller.translate)

// Envoi d'images. Le corps est en multipart : `validate` (qui lit du JSON)
// ne s'applique pas ici, c'est multer qui filtre type et taille.
router.post('/uploads', uploadMiddleware, uploadErrorHandler, handleUpload)
router.delete('/uploads/:filename', deleteUpload)

// Chambres
>>>>>>> 94231c016bba1d428e09faf829daddaeeae4e86c
router.get('/rooms', controller.listRooms)
router.post('/rooms', validate(roomSchema), controller.createRoom)
router.get('/rooms/:id', id, controller.getRoom)
router.put('/rooms/:id', id, validate(roomSchema), controller.updateRoom)
router.delete('/rooms/:id', id, controller.deleteRoom)

// Carte du restaurant
router.get('/menu/sections', controller.listMenuSections)
router.post('/menu/sections', validate(menuSectionSchema), controller.createMenuSection)
router.put('/menu/sections/:id', id, validate(menuSectionSchema), controller.updateMenuSection)
router.delete('/menu/sections/:id', id, controller.deleteMenuSection)
router.get('/menu/items', controller.listMenuItems)
router.post('/menu/items', validate(menuItemSchema), controller.createMenuItem)
router.put('/menu/items/:id', id, validate(menuItemSchema), controller.updateMenuItem)
router.delete('/menu/items/:id', id, controller.deleteMenuItem)

// Salles de réunion
router.get('/event-rooms', controller.listEventRooms)
router.post('/event-rooms', validate(eventRoomSchema), controller.createEventRoom)
router.put('/event-rooms/:id', id, validate(eventRoomSchema), controller.updateEventRoom)
router.delete('/event-rooms/:id', id, controller.deleteEventRoom)

// Soins du spa
router.get('/spa', controller.listSpa)
router.post('/spa', validate(spaTreatmentSchema), controller.createSpa)
router.put('/spa/:id', id, validate(spaTreatmentSchema), controller.updateSpa)
router.delete('/spa/:id', id, controller.deleteSpa)

// Galerie photo
router.get('/gallery', validate(galleryQuerySchema, 'query'), controller.listGallery)
router.post('/gallery', validate(galleryImageSchema), controller.createGallery)
router.put('/gallery/:id', id, validate(galleryImageSchema), controller.updateGallery)
router.delete('/gallery/:id', id, controller.deleteGallery)

// Page « Découvrir »
router.get('/discover', validate(discoverQuerySchema, 'query'), controller.listDiscover)
router.post('/discover', validate(discoverItemSchema), controller.createDiscover)
router.put('/discover/:id', id, validate(discoverItemSchema), controller.updateDiscover)
router.delete('/discover/:id', id, controller.deleteDiscover)

// Disponibilité : tableau jour par jour et périodes bloquées.
router.get('/availability', validate(availabilityCalendarSchema, 'query'), controller.availability)
router.get('/room-blocks', validate(roomBlocksQuerySchema, 'query'), controller.listRoomBlocks)
router.post('/room-blocks', validate(roomBlockSchema), controller.createRoomBlock)
router.put('/room-blocks/:id', id, validate(roomBlockSchema), controller.updateRoomBlock)
router.delete('/room-blocks/:id', id, controller.deleteRoomBlock)

// Réservations — `/export` avant `/:id`, sinon il serait capturé comme un id.
router.get('/bookings', validate(bookingsQuerySchema, 'query'), controller.listBookings)
router.post('/bookings', validate(manualBookingSchema), controller.createManualBooking)
router.get('/bookings/export', validate(bookingsQuerySchema, 'query'), controller.exportBookings)
router.get('/bookings/:id', id, controller.getBooking)
router.patch('/bookings/:id', id, validate(bookingStatusSchema), controller.updateBookingStatus)

// Messages
router.get('/contact-messages', validate(messagesQuerySchema, 'query'), controller.listContactMessages)
router.get('/contact-messages/export', validate(messagesQuerySchema, 'query'), controller.exportContactMessages)
router.get('/contact-messages/:id', id, controller.getContactMessage)
router.patch('/contact-messages/:id', id, validate(contactStatusSchema), controller.updateContactStatus)
router.delete('/contact-messages/:id', id, controller.deleteContactMessage)

// Abonnés à la newsletter
router.get('/subscribers', validate(subscribersQuerySchema, 'query'), controller.listSubscribers)
router.get('/subscribers/export', controller.exportSubscribers)
router.delete('/subscribers/:id', id, controller.deleteSubscriber)

// Compte courant : accessible à tout utilisateur authentifié.
router.put('/account/password', validate(changePasswordSchema), controller.changePassword)

// Gestion des comptes et journal : réservés au rôle `admin`.
router.get('/users', requireAdmin, controller.listAdminUsers)
router.post('/users', requireAdmin, validate(adminUserCreateSchema), controller.createAdminUser)
router.put('/users/:id', requireAdmin, id, validate(adminUserUpdateSchema), controller.updateAdminUser)
router.delete('/users/:id', requireAdmin, id, controller.deleteAdminUser)
router.get('/audit-log', requireAdmin, validate(auditQuerySchema, 'query'), controller.auditLog)

export default router
