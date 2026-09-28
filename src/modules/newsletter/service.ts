import { randomUUID } from 'node:crypto'
import { ResultSetHeader } from 'mysql2'
import pool from '../../config/db'
import { NewsletterSubscriberRow } from '../../types/database'

export interface NewsletterSubscriber {
  id: string
  email: string
  createdAt: Date
}

export async function subscribe(email: string) {
  const id = randomUUID()
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT IGNORE INTO newsletter_subscribers (id, email) VALUES (?, ?)',
    [id, email],
  )
  const [rows] = await pool.execute<NewsletterSubscriberRow[]>(
    'SELECT id, email, created_at FROM newsletter_subscribers WHERE email = ?',
    [email],
  )
  const row = rows[0]
  return {
    subscriber: { id: row.id, email: row.email, createdAt: row.created_at } satisfies NewsletterSubscriber,
    alreadySubscribed: result.affectedRows === 0,
  }
}