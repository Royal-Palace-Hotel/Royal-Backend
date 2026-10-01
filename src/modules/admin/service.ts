import { randomUUID } from 'node:crypto'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'

interface AdminRow extends RowDataPacket {
  id: string
  [key: string]: any
}

async function translateToEnglish(value: string): Promise<string> {
  const trimmed = value?.trim() || ''
  if (!trimmed) return ''

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`,
      { signal: AbortSignal.timeout(1500) },
    )
    if (!response.ok) return trimmed
    const payload = await response.json() as any[]
    const translated = Array.isArray(payload) && Array.isArray(payload[0])
      ? payload[0].map((segment: any[]) => segment?.[0] || '').join('')
      : ''
    return translated.trim() || trimmed
  } catch {
    return trimmed
  }
}

async function ensureEnglishText(frenchText: string, englishText?: string | null) {
  const candidate = englishText?.trim() || ''
  if (candidate) return candidate
  return translateToEnglish(frenchText)
}

type RoomInput = {
  slug: string; translationKey?: string; name: string; nameEn?: string; description: string; descriptionEn?: string
  price: number; currency: string; size: number; maxGuests: number; totalUnits: number; images: string[]; amenities: string[]
}

async function roomRows() {
  const [rooms] = await pool.execute<AdminRow[]>(
    'SELECT id, slug, translation_key AS translationKey, name, name_en AS nameEn, description, description_en AS descriptionEn, price, currency, size, max_guests AS maxGuests, total_units AS totalUnits FROM rooms ORDER BY price, name',
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

async function writeRoom(input: RoomInput, id: string = randomUUID()) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const translationKey = input.translationKey || id
    const nameEn = await ensureEnglishText(input.name, input.nameEn)
    const descriptionEn = await ensureEnglishText(input.description, input.descriptionEn)
    await connection.execute(
      `INSERT INTO rooms (id, slug, translation_key, name, name_en, description, description_en, price, currency, size, max_guests, total_units)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE slug = VALUES(slug), translation_key = VALUES(translation_key), name = VALUES(name), name_en = VALUES(name_en),
       description = VALUES(description), description_en = VALUES(description_en), price = VALUES(price), currency = VALUES(currency),
       size = VALUES(size), max_guests = VALUES(max_guests), total_units = VALUES(total_units)`,
      [id, input.slug, translationKey, input.name, nameEn, input.description, descriptionEn, input.price, input.currency,
        input.size, input.maxGuests, input.totalUnits],
    )
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

export async function listMenuSections() {
  const [rows] = await pool.execute<AdminRow[]>(
    'SELECT id, title, title_en AS titleEn, sort_order AS sortOrder FROM menu_sections ORDER BY sort_order, title',
  )
  return rows
}
export async function saveMenuSection(input: { title: string; titleEn?: string; sortOrder: number }, id?: string) {
  const itemId = id || randomUUID()
  const titleEn = await ensureEnglishText(input.title, input.titleEn)
  await pool.execute(
    `INSERT INTO menu_sections (id, title, title_en, sort_order) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), title_en = VALUES(title_en), sort_order = VALUES(sort_order)`,
    [itemId, input.title, titleEn, input.sortOrder],
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
  name: string; nameEn?: string; description: string; descriptionEn?: string; price: number; sectionId: string; sortOrder: number
}, id?: string) {
  const itemId = id || randomUUID()
  const nameEn = await ensureEnglishText(input.name, input.nameEn)
  const descriptionEn = await ensureEnglishText(input.description, input.descriptionEn)
  await pool.execute(
    `INSERT INTO menu_items (id, name, name_en, description, description_en, price, sort_order, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), name_en = VALUES(name_en), description = VALUES(description),
     description_en = VALUES(description_en), price = VALUES(price), sort_order = VALUES(sort_order), section_id = VALUES(section_id)`,
    [itemId, input.name, nameEn, input.description, descriptionEn, input.price, input.sortOrder, input.sectionId],
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
  key?: string; name: string; nameEn?: string; description: string; descriptionEn?: string; image: string
  capacity?: number | null; schedule?: string | null; price?: number | null; currency?: string | null; sortOrder: number
}, id?: string) {
  const itemId = id || randomUUID()
  const nameEn = await ensureEnglishText(input.name, input.nameEn)
  const descriptionEn = await ensureEnglishText(input.description, input.descriptionEn)
  await pool.execute(
    `INSERT INTO event_rooms (id, \`key\`, name, name_en, description, description_en, image, capacity, schedule, price, currency, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE \`key\` = VALUES(\`key\`), name = VALUES(name), name_en = VALUES(name_en), description = VALUES(description),
     description_en = VALUES(description_en), image = VALUES(image), capacity = VALUES(capacity), schedule = VALUES(schedule),
     price = VALUES(price), currency = VALUES(currency), sort_order = VALUES(sort_order)`,
    [itemId, input.key || itemId, input.name, nameEn, input.description, descriptionEn, input.image,
      input.capacity ?? null, input.schedule ?? null, input.price ?? null, input.currency ?? null, input.sortOrder],
  )
  return (await listEventRooms()).find((row) => row.id === itemId)
}
export async function deleteEventRoom(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM event_rooms WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Event room not found', 404)
  return { id }
}

export async function listBookings(filters: { status?: string; from?: string; to?: string }) {
  const conditions: string[] = []
  const values: any[] = []
  if (filters.status) { conditions.push('b.status = ?'); values.push(filters.status) }
  if (filters.from) { conditions.push('b.check_in >= ?'); values.push(filters.from) }
  if (filters.to) { conditions.push('b.check_out <= ?'); values.push(filters.to) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT b.id, b.guest_name AS guestName, b.guest_email AS guestEmail, b.guest_phone AS guestPhone,
      b.check_in AS checkIn, b.check_out AS checkOut, b.rooms_count AS rooms, b.adults, b.children,
      b.room_id AS roomId, r.name AS roomName, b.status, b.created_at AS createdAt
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id ${where} ORDER BY b.created_at DESC`, values,
  )
  return rows
}
export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
  const [result] = await pool.execute<ResultSetHeader>('UPDATE bookings SET status = ? WHERE id = ?', [status, id])
  if (!result.affectedRows) throw new AppError('Booking not found', 404)
  return { id, status }
}

export async function listContactMessages(filters: { type?: string; status?: string }) {
  const conditions: string[] = []
  const values: any[] = []
  if (filters.type) { conditions.push('type = ?'); values.push(filters.type) }
  if (filters.status) { conditions.push('status = ?'); values.push(filters.status) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.execute<AdminRow[]>(
    `SELECT id, type, status, name, email, phone, subject, message, event_date AS eventDate,
      guest_count AS guestCount, created_at AS createdAt FROM contact_messages ${where} ORDER BY created_at DESC`, values,
  )
  return rows
}
export async function updateContactStatus(id: string, status: 'new' | 'read' | 'replied' | 'archived') {
  const [result] = await pool.execute<ResultSetHeader>('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id])
  if (!result.affectedRows) throw new AppError('Contact message not found', 404)
  return { id, status }
}
