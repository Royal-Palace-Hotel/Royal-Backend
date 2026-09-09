import { z } from 'zod'

export const bookingSchema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().optional(),
  checkIn: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  checkOut: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  rooms: z.number().int().min(1, 'At least 1 room required'),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0, 'Children cannot be negative').default(0),
  roomId: z.string().min(1, 'Room ID is required'),
})

export const availabilitySchema = z.object({
  checkIn: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  checkOut: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  rooms: z.number().int().min(1, 'At least 1 room required'),
})
