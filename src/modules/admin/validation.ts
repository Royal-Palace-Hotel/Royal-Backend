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
  nameEn: z.string().trim().max(191).optional(),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().optional(),
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
  titleEn: z.string().trim().max(191).optional(),
  sortOrder: z.coerce.number().int(),
})

export const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().max(191).optional(),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().optional(),
  price: z.coerce.number().nonnegative(),
  sectionId: z.string().trim().min(1).max(191),
  sortOrder: z.coerce.number().int(),
})

export const eventRoomSchema = z.object({
  key: z.string().trim().min(1).max(191).optional(),
  name: z.string().trim().min(1).max(191),
  nameEn: z.string().trim().max(191).optional(),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().optional(),
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
/* Disponibilité : périodes bloquées et saisie manuelle                */
/* ------------------------------------------------------------------ */

/** `YYYY-MM-DD` : le back-office ne manipule que des jours, jamais des heures. */
const dayString = (label: string) => z.string().trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} doit être une date au format AAAA-MM-JJ`)

export const roomBlockSchema = z.object({
  roomId: z.string().trim().min(1, 'Choisissez une chambre').max(191),
  startDate: dayString('Le début'),
  endDate: dayString('La fin'),
  units: z.coerce.number().int().min(1, 'Au moins une unité').max(999),
  reason: z.string().trim().max(191).nullable().optional(),
}).refine(
  (data) => Date.parse(data.endDate) > Date.parse(data.startDate),
  { message: 'La fin doit suivre le début', path: ['endDate'] },
)

export const roomBlocksQuerySchema = z.object({
  from: dayString('Le début').optional(),
  to: dayString('La fin').optional(),
})

/**
 * Réservation saisie au back-office (téléphone, comptoir).
 *
 * Deux différences avec le formulaire public : l'adresse e-mail est facultative
 * — on n'a pas toujours celle d'un client au téléphone — et une arrivée passée
 * est acceptée, pour pouvoir régulariser un séjour déjà commencé.
 */
export const manualBookingSchema = z.object({
  guestName: z.string().trim().min(2, 'Nom trop court').max(191),
  guestEmail: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().email('Adresse e-mail invalide').max(191).nullable().optional(),
  ),
  guestPhone: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(64).nullable().optional(),
  ),
  checkIn: dayString('L’arrivée'),
  checkOut: dayString('Le départ'),
  roomId: z.string().trim().min(1, 'Choisissez une chambre').max(191),
  rooms: z.coerce.number().int().min(1).max(10),
  adults: z.coerce.number().int().min(1, 'Au moins un adulte').max(40),
  children: z.coerce.number().int().min(0).max(40).default(0),
  status: z.enum(['pending', 'confirmed']).default('confirmed'),
}).refine(
  (data) => Date.parse(data.checkOut) > Date.parse(data.checkIn),
  { message: 'Le départ doit suivre l’arrivée', path: ['checkOut'] },
)

/* ------------------------------------------------------------------ */
/* Traduction FR → EN                                                  */
/* ------------------------------------------------------------------ */

/**
 * Dix champs au plus par appel : de quoi traduire un formulaire entier d'un
 * coup, sans ouvrir la porte à des lots qui videraient le quota mensuel.
 */
export const translateSchema = z.object({
  texts: z.array(z.string().trim().min(1).max(5000)).min(1).max(10),
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
