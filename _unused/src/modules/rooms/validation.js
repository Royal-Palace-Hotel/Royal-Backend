import { z } from 'zod'

export const roomSchema = z.object({
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Minuscules, chiffres et tirets uniquement'),
  translationKey: z.string().trim().min(1),
  price: z.number().positive(),
  currency: z.string().trim().length(3).default('EUR'),
  size: z.number().int().positive(),
  maxGuests: z.number().int().min(1),
  totalUnits: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  images: z.array(z.string().min(1)).default([]),
  amenities: z.array(z.string().min(1)).default([]),
})

// Pour PUT : tous les champs optionnels, sans valeurs par défaut
export const roomUpdateSchema = z.object({
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/).optional(),
  translationKey: z.string().trim().min(1).optional(),
  price: z.number().positive().optional(),
  currency: z.string().trim().length(3).optional(),
  size: z.number().int().positive().optional(),
  maxGuests: z.number().int().min(1).optional(),
  totalUnits: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string().min(1)).optional(),
  amenities: z.array(z.string().min(1)).optional(),
})