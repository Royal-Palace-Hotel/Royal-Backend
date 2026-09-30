import { z } from 'zod'

const idParam = z.object({ id: z.string().min(1) })
const optionalText = z.string().trim().nullable().optional()
const imageArray = z.array(z.string().trim().min(1).max(1024))
const amenityArray = z.array(z.string().trim().min(1).max(191))
const optionalCapacity = z.preprocess(
  (value) => value === '' || value === null ? null : value,
  z.coerce.number().int().positive().nullable(),
).optional()
const optionalPrice = z.preprocess(
  (value) => value === '' || value === null ? null : value,
  z.coerce.number().nonnegative().nullable(),
).optional()

export const roomSchema = z.object({
  slug: z.string().trim().min(1).max(191),
  translationKey: z.string().trim().min(1).max(191).optional(),
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().min(1).max(191),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().min(1).max(8),
  size: z.coerce.number().int().positive(),
  maxGuests: z.coerce.number().int().positive(),
  totalUnits: z.coerce.number().int().positive(),
  images: imageArray,
  amenities: amenityArray,
})

export const menuSectionSchema = z.object({
  title: z.string().trim().min(1).max(191),
  titleEn: z.string().trim().min(1).max(191),
  sortOrder: z.coerce.number().int(),
})

export const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().min(1).max(191),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  sectionId: z.string().trim().min(1).max(191),
  sortOrder: z.coerce.number().int(),
})

export const eventRoomSchema = z.object({
  key: z.string().trim().min(1).max(191).optional(),
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().min(1).max(191),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  image: z.string().trim().min(1).max(1024),
  capacity: optionalCapacity,
  schedule: optionalText,
  price: optionalPrice,
  currency: z.string().trim().max(8).nullable().optional(),
  sortOrder: z.coerce.number().int(),
})

export const bookingStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled']) })
export const contactStatusSchema = z.object({ status: z.enum(['new', 'read', 'replied', 'archived']) })
export const idSchema = idParam

export const bookingsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export const messagesQuerySchema = z.object({
  type: z.enum(['contact', 'event']).optional(),
  status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
})
