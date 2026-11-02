import { randomUUID } from 'node:crypto'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'
import { sendBookingDecisionToGuest } from '../../utils/email'

interface AdminRow extends RowDataPacket {
  id: string
  [key: string]: any
}

type RoomInput = {
  slug: string; translationKey?: string; name: string; nameEn: string; description: string; descriptionEn: string
  view?: string | null; viewEn?: string | null; bedType?: string | null; bedTypeEn?: string | null
  price: number; currency: string; size: number; maxGuests: number; totalUnits: number; images: string[]; amenities: string[]
}

async function roomRows() {
  const [rooms] = await pool.execute<AdminRow[]>(
    `SELECT id, slug, translation_key AS translationKey, name, name_en AS nameEn,
     description, description_en AS descriptionEn, view, view_en AS viewEn,
     bed_type AS bedType, bed_type_en AS bedTypeEn, price, currency, size,
     max_guests AS maxGuests, total_units AS totalUnits
     FROM rooms ORDER BY price, name`,
  )
  if (!rooms.length) return []
  const ids = rooms.map((room) => room.id)
  const placeholders = ids.map(() => '?').join(',')
  const [images] = await pool.execute<AdminRow[]>(
    `SELECT room_id AS roomId, image FROM room_images WHERE room_id IN (${placeholders}) ORDER BY room_id, sort_order`, ids,
  )
  const [amenities] = await pool.execute<AdminRow[]>(
    `SELECT room_id AS roomId, amenity FROM room_amenities WHERE room_id IN (${placeholders}) ORDER BY room_id, sort_order`, ids,
  )
  return rooms.map((room) => ({
    ...room,
    images: images.filter((image) => image.roomId === room.id).map((image) => image.image),
    amenities: amenities.filter((amenity) => amenity.roomId === room.id).map((amenity) => amenity.amenity),
  }))
}

export async function listRooms() { return roomRows() }

export async function getRoom(id: string) {
  const room = (await roomRows()).find((entry) => entry.id === id)
  if (!room) throw new AppError('Room not found', 404)
  return room
}

/**
 * `rooms.slug` porte une contrainte UNIQUE en plus de la clé primaire `id`.
 * Un upsert `ON DUPLICATE KEY UPDATE` se déclencherait donc aussi sur le slug :
 * créer une chambre avec un slug déjà pris écrasait silencieusement la chambre
 * existante. On sépare donc l'insertion de la mise à jour, et on laisse
 * MySQL remonter ER_DUP_ENTRY (traduit en 409 par le gestionnaire d'erreurs).
 */
async function writeRoom(input: RoomInput, existingId?: string) {
  const id = existingId ?? randomUUID()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const translationKey = input.translationKey || id
    const values = [input.slug, translationKey, input.name, input.nameEn, input.description,
      input.descriptionEn, input.view ?? null, input.viewEn ?? null,
      input.bedType ?? null, input.bedTypeEn ?? null,
      input.price, input.currency, input.size, input.maxGuests, input.totalUnits]

    if (existingId) {
      await connection.execute(
        `UPDATE rooms SET slug = ?, translation_key = ?, name = ?, name_en = ?, description = ?,
         description_en = ?, view = ?, view_en = ?, bed_type = ?, bed_type_en = ?,
         price = ?, currency = ?, size = ?, max_guests = ?, total_units = ?
         WHERE id = ?`,
        [...values, id],
      )
    } else {
      await connection.execute(
        `INSERT INTO rooms (slug, translation_key, name, name_en, description, description_en,
         view, view_en, bed_type, bed_type_en,
         price, currency, size, max_guests, total_units, id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...values, id],
      )
    }

    await connection.execute('DELETE FROM room_images WHERE room_id = ?', [id])
    await connection.execute('DELETE FROM room_amenities WHERE room_id = ?', [id])
    for (const [sortOrder, image] of input.images.entries()) {
      await connection.execute('INSERT INTO room_images (room_id, image, sort_order) VALUES (?, ?, ?)', [id, image, sortOrder])
    }
    for (const [sortOrder, amenity] of input.amenities.entries()) {
      await connection.execute('INSERT INTO room_amenities (room_id, amenity, sort_order) VALUES (?, ?, ?)', [id, amenity, sortOrder])
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  return getRoom(id)
}

export async function createRoom(input: RoomInput) { return writeRoom(input) }
export async function updateRoom(id: string, input: RoomInput) {
  await getRoom(id)
  return writeRoom(input, id)
}
export async function deleteRoom(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM rooms WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Room not found', 404)
  return { id }
}

/** Guards the ON DUPLICATE KEY upserts so an update to a missing row 404s. */
async function assertExists(table: 'menu_sections' | 'menu_items' | 'event_rooms', id: string, label: string) {
  const [rows] = await pool.execute<AdminRow[]>(`SELECT id FROM \`${table}\` WHERE id = ?`, [id])
  if (!rows.length) throw new AppError(`${label} not found`, 404)
}

export async function listMenuSections() {
  const [rows] = await pool.execute<AdminRow[]>(
    'SELECT id, title, title_en AS titleEn, sort_order AS sortOrder FROM menu_sections ORDER BY sort_order, title',
  )
  return rows
}
export async function saveMenuSection(input: { title: string; titleEn: string; sortOrder: number }, id?: string) {
  if (id) await assertExists('menu_sections', id, 'Menu section')
  const itemId = id || randomUUID()
  await pool.execute(
    `INSERT INTO menu_sections (id, title, title_en, sort_order) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), title_en = VALUES(title_en), sort_order = VALUES(sort_order)`,
    [itemId, input.title, input.titleEn, input.sortOrder],
  )
  return (await listMenuSections()).find((row) => row.id === itemId)
}
export async function deleteMenuSection(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM menu_sections WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Menu section not found', 404)
  return { id }
}
export async function listMenuItems() {
  const [rows] = await pool.execute<AdminRow[]>(
    'SELECT id, name, name_en AS nameEn, description, description_en AS descriptionEn, price, sort_order AS sortOrder, section_id AS sectionId FROM menu_items ORDER BY section_id, sort_order, name',
  )
  return rows
}
export async function saveMenuItem(input: {
  name: string; nameEn: string; description: string; descriptionEn: string; price: number; sectionId: string; sortOrder: number
}, id?: string) {
  if (id) await assertExists('menu_items', id, 'Menu item')
  const itemId = id || randomUUID()
  await pool.execute(
    `INSERT INTO menu_items (id, name, name_en, description, description_en, price, sort_order, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), name_en = VALUES(name_en), description = VALUES(description),
     description_en = VALUES(description_en), price = VALUES(price), sort_order = VALUES(sort_order), section_id = VALUES(section_id)`,
    [itemId, input.name, input.nameEn, input.description, input.descriptionEn, input.price, input.sortOrder, input.sectionId],
  )
  return (await listMenuItems()).find((row) => row.id === itemId)
}
export async function deleteMenuItem(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM menu_items WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Menu item not found', 404)
  return { id }
}

export async function listEventRooms() {
  const [rows] = await pool.execute<AdminRow[]>(
    'SELECT id, `key` AS `key`, name, name_en AS nameEn, description, description_en AS descriptionEn, image, capacity, schedule, price, currency, sort_order AS sortOrder FROM event_rooms ORDER BY sort_order, name',
  )
  return rows
}
export async function saveEventRoom(input: {
  key?: string; name: string; nameEn: string; description: string; descriptionEn: string; image: string
  capacity?: number | null; schedule?: string | null; price?: number | null; currency?: string | null; sortOrder: number
}, id?: string) {
  if (id) await assertExists('event_rooms', id, 'Event room')
  const itemId = id || randomUUID()
  // `event_rooms.key` est UNIQUE : comme pour les chambres, un upsert
  // écraserait la salle qui porte déjà cette clé. Insertion et mise à jour
  // sont donc séparées, et un doublon remonte en 409.
  const values = [input.key || itemId, input.name, input.nameEn, input.description, input.descriptionEn,
    input.image, input.capacity ?? null, input.schedule ?? null, input.price ?? null,
    input.currency ?? null, input.sortOrder]

  if (id) {
    await pool.execute(
      `UPDATE event_rooms SET \`key\` = ?, name = ?, name_en = ?, description = ?, description_en = ?,
       image = ?, capacity = ?, schedule = ?, price = ?, currency = ?, sort_order = ? WHERE id = ?`,
      [...values, itemId],
    )
  } else {
    await pool.execute(
      `INSERT INTO event_rooms (\`key\`, name, name_en, description, description_en, image,
       capacity, schedule, price, currency, sort_order, id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, itemId],
    )
  }
  return (await listEventRooms()).find((row) => row.id === itemId)
}
export async function deleteEventRoom(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM event_rooms WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Event room not found', 404)
  return { id }
}

export interface ListFilters {
  status?: string
  type?: string
  from?: string
  to?: string
  q?: string
  page?: number
  perPage?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface Paginated<T> {
  data: T[]
  meta: { page: number; perPage: number; total: number; totalPages: number }
}

/** Les colonnes triables sont listées en dur : `sort` arrive de la requête. */
const BOOKING_SORTS: Record<string, string> = {
  createdAt: 'b.created_at',
  checkIn: 'b.check_in',
  checkOut: 'b.check_out',
  guestName: 'b.guest_name',
  status: 'b.status',
}

function paginationFrom(filters: ListFilters) {
  const page = Math.max(filters.page ?? 1, 1)
  const perPage = Math.min(Math.max(filters.perPage ?? 25, 1), 200)
  return { page, perPage, offset: (page - 1) * perPage }
}

const BOOKING_FIELDS = `b.id, b.guest_name AS guestName, b.guest_email AS guestEmail,
  b.guest_phone AS guestPhone, b.check_in AS checkIn, b.check_out AS checkOut,
  b.rooms_count AS rooms, b.adults, b.children, b.room_id AS roomId,
  COALESCE(r.name, r.slug) AS roomName, r.price AS roomPrice, r.currency AS roomCurrency,
  b.status, b.source, b.created_at AS createdAt, b.updated_at AS updatedAt,
  DATEDIFF(b.check_out, b.check_in) AS nights`

function bookingWhere(filters: ListFilters) {
  const conditions: string[] = []
  const values: any[] = []
  if (filters.status) { conditions.push('b.status = ?'); values.push(filters.status) }
  if (filters.from) { conditions.push('b.check_in >= ?'); values.push(filters.from) }
  if (filters.to) { conditions.push('b.check_out <= ?'); values.push(filters.to) }
  if (filters.q) {
    conditions.push('(b.guest_name LIKE ? OR b.guest_email LIKE ? OR b.guest_phone LIKE ? OR b.id LIKE ?)')
    const like = `%${filters.q}%`
    values.push(like, like, like, like)
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

export async function listBookings(filters: ListFilters): Promise<Paginated<AdminRow>> {
  const { where, values } = bookingWhere(filters)
  const { page, perPage, offset } = paginationFrom(filters)
  const sortColumn = BOOKING_SORTS[filters.sort ?? 'createdAt'] ?? BOOKING_SORTS.createdAt
  const direction = filters.order === 'asc' ? 'ASC' : 'DESC'

  const [countRows] = await pool.execute<AdminRow[]>(
    `SELECT COUNT(*) AS total FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id ${where}`,
    values,
  )
  const total = Number(countRows[0]?.total ?? 0)

  // LIMIT/OFFSET interpolés : ce sont des entiers validés, et `execute`
  // (requête préparée) refuse de les recevoir en paramètres liés.
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${BOOKING_FIELDS}
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id ${where}
     ORDER BY ${sortColumn} ${direction} LIMIT ${perPage} OFFSET ${offset}`,
    values,
  )

  return {
    data: rows,
    meta: { page, perPage, total, totalPages: Math.max(Math.ceil(total / perPage), 1) },
  }
}

export async function getBooking(id: string) {
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${BOOKING_FIELDS}, r.slug AS roomSlug, r.max_guests AS roomMaxGuests
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id WHERE b.id = ? LIMIT 1`,
    [id],
  )
  const booking = rows[0]
  if (!booking) throw new AppError('Booking not found', 404)

  const nights = Number(booking.nights ?? 0)
  const price = Number(booking.roomPrice ?? 0)
  return {
    ...booking,
    estimatedTotal: Math.round(nights * price * Number(booking.rooms ?? 1) * 100) / 100,
  }
}

/** Toutes les réservations correspondant au filtre, sans pagination (export). */
export async function listAllBookings(filters: ListFilters) {
  const { where, values } = bookingWhere(filters)
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${BOOKING_FIELDS} FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id ${where}
     ORDER BY b.created_at DESC`,
    values,
  )
  return rows
}
export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
  // La réservation est relue avant l'écriture : il faut son ancien statut pour
  // décider d'une notification, et ses coordonnées pour la rédiger.
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT b.id, b.guest_name AS guestName, b.guest_email AS guestEmail,
            b.check_in AS checkIn, b.check_out AS checkOut,
            b.rooms_count AS rooms, b.adults, b.children, b.status,
            COALESCE(r.name, r.slug) AS roomName
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id WHERE b.id = ? LIMIT 1`,
    [id],
  )
  const booking = rows[0]
  if (!booking) throw new AppError('Booking not found', 404)

  await pool.execute<ResultSetHeader>('UPDATE bookings SET status = ? WHERE id = ?', [status, id])

  // Le client n'est prévenu qu'au véritable passage à « confirmée » ou
  // « annulée » : réappliquer le même statut (double clic, re-synchro) ne doit
  // pas lui renvoyer un second e-mail, et un retour en « en attente » est une
  // correction interne qui ne le concerne pas.
  const decided = booking.status !== status && (status === 'confirmed' || status === 'cancelled')
  if (!decided) {
    return { id, status, notification: 'not-due' as const }
  }

  // Un envoi raté ne doit pas faire échouer un changement déjà écrit en base :
  // `sendBookingDecisionToGuest` avale ses erreurs et renvoie un booléen. Le
  // back-office distingue les trois cas pour ne pas laisser croire qu'un
  // client a été prévenu alors que rien n'est parti.
  const sent = await sendBookingDecisionToGuest({ ...booking, status })
  return { id, status, notification: sent ? ('sent' as const) : ('failed' as const) }
}

const MESSAGE_FIELDS = `id, type, status, name, email, phone, subject, message,
  event_date AS eventDate, guest_count AS guestCount, created_at AS createdAt`

function messageWhere(filters: ListFilters) {
  const conditions: string[] = []
  const values: any[] = []
  if (filters.type) { conditions.push('type = ?'); values.push(filters.type) }
  if (filters.status) { conditions.push('status = ?'); values.push(filters.status) }
  if (filters.q) {
    conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)')
    const like = `%${filters.q}%`
    values.push(like, like, like, like)
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

export async function listContactMessages(
  filters: ListFilters & { type?: string },
): Promise<Paginated<AdminRow>> {
  const { where, values } = messageWhere(filters)
  const { page, perPage, offset } = paginationFrom(filters)

  const [countRows] = await pool.execute<AdminRow[]>(
    `SELECT COUNT(*) AS total FROM contact_messages ${where}`, values,
  )
  const total = Number(countRows[0]?.total ?? 0)

  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${MESSAGE_FIELDS} FROM contact_messages ${where}
     ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
    values,
  )

  return {
    data: rows,
    meta: { page, perPage, total, totalPages: Math.max(Math.ceil(total / perPage), 1) },
  }
}

export async function getContactMessage(id: string) {
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${MESSAGE_FIELDS} FROM contact_messages WHERE id = ? LIMIT 1`, [id],
  )
  if (!rows[0]) throw new AppError('Contact message not found', 404)
  return rows[0]
}

export async function listAllContactMessages(filters: ListFilters & { type?: string }) {
  const { where, values } = messageWhere(filters)
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT ${MESSAGE_FIELDS} FROM contact_messages ${where} ORDER BY created_at DESC`, values,
  )
  return rows
}

export async function deleteContactMessage(id: string) {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM contact_messages WHERE id = ?', [id],
  )
  if (!result.affectedRows) throw new AppError('Contact message not found', 404)
  return { id }
}

/* ------------------------------------------------------------------ */
/* Abonnés à la newsletter                                             */
/* ------------------------------------------------------------------ */

export async function listSubscribers(filters: ListFilters): Promise<Paginated<AdminRow>> {
  const { page, perPage, offset } = paginationFrom(filters)
  const where = filters.q ? 'WHERE email LIKE ?' : ''
  const values = filters.q ? [`%${filters.q}%`] : []

  const [countRows] = await pool.execute<AdminRow[]>(
    `SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`, values,
  )
  const total = Number(countRows[0]?.total ?? 0)

  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT id, email, created_at AS createdAt FROM newsletter_subscribers ${where}
     ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
    values,
  )

  return {
    data: rows,
    meta: { page, perPage, total, totalPages: Math.max(Math.ceil(total / perPage), 1) },
  }
}

export async function listAllSubscribers() {
  const [rows] = await pool.execute<AdminRow[]>(
    'SELECT id, email, created_at AS createdAt FROM newsletter_subscribers ORDER BY created_at DESC',
  )
  return rows
}

export async function deleteSubscriber(id: string) {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM newsletter_subscribers WHERE id = ?', [id],
  )
  if (!result.affectedRows) throw new AppError('Subscriber not found', 404)
  return { id }
}
export async function updateContactStatus(id: string, status: 'new' | 'read' | 'replied' | 'archived') {
  const [result] = await pool.execute<ResultSetHeader>('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id])
  if (!result.affectedRows) throw new AppError('Contact message not found', 404)
  return { id, status }
}
