import { randomUUID } from 'node:crypto'
import { PoolConnection, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'
import {
  BookingRow,
  RoomAmenityRow,
  RoomImageRow,
  RoomRow,
} from '../../types/database'
import { mapRoom } from '../content/mapper'
import { sendBookingConfirmationToGuest, sendBookingEmail } from '../../utils/email'
import { countFreeUnits, getHotelAvailability } from './availability'

export interface BookingRecord {
  id: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  checkIn: Date
  checkOut: Date
  rooms: number
  adults: number
  children: number
  roomId: string
  status: BookingRow['status']
  source: BookingRow['source']
  createdAt: Date
  updatedAt: Date
  room: ReturnType<typeof mapRoom>
}

const ROOM_FIELDS =
  'id, slug, translation_key, name, name_en, description, description_en, price, currency, size, max_guests, total_units'

async function findRoom(roomId: string) {
  const [rows] = await pool.execute<RoomRow[]>(
    `SELECT ${ROOM_FIELDS} FROM rooms WHERE id = ? OR slug = ? OR translation_key = ? LIMIT 1`,
    [roomId, roomId, roomId],
  )
  return rows[0]
}

/**
 * Nombre de personnes à loger par chambre, pour écarter les catégories trop
 * petites. La réservation applique déjà ce filtre : sans lui ici, la recherche
 * pouvait annoncer « disponible » puis la réservation refuser faute de capacité.
 */
const guestsPerRoom = (guests: number | undefined, rooms: number) =>
  guests && guests > 0 ? Math.ceil(guests / rooms) : 1

export async function checkAvailability(input: {
  checkIn: string
  checkOut: string
  rooms: number
  roomId?: string
  adults?: number
  children?: number
}) {
  const checkIn = new Date(input.checkIn)
  const checkOut = new Date(input.checkOut)

  if (checkIn >= checkOut) {
    throw new AppError('Check-out date must be after check-in date', 400)
  }

  const guests = (input.adults ?? 0) + (input.children ?? 0)

  if (input.roomId) {
    const room = await findRoom(input.roomId)
    if (!room) throw new AppError('Room not found', 404)

    const { booked, blocked, free } = await countFreeUnits(
      pool, room.id, room.total_units, checkIn, checkOut,
    )
    // Une chambre libre mais trop petite n'est pas une chambre disponible.
    const fitsParty = guests === 0 || room.max_guests * input.rooms >= guests
    return {
      available: fitsParty && free >= input.rooms,
      availableRooms: free,
      requestedRooms: input.rooms,
      totalRooms: room.total_units,
      bookedRooms: booked,
      blockedRooms: blocked,
      fitsParty,
      maxGuests: room.max_guests,
      roomId: input.roomId,
    }
  }

  const hotel = await getHotelAvailability(checkIn, checkOut, guestsPerRoom(guests, input.rooms))
  return {
    available: hotel.free >= input.rooms,
    availableRooms: hotel.free,
    requestedRooms: input.rooms,
    totalRooms: hotel.total,
    bookedRooms: hotel.booked,
    blockedRooms: hotel.blocked,
    fitsParty: hotel.total > 0,
  }
}

async function getRoomContent(connection: PoolConnection, room: RoomRow) {
  const [images] = await connection.execute<RoomImageRow[]>(
    'SELECT room_id, image, sort_order FROM room_images WHERE room_id = ? ORDER BY sort_order',
    [room.id],
  )
  const [amenities] = await connection.execute<RoomAmenityRow[]>(
    'SELECT room_id, amenity, sort_order FROM room_amenities WHERE room_id = ? ORDER BY sort_order',
    [room.id],
  )
  return mapRoom(room, images, amenities)
}

export interface CreateBookingOptions {
  /** `admin` : saisie au back-office (téléphone, comptoir). */
  source?: 'website' | 'admin'
  /** Une réservation prise au téléphone est confirmée d'emblée. */
  status?: 'pending' | 'confirmed'
  /** Les e-mails ne partent que pour une demande venue du site. */
  notify?: boolean
}

/**
 * Crée une réservation en verrouillant le stock.
 *
 * Même chemin pour le site public et pour la saisie au back-office : c'est ici
 * que vit la protection contre la survente, elle ne doit pas être réécrite
 * ailleurs. Seuls le statut, la source et l'envoi d'e-mails changent.
 */
export async function createBooking(input: {
  guestName: string
  guestEmail?: string | null
  guestPhone?: string | null
  checkIn: string
  checkOut: string
  rooms: number
  adults: number
  children: number
  roomId?: string
}, options: CreateBookingOptions = {}) {
  const source = options.source ?? 'website'
  const status = options.status ?? 'pending'
  const notify = options.notify ?? source === 'website'

  const checkIn = new Date(input.checkIn)
  const checkOut = new Date(input.checkOut)
  if (checkIn >= checkOut) {
    throw new AppError('Check-out date must be after check-in date', 400)
  }

  const connection = await pool.getConnection()
  let transactionStarted = false
  let booking: BookingRecord

  try {
    await connection.beginTransaction()
    transactionStarted = true

    // Rows are locked FOR UPDATE so two concurrent bookings cannot both pass
    // the availability check and oversell the same room.
    let candidates: RoomRow[]
    if (input.roomId) {
      const [byId] = await connection.execute<RoomRow[]>(
        `SELECT ${ROOM_FIELDS} FROM rooms WHERE id = ? OR slug = ? OR translation_key = ? LIMIT 1 FOR UPDATE`,
        [input.roomId, input.roomId, input.roomId],
      )
      if (byId.length === 0) throw new AppError('Room not found', 404)
      candidates = byId
    } else {
      // No room chosen on the booking page: take the cheapest one that fits.
      const [all] = await connection.execute<RoomRow[]>(
        `SELECT ${ROOM_FIELDS} FROM rooms WHERE max_guests >= ? ORDER BY price ASC FOR UPDATE`,
        [Math.ceil((input.adults + input.children) / input.rooms)],
      )
      if (all.length === 0) throw new AppError('No room can accommodate this party size', 409)
      candidates = all
    }

    // Une chambre choisie explicitement doit pouvoir accueillir le groupe :
    // sans ce contrôle, on pouvait réserver une chambre de 2 pour 10 personnes.
    const guests = input.adults + input.children
    if (input.roomId) {
      const capacity = candidates[0].max_guests * input.rooms
      if (guests > capacity) {
        throw new AppError(
          `Cette chambre accueille ${candidates[0].max_guests} personne(s) ; `
          + `${input.rooms} chambre(s) ne suffisent pas pour ${guests} voyageur(s).`,
          400,
        )
      }
    }

    let room: RoomRow | undefined
    let availableRooms = 0
    for (const candidate of candidates) {
      const { free } = await countFreeUnits(
        connection, candidate.id, candidate.total_units, checkIn, checkOut,
      )
      if (free >= input.rooms) {
        room = candidate
        availableRooms = free
        break
      }
      if (!room) availableRooms = Math.max(availableRooms, free)
    }

    if (!room) {
      throw new AppError(
        input.roomId
          ? `Only ${availableRooms} room(s) available for the selected dates`
          : 'No rooms available for the selected dates',
        409,
      )
    }

    const id = randomUUID()
    await connection.execute(
      `INSERT INTO bookings (id, guest_name, guest_email, guest_phone, check_in, check_out,
       rooms_count, adults, children, room_id, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.guestName, input.guestEmail || null, input.guestPhone || null,
        checkIn, checkOut, input.rooms, input.adults, input.children, room.id, status, source,
      ],
    )
    const [bookingRows] = await connection.execute<BookingRow[]>(
      `SELECT id, guest_name, guest_email, guest_phone, check_in, check_out, rooms_count,
       adults, children, room_id, status, source, created_at, updated_at
       FROM bookings WHERE id = ?`,
      [id],
    )
    const inserted = bookingRows[0]
    const mappedRoom = await getRoomContent(connection, room)
    booking = {
      id: inserted.id,
      guestName: inserted.guest_name,
      guestEmail: inserted.guest_email,
      guestPhone: inserted.guest_phone,
      checkIn: inserted.check_in,
      checkOut: inserted.check_out,
      rooms: inserted.rooms_count,
      adults: inserted.adults,
      children: inserted.children,
      roomId: inserted.room_id,
      status: inserted.status,
      source: inserted.source,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
      room: mappedRoom,
    }
    await connection.commit()
    transactionStarted = false
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }
    throw error
  } finally {
    connection.release()
  }

  // Les envois ne doivent pas faire échouer une réservation déjà enregistrée :
  // `send` avale ses propres erreurs, et on n'attend pas l'un pour l'autre.
  // Une saisie du back-office n'en déclenche aucun : la réception a le client au
  // téléphone, et se prévenir elle-même n'aurait pas de sens.
  if (notify) {
    await Promise.all([
      sendBookingEmail(booking),
      sendBookingConfirmationToGuest(booking),
    ])
  }
  return booking
}