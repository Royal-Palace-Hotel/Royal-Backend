import { randomUUID } from 'node:crypto'
import pool from '../../config/db'
import { ContactMessageRow } from '../../types/database'

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  createdAt: Date
}

export interface EventInquiry extends ContactMessage {
  eventDate: Date
  guestCount: number
}

function mapContact(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  }
}

export async function createContactMessage(input: {
  name: string
  email: string
  phone: string
  subject?: string
  message: string
}) {
  const id = randomUUID()
  await pool.execute(
    'INSERT INTO contact_messages (id, type, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, 'contact', input.name, input.email, input.phone, input.subject ?? null, input.message],
  )
  const [rows] = await pool.execute<ContactMessageRow[]>(
    'SELECT id, type, status, name, email, phone, subject, message, event_date, guest_count, created_at FROM contact_messages WHERE id = ?',
    [id],
  )
  return mapContact(rows[0])
}

export async function createEventInquiry(input: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  eventDate: string
  guestCount: string
}) {
  const id = randomUUID()
  await pool.execute(
    'INSERT INTO contact_messages (id, type, name, email, phone, subject, message, event_date, guest_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, 'event', input.name, input.email, input.phone ?? null, input.subject ?? null, input.message, new Date(input.eventDate), Number.parseInt(input.guestCount, 10)],
  )
  const [rows] = await pool.execute<ContactMessageRow[]>(
    'SELECT id, type, status, name, email, phone, subject, message, event_date, guest_count, created_at FROM contact_messages WHERE id = ?',
    [id],
  )
  const row = rows[0]
  return {
    ...mapContact(row),
    eventDate: row.event_date as Date,
    guestCount: row.guest_count as number,
  } satisfies EventInquiry
}