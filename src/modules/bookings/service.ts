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
import { sendBookingEmail } from '../../utils/email'

interface RoomAggregateRow extends RowDataPacket {
  total_rooms: number | string
  booked_rooms: number | string
}

interface BookedRoomsRow extends RowDataPacket {
  booked_rooms: number | string
}

export interface BookingRecord {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  checkIn: Date
  checkOut: Date
  rooms: number
  adults: number
  children: number
  roomId: string
  status: BookingRow['status']
  createdAt: Date
  updatedAt: Date
  room: ReturnType<typeof mapRoom>
}

async function findRoom(roomId: string) {
  const [rows] = await pool.execute<RoomRow[]>(
    'SELECT id, slug, translation_key, price, currency, size, max_guests, total_units FROM rooms WHERE id = ? OR slug = ? OR translation_key = ? LIMIT 1',
    [roomId, roomId, roomId],
  )
  return rows[0]
}

async function sumBookedUnits(executor: PoolConnection | typeof pool, roomId: string | null, checkIn: Date, checkOut: Date) {
  const roomClause = roomId === null ? '' : 'room_id = ? AND '
  const parameters = roomId === null
    ? ['pending', 'confirmed', checkOut, checkIn]
    : [roomId, 'pending', 'confirmed', checkOut, checkIn]
  const [rows] = await executor.execute<BookedRoomsRow[]>(
    `SELECT COALESCE(SUM(rooms_count), 0) AS booked_rooms FROM bookings WHERE ${roomClause}status IN (?, ?) AND check_in < ? AND check_out > ?`,
    parameters,
  )
  return Number(rows[0].booked_rooms)
}

export async function checkAvailability(input: {
  checkIn: string
  checkOut: string
  rooms: number
  roomId?: string
}) {
  const checkIn = new Date(input.checkIn)
  const checkOut = new Date(input.checkOut)

  if (checkIn >= checkOut) {
    throw new AppError('Check-out date must be after check-in date', 400)
  }

  if (input.roomId) {
    const room = await findRoom(input.roomId)
    if (!room) throw new AppError('Room not found', 404)

    const bookedRooms = await sumBookedUnits(pool, room.id, checkIn, checkOut)
    const availableRooms = room.total_units - bookedRooms
    return {
      available: availableRooms >= input.rooms,
      availableRooms,
      requestedRooms: input.rooms,
      totalRooms: room.total_units,
      roomId: input.roomId,
    }
  }

  const bookedRooms = await sumBookedUnits(pool, null, checkIn, checkOut)
  const [totals] = await pool.execute<RoomAggregateRow[]>(
    'SELECT COALESCE(SUM(total_units), 0) AS total_rooms FROM rooms',
  )
  const totalRooms = Number(totals[0].total_rooms)
  const availableRooms = totalRooms - bookedRooms
  return {
    available: availableRooms >= input.rooms,
    availableRooms,
    requestedRooms: input.rooms,
    totalRooms,
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

export async function createBooking(input: {
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  rooms: number
  adults: number
  children: number
  roomId: string
}) {
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

    let [rooms] = await connection.execute<RoomRow[]>(
      'SELECT id, slug, translation_key, price, currency, size, max_guests, total_units FROM rooms WHERE id = ? FOR UPDATE',
      [input.roomId],
    )
    if (rooms.length === 0) {
      [rooms] = await connection.execute<RoomRow[]>(
        'SELECT id, slug, translation_key, price, currency, size, max_guests, total_units FROM rooms WHERE slug = ? OR translation_key = ? LIMIT 1 FOR UPDATE',
        [input.roomId, input.roomId],
      )
    }
    const room = rooms[0]
    if (!room) throw new AppError('Room not found', 404)

    const bookedRooms = await sumBookedUnits(connection, room.id, checkIn, checkOut)
    const availableRooms = room.total_units - bookedRooms
    if (availableRooms < input.rooms) {
      throw new AppError(`Only ${availableRooms} room(s) available for the selected dates`, 409)
    }

    const id = randomUUID()
    await connection.execute(
      'INSERT INTO bookings (id, guest_name, guest_email, guest_phone, check_in, check_out, rooms_count, adults, children, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, input.guestName, input.guestEmail, input.guestPhone ?? null, checkIn, checkOut, input.rooms, input.adults, input.children, room.id],
    )
    const [bookingRows] = await connection.execute<BookingRow[]>(
      'SELECT id, guest_name, guest_email, guest_phone, check_in, check_out, rooms_count, adults, children, room_id, status, created_at, updated_at FROM bookings WHERE id = ?',
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

  await sendBookingEmail(booking)
  return booking
}