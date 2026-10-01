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

/**
 * `z.coerce.boolean()` est inutilisable ici : `Boolean("false")` vaut `true`,
 * donc une case décochée envoyée en chaîne serait lue comme cochée.
 */
const booleanish = z.preprocess(
  (value) => typeof value === 'string' ? !/^(false|0|off|no|)$/i.test(value.trim()) : value,
  z.boolean(),
)

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

/** Champs de pagination, de recherche et de tri communs aux listes. */
const listQuery = {
  q: z.string().trim().max(191).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(200).optional(),
  order: z.enum(['asc', 'desc']).optional(),
}

export const bookingsQuerySchema = z.object({
  ...listQuery,
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  sort: z.enum(['createdAt', 'checkIn', 'checkOut', 'guestName', 'status']).optional(),
})

export const messagesQuerySchema = z.object({
  ...listQuery,
  type: z.enum(['contact', 'event']).optional(),
  status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
})

export const subscribersQuerySchema = z.object({ ...listQuery })

/* ------------------------------------------------------------------ */
/* Contenu : spa, galerie, Découvrir                                   */
/* ------------------------------------------------------------------ */

export const spaTreatmentSchema = z.object({
  key: z.string().trim().min(1).max(191).optional(),
  durationKey: z.string().trim().min(1).max(191).optional(),
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().min(1).max(191),
  duration: optionalText,
  durationEn: optionalText,
  description: optionalText,
  descriptionEn: optionalText,
  price: z.coerce.number().nonnegative(),
  isActive: booleanish.optional(),
  sortOrder: z.coerce.number().int(),
})

export const GALLERY_CATEGORIES = [
  'hero', 'rooms', 'restaurant', 'pool', 'spa', 'events', 'discover', 'gallery',
] as const

export const galleryImageSchema = z.object({
  src: z.string().trim().min(1).max(1024),
  alt: z.string().trim().min(1).max(500),
  altEn: z.string().trim().max(500).nullable().optional(),
  category: z.enum(GALLERY_CATEGORIES),
  sortOrder: z.coerce.number().int(),
})

export const galleryQuerySchema = z.object({
  category: z.enum(GALLERY_CATEGORIES).optional(),
})

export const discoverItemSchema = z.object({
  type: z.enum(['activity', 'attraction']).default('activity'),
  key: z.string().trim().max(191).nullable().optional(),
  title: z.string().trim().min(1).max(191),
  titleEn: z.string().trim().min(1).max(191),
  text: optionalText,
  textEn: optionalText,
  icon: z.string().trim().max(64).nullable().optional(),
  image: z.string().trim().max(1024).nullable().optional(),
  sortOrder: z.coerce.number().int(),
})

export const discoverQuerySchema = z.object({
  type: z.enum(['activity', 'attraction']).optional(),
})

/* ------------------------------------------------------------------ */
/* Comptes d'administration                                            */
/* ------------------------------------------------------------------ */

const password = z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères').max(200)

export const adminUserCreateSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide'),
  password,
  name: z.string().trim().max(191).nullable().optional(),
  role: z.enum(['admin', 'staff']).default('admin'),
})

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().max(191).nullable().optional(),
  role: z.enum(['admin', 'staff']).optional(),
  isActive: booleanish.optional(),
  password: password.optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: password,
})

export const auditQuerySchema = z.object({
  entity: z.string().trim().max(64).optional(),
  action: z.enum(['create', 'update', 'delete', 'login', 'status']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
})
