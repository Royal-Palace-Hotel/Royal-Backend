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

/** Bornes de bon sens : elles écartent les saisies absurdes et les robots. */
export const MAX_NIGHTS = 90
export const MAX_ROOMS_PER_BOOKING = 10
export const MAX_GUESTS_PER_BOOKING = 40

const DAY = 24 * 60 * 60 * 1000

/**
 * Minuit UTC du jour courant.
 *
 * On compare en jours, pas en instants : une arrivée « aujourd'hui » reste
 * valable toute la journée. Madagascar étant à UTC+3, cette borne est au pire
 * indulgente de quelques heures — ce qui vaut mieux que de refuser une
 * réservation du jour.
 */
const todayUtc = () => {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

const notInThePast = (data: { checkIn: string }) => Date.parse(data.checkIn) >= todayUtc()

const notInThePastIssue = {
  message: 'Check-in date cannot be in the past',
  path: ['checkIn'],
}

const withinMaxStay = (data: { checkIn: string; checkOut: string }) =>
  (Date.parse(data.checkOut) - Date.parse(data.checkIn)) / DAY <= MAX_NIGHTS

const withinMaxStayIssue = {
  message: `A stay cannot exceed ${MAX_NIGHTS} nights`,
  path: ['checkOut'],
}

const partyFits = (data: { adults: number; children: number }) =>
  data.adults + data.children <= MAX_GUESTS_PER_BOOKING

const partyFitsIssue = {
  message: `A single booking cannot exceed ${MAX_GUESTS_PER_BOOKING} guests`,
  path: ['adults'],
}

export const bookingSchema = z.object({
  ...stayDates,
  guestName: z.string().trim().min(2, 'Name must be at least 2 characters').max(191),
  guestEmail: z.string().trim().email('Invalid email address').max(191),
  guestPhone: z.string().trim().max(64).optional(),
  rooms: z.coerce.number().int().min(1, 'At least 1 room required').max(MAX_ROOMS_PER_BOOKING),
  adults: z.coerce.number().int().min(1, 'At least 1 adult required').max(MAX_GUESTS_PER_BOOKING),
  children: z.coerce.number().int().min(0, 'Children cannot be negative')
    .max(MAX_GUESTS_PER_BOOKING).default(0),
  // Optional: the booking page submits without a room when the guest has not
  // picked one, and the cheapest available room is then assigned.
  roomId: z.string().trim().min(1).optional(),
})
  .refine(afterCheckIn, afterCheckInIssue)
  .refine(notInThePast, notInThePastIssue)
  .refine(withinMaxStay, withinMaxStayIssue)
  .refine(partyFits, partyFitsIssue)

// La disponibilité est consultable sur n'importe quelle période, y compris
// passée : c'est une lecture, elle n'engage rien.
export const availabilitySchema = z.object({
  ...stayDates,
  rooms: z.coerce.number().int().min(1, 'At least 1 room required').max(MAX_ROOMS_PER_BOOKING),
  roomId: z.string().trim().min(1).optional(),
})
  .refine(afterCheckIn, afterCheckInIssue)
  .refine(withinMaxStay, withinMaxStayIssue)
