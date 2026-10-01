import { randomUUID } from 'crypto'
import { pool } from '../../db.js'

function toRoom(row, images = [], amenities = []) {
  return {
    id: row.id,
    slug: row.slug,
    translationKey: row.translation_key,
    price: Number(row.price),          // DECIMAL arrive en chaîne
    currency: row.currency,
    size: row.size,
    maxGuests: row.max_guests,
    totalUnits: row.total_units,
    isActive: Boolean(row.is_active),
    images,
    amenities,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadRelations(conn, roomIds) {
  const images = {}
  const amenities = {}
  if (roomIds.length === 0) return { images, amenities }

  const [imgRows] = await conn.query(
    'SELECT room_id, image FROM room_images WHERE room_id IN (?) ORDER BY sort_order',
    [roomIds]
  )
  const [amRows] = await conn.query(
    'SELECT room_id, amenity FROM room_amenities WHERE room_id IN (?) ORDER BY sort_order',
    [roomIds]
  )
  imgRows.forEach((r) => (images[r.room_id] ||= []).push(r.image))
  amRows.forEach((r) => (amenities[r.room_id] ||= []).push(r.amenity))
  return { images, amenities }
}

// onlyActive = true pour le site public, false pour l'admin
export async function listRooms({ onlyActive = false } = {}) {
  const [rows] = await pool.query(
    `SELECT * FROM rooms ${onlyActive ? 'WHERE is_active = 1' : ''} ORDER BY created_at`
  )
  const { images, amenities } = await loadRelations(pool, rows.map((r) => r.id))
  return rows.map((r) => toRoom(r, images[r.id], amenities[r.id]))
}

export async function getRoom(id) {
  const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id])
  if (rows.length === 0) return null
  const { images, amenities } = await loadRelations(pool, [id])
  return toRoom(rows[0], images[id], amenities[id])
}

async function replaceList(conn, table, column, roomId, values) {
  await conn.query(`DELETE FROM ${table} WHERE room_id = ?`, [roomId])
  if (values.length === 0) return
  const rows = values.map((v, i) => [roomId, v, i])
  await conn.query(`INSERT INTO ${table} (room_id, ${column}, sort_order) VALUES ?`, [rows])
}

export async function createRoom(data) {
  const id = randomUUID()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(
      `INSERT INTO rooms (id, slug, translation_key, price, currency, size, max_guests, total_units, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.slug, data.translationKey, data.price, data.currency.toUpperCase(),
       data.size, data.maxGuests, data.totalUnits, data.isActive ? 1 : 0]
    )
    await replaceList(conn, 'room_images', 'image', id, data.images)
    await replaceList(conn, 'room_amenities', 'amenity', id, data.amenities)
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return getRoom(id)
}

const COLUMNS = {
  slug: 'slug',
  translationKey: 'translation_key',
  price: 'price',
  currency: 'currency',
  size: 'size',
  maxGuests: 'max_guests',
  totalUnits: 'total_units',
  isActive: 'is_active',
}

export async function updateRoom(id, data) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [exists] = await conn.query('SELECT id FROM rooms WHERE id = ? FOR UPDATE', [id])
    if (exists.length === 0) {
      await conn.rollback()
      return null
    }

    const sets = []
    const values = []
    for (const [key, column] of Object.entries(COLUMNS)) {
      if (data[key] !== undefined) {
        sets.push(`${column} = ?`)
        let v = data[key]
        if (key === 'isActive') v = v ? 1 : 0
        if (key === 'currency') v = v.toUpperCase()
        values.push(v)
      }
    }
    if (sets.length > 0) {
      await conn.query(`UPDATE rooms SET ${sets.join(', ')} WHERE id = ?`, [...values, id])
    }
    if (data.images !== undefined) await replaceList(conn, 'room_images', 'image', id, data.images)
    if (data.amenities !== undefined) await replaceList(conn, 'room_amenities', 'amenity', id, data.amenities)

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return getRoom(id)
}

// Soft delete : l'historique des réservations reste intact
export async function deactivateRoom(id) {
  const [result] = await pool.query('UPDATE rooms SET is_active = 0 WHERE id = ?', [id])
  return result.affectedRows > 0
}