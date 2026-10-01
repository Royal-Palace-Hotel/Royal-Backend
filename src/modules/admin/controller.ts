import { Request, Response, NextFunction, RequestHandler } from 'express'
import * as service from './service'
import * as content from './content'
import * as users from './users'
import { getDashboardStats } from './stats'
import { listAuditLog, recordAudit, AuditAction } from './audit'
import { csvFilename, toCsv } from './csv'

/** Enveloppe un handler : la valeur renvoyée part dans `{ data }`. */
function handle(operation: (req: Request) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    operation(req)
      .then((data) => res.json({ data }))
      .catch(next)
  }
}

/**
 * Comme `handle`, mais consigne l'action au journal d'administration une fois
 * l'opération réussie. L'identifiant tracé est celui de la ressource touchée.
 */
function audited(
  action: AuditAction,
  entity: string,
  operation: (req: Request) => Promise<any>,
  describe?: (req: Request, data: any) => string,
): RequestHandler {
  return (req, res, next) => {
    operation(req)
      .then(async (data) => {
        const entityId = data?.id ?? req.params.id ?? null
        await recordAudit(req, action, entity, entityId, describe?.(req, data))
        res.json({ data })
      })
      .catch(next)
  }
}

/** Les listes paginées renvoient `{ data, meta }`. */
function paginated(operation: (req: Request) => Promise<service.Paginated<unknown>>): RequestHandler {
  return (req, res, next) => {
    operation(req)
      .then(({ data, meta }) => res.json({ data, meta }))
      .catch(next)
  }
}

const listFilters = (req: Request) => req.query as unknown as service.ListFilters

function sendCsv(res: Response, base: string, body: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${csvFilename(base)}"`)
  res.send(body)
}

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

export const stats = handle(() => getDashboardStats())

/* ------------------------------------------------------------------ */
/* Chambres                                                            */
/* ------------------------------------------------------------------ */

export const listRooms = handle(() => service.listRooms())
export const getRoom = handle((req) => service.getRoom(String(req.params.id)))
export const createRoom = audited('create', 'room',
  (req) => service.createRoom(req.body), (req) => req.body.name)
export const updateRoom = audited('update', 'room',
  (req) => service.updateRoom(String(req.params.id), req.body), (req) => req.body.name)
export const deleteRoom = audited('delete', 'room', (req) => service.deleteRoom(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Carte du restaurant                                                 */
/* ------------------------------------------------------------------ */

export const listMenuSections = handle(() => service.listMenuSections())
export const createMenuSection = audited('create', 'menuSection',
  (req) => service.saveMenuSection(req.body), (req) => req.body.title)
export const updateMenuSection = audited('update', 'menuSection',
  (req) => service.saveMenuSection(req.body, String(req.params.id)), (req) => req.body.title)
export const deleteMenuSection = audited('delete', 'menuSection',
  (req) => service.deleteMenuSection(String(req.params.id)))

export const listMenuItems = handle(() => service.listMenuItems())
export const createMenuItem = audited('create', 'menuItem',
  (req) => service.saveMenuItem(req.body), (req) => req.body.name)
export const updateMenuItem = audited('update', 'menuItem',
  (req) => service.saveMenuItem(req.body, String(req.params.id)), (req) => req.body.name)
export const deleteMenuItem = audited('delete', 'menuItem',
  (req) => service.deleteMenuItem(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Salles de réunion                                                   */
/* ------------------------------------------------------------------ */

export const listEventRooms = handle(() => service.listEventRooms())
export const createEventRoom = audited('create', 'eventRoom',
  (req) => service.saveEventRoom(req.body), (req) => req.body.name)
export const updateEventRoom = audited('update', 'eventRoom',
  (req) => service.saveEventRoom(req.body, String(req.params.id)), (req) => req.body.name)
export const deleteEventRoom = audited('delete', 'eventRoom',
  (req) => service.deleteEventRoom(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Soins du spa                                                        */
/* ------------------------------------------------------------------ */

export const listSpa = handle(() => content.listSpaTreatments())
export const createSpa = audited('create', 'spaTreatment',
  (req) => content.saveSpaTreatment(req.body), (req) => req.body.name)
export const updateSpa = audited('update', 'spaTreatment',
  (req) => content.saveSpaTreatment(req.body, String(req.params.id)), (req) => req.body.name)
export const deleteSpa = audited('delete', 'spaTreatment',
  (req) => content.deleteSpaTreatment(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Galerie photo                                                       */
/* ------------------------------------------------------------------ */

export const listGallery = handle((req) => content.listGalleryImages(req.query.category as string | undefined))
export const createGallery = audited('create', 'galleryImage',
  (req) => content.saveGalleryImage(req.body), (req) => req.body.src)
export const updateGallery = audited('update', 'galleryImage',
  (req) => content.saveGalleryImage(req.body, String(req.params.id)), (req) => req.body.src)
export const deleteGallery = audited('delete', 'galleryImage',
  (req) => content.deleteGalleryImage(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Page « Découvrir »                                                  */
/* ------------------------------------------------------------------ */

export const listDiscover = handle((req) => content.listDiscoverItems(req.query.type as string | undefined))
export const createDiscover = audited('create', 'discoverItem',
  (req) => content.saveDiscoverItem(req.body), (req) => req.body.title)
export const updateDiscover = audited('update', 'discoverItem',
  (req) => content.saveDiscoverItem(req.body, String(req.params.id)), (req) => req.body.title)
export const deleteDiscover = audited('delete', 'discoverItem',
  (req) => content.deleteDiscoverItem(String(req.params.id)))

/* ------------------------------------------------------------------ */
/* Réservations                                                        */
/* ------------------------------------------------------------------ */

export const listBookings = paginated((req) => service.listBookings(listFilters(req)))
export const getBooking = handle((req) => service.getBooking(String(req.params.id)))
export const updateBookingStatus = audited('status', 'booking',
  (req) => service.updateBookingStatus(String(req.params.id), req.body.status),
  (req) => `statut → ${req.body.status}`)

export async function exportBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await service.listAllBookings(listFilters(req))
    sendCsv(res, 'reservations', toCsv(rows, [
      { header: 'Référence', value: (row) => row.id },
      { header: 'Client', value: (row) => row.guestName },
      { header: 'E-mail', value: (row) => row.guestEmail },
      { header: 'Téléphone', value: (row) => row.guestPhone },
      { header: 'Chambre', value: (row) => row.roomName },
      { header: 'Arrivée', value: (row) => row.checkIn },
      { header: 'Départ', value: (row) => row.checkOut },
      { header: 'Nuits', value: (row) => row.nights },
      { header: 'Chambres', value: (row) => row.rooms },
      { header: 'Adultes', value: (row) => row.adults },
      { header: 'Enfants', value: (row) => row.children },
      { header: 'Statut', value: (row) => row.status },
      { header: 'Créée le', value: (row) => row.createdAt },
    ]))
    await recordAudit(req, 'update', 'export', 'bookings', `${rows.length} ligne(s)`)
  } catch (error) {
    next(error)
  }
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export const listContactMessages = paginated((req) =>
  service.listContactMessages(listFilters(req)))
export const getContactMessage = handle((req) => service.getContactMessage(String(req.params.id)))
export const updateContactStatus = audited('status', 'contactMessage',
  (req) => service.updateContactStatus(String(req.params.id), req.body.status),
  (req) => `statut → ${req.body.status}`)
export const deleteContactMessage = audited('delete', 'contactMessage',
  (req) => service.deleteContactMessage(String(req.params.id)))

export async function exportContactMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await service.listAllContactMessages(listFilters(req))
    sendCsv(res, 'messages', toCsv(rows, [
      { header: 'Type', value: (row) => row.type },
      { header: 'Statut', value: (row) => row.status },
      { header: 'Nom', value: (row) => row.name },
      { header: 'E-mail', value: (row) => row.email },
      { header: 'Téléphone', value: (row) => row.phone },
      { header: 'Sujet', value: (row) => row.subject },
      { header: 'Message', value: (row) => row.message },
      { header: 'Date événement', value: (row) => row.eventDate },
      { header: 'Invités', value: (row) => row.guestCount },
      { header: 'Reçu le', value: (row) => row.createdAt },
    ]))
    await recordAudit(req, 'update', 'export', 'contactMessages', `${rows.length} ligne(s)`)
  } catch (error) {
    next(error)
  }
}

/* ------------------------------------------------------------------ */
/* Abonnés à la newsletter                                             */
/* ------------------------------------------------------------------ */

export const listSubscribers = paginated((req) => service.listSubscribers(listFilters(req)))
export const deleteSubscriber = audited('delete', 'subscriber',
  (req) => service.deleteSubscriber(String(req.params.id)))

export async function exportSubscribers(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await service.listAllSubscribers()
    sendCsv(res, 'abonnes-newsletter', toCsv(rows, [
      { header: 'E-mail', value: (row) => row.email },
      { header: 'Inscrit le', value: (row) => row.createdAt },
    ]))
    await recordAudit(req, 'update', 'export', 'subscribers', `${rows.length} ligne(s)`)
  } catch (error) {
    next(error)
  }
}

/* ------------------------------------------------------------------ */
/* Comptes d'administration                                            */
/* ------------------------------------------------------------------ */

export const listAdminUsers = handle(() => users.listAdminUsers())
export const createAdminUser = audited('create', 'adminUser',
  (req) => users.createAdminUser(req.body), (req) => `${req.body.email} (${req.body.role})`)
export const updateAdminUser = audited('update', 'adminUser',
  (req) => users.updateAdminUser(String(req.params.id), req.body, req.user!.userId))
export const deleteAdminUser = audited('delete', 'adminUser',
  (req) => users.deleteAdminUser(String(req.params.id), req.user!.userId))

export const changePassword = audited('update', 'account',
  (req) => users.changeOwnPassword(req.user!.userId, req.body.currentPassword, req.body.newPassword),
  () => 'mot de passe modifié')

/* ------------------------------------------------------------------ */
/* Journal des actions                                                 */
/* ------------------------------------------------------------------ */

export const auditLog = handle((req) => listAuditLog(req.query as {
  entity?: string; action?: string; limit?: number
}))
