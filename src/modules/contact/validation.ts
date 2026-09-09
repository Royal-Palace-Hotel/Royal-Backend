import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const eventInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  eventDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid event date'),
  guestCount: z.string().refine(val => !isNaN(parseInt(val)), 'Invalid guest count'),
})
