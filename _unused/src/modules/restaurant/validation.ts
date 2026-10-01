import { z } from 'zod'

export const menuSectionSchema = z.object({
  title: z.string().min(1).max(191),
  titleEn: z.string().min(1).max(191),
  sortOrder: z.number().int().min(0),
})

export const menuItemSchema = z.object({
  name: z.string().min(1).max(191),
  nameEn: z.string().min(1).max(191),
  description: z.string().min(1),
  descriptionEn: z.string().min(1),
  price: z.number().min(0),
  sectionId: z.string().min(1).max(191),
  sortOrder: z.number().int().min(0),
})