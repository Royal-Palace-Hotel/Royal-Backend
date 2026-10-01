import { z } from 'zod'

const dateString = (label: string) =>
  z.string().refine(value => !Number.isNaN(Date.parse(value)), `Invalid ${label} date`)

const stayDates = {
  checkIn: dateString('check-in'),
  checkOut: dateString('check-out'),
}

const afterCheckIn = (data: { checkIn: string; checkOut: string }) =>
  Date.parse(data.checkOut) > Date.parse(data.checkIn)

const afterCheckInIssue = {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
}

export const bookingSchema = z.object({
  ...stayDates,
  guestName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().trim().email('Invalid email address'),
  guestPhone: z.string().trim().optional(),
  rooms: z.coerce.number().int().min(1, 'At least 1 room required'),
  adults: z.coerce.number().int().min(1, 'At least 1 adult required'),
  children: z.coerce.number().int().min(0, 'Children cannot be negative').default(0),
  // Optional: the booking page submits without a room when the guest has not
  // picked one, and the cheapest available room is then assigned.
  roomId: z.string().trim().min(1).optional(),
}).refine(afterCheckIn, afterCheckInIssue)

export const availabilitySchema = z.object({
  ...stayDates,
  rooms: z.coerce.number().int().min(1, 'At least 1 room required'),
  roomId: z.string().trim().min(1).optional(),
}).refine(afterCheckIn, afterCheckInIssue)
