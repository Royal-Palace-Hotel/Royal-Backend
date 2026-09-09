import { Request, Response, NextFunction } from 'express'
import prisma from '../../utils/db'
import { AppError } from '../../middleware/errorHandler'
import { sendBookingEmail } from '../../utils/email'

export async function checkAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { checkIn, checkOut, rooms, roomId } = req.body

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new AppError('Check-out date must be after check-in date', 400)
    }

    // If roomId is provided, check availability for specific room type
    if (roomId) {
      // Check if room exists
      const room = await prisma.room.findUnique({ where: { id: roomId } })
      if (!room) {
        throw new AppError('Room not found', 404)
      }

      // Check for overlapping bookings for this specific room type
      const overlappingBookings = await prisma.booking.count({
        where: {
          roomId,
          status: { in: ['pending', 'confirmed'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } },
              ],
            },
          ],
        },
      })

      const availableRooms = room.quantity - overlappingBookings
      const isAvailable = availableRooms >= rooms

      res.json({
        available: isAvailable,
        availableRooms,
        requestedRooms: rooms,
        totalRooms: room.quantity,
        roomId,
      })
    } else {
      // Global availability check (for initial search bar)
      // Check for overlapping bookings across all rooms
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['pending', 'confirmed'] },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } },
              ],
            },
          ],
        },
      })

      // Get total room count across all types
      const totalRooms = await prisma.room.aggregate({
        _sum: { quantity: true },
      })
      const totalRoomCount = totalRooms._sum.quantity || 0

      const bookedRooms = overlappingBookings.reduce((sum, booking) => sum + booking.rooms, 0)
      const availableRooms = totalRoomCount - bookedRooms

      const isAvailable = availableRooms >= rooms

      res.json({
        available: isAvailable,
        availableRooms,
        requestedRooms: rooms,
        totalRooms: totalRoomCount,
      })
    }
  } catch (error) {
    next(error)
  }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestName, guestEmail, guestPhone, checkIn, checkOut, rooms, adults, children, roomId } = req.body

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new AppError('Check-out date must be after check-in date', 400)
    }

    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) {
      throw new AppError('Room not found', 404)
    }

    // Check availability for specific room type
    const overlappingBookings = await prisma.booking.count({
      where: {
        roomId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } },
            ],
          },
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } },
            ],
          },
        ],
      },
    })

    const availableRooms = room.quantity - overlappingBookings
    if (availableRooms < rooms) {
      throw new AppError(`Only ${availableRooms} room(s) available for the selected dates`, 409)
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        guestName,
        guestEmail,
        guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms,
        adults,
        children,
        roomId,
      },
      include: {
        room: true,
      },
    })

    // Send email notification
    await sendBookingEmail(booking)

    res.status(201).json({
      message: 'Booking created successfully',
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}
