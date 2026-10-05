import { randomUUID } from 'node:crypto'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'
import { AppError } from '../../middleware/errorHandler'

/**
 * Périodes pendant lesquelles des unités ne sont pas vendables : travaux,
 * fermeture, ou réservation reçue hors du site qu'on ne veut pas saisir comme
 * une réservation nominative.
 *
 * Elles sont décomptées par `bookings/availability.ts`, donc elles ferment le
 * site public en même temps qu'elles noircissent le tableau du back-office.
 */

interface BlockRow extends RowDataPacket {
  id: string
  roomId: string
  roomName: string | null
  startDate: string
  endDate: string
  units: number
  reason: string | null
}

interface RoomRow extends RowDataPacket {
  id: string
  total_units: number
}

export interface BlockInput {
  roomId: string
  startDate: string
  endDate: string
  units: number
  reason?: string | null
}

/**
 * Les dates sont formatées en SQL plutôt que renvoyées en objets `Date` : un
 * jour affiché ne doit jamais dépendre d'un fuseau horaire.
 */
const SELECT = `SELECT k.id, k.room_id AS roomId, COALESCE(r.name, r.slug) AS roomName,
  DATE_FORMAT(k.start_date, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(k.end_date, '%Y-%m-%d') AS endDate,
  k.units, k.reason
  FROM room_blocks k LEFT JOIN rooms r ON r.id = k.room_id`

export async function listRoomBlocks(filters: { from?: string; to?: string } = {}) {
  // Par défaut on ne montre que ce qui court encore : un blocage passé n'a plus
  // d'intérêt opérationnel, mais reste consultable en précisant une fenêtre.
  if (filters.from && filters.to) {
    const [rows] = await pool.execute<BlockRow[]>(
      `${SELECT} WHERE k.start_date < ? AND k.end_date > ? ORDER BY k.start_date, roomName`,
      [filters.to, filters.from],
    )
    return rows
  }
  const [rows] = await pool.execute<BlockRow[]>(
    `${SELECT} WHERE k.end_date > CURDATE() ORDER BY k.start_date, roomName`,
  )
  return rows
}

async function assertRoomFits(roomId: string, units: number) {
  const [rows] = await pool.execute<RoomRow[]>(
    'SELECT id, total_units FROM rooms WHERE id = ? OR slug = ? LIMIT 1',
    [roomId, roomId],
  )
  const room = rows[0]
  if (!room) throw new AppError('Chambre introuvable', 404)
  if (units > room.total_units) {
    throw new AppError(
      `Cette catégorie ne compte que ${room.total_units} unité(s) : impossible d'en bloquer ${units}.`,
      400,
    )
  }
  return room
}

export async function saveRoomBlock(input: BlockInput, id?: string) {
  const room = await assertRoomFits(input.roomId, input.units)

  if (id) {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE room_blocks SET room_id = ?, start_date = ?, end_date = ?, units = ?, reason = ?
       WHERE id = ?`,
      [room.id, input.startDate, input.endDate, input.units, input.reason || null, id],
    )
    if (!result.affectedRows) throw new AppError('Période bloquée introuvable', 404)
  } else {
    id = randomUUID()
    await pool.execute(
      `INSERT INTO room_blocks (id, room_id, start_date, end_date, units, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, room.id, input.startDate, input.endDate, input.units, input.reason || null],
    )
  }

  const [rows] = await pool.execute<BlockRow[]>(`${SELECT} WHERE k.id = ?`, [id])
  return rows[0]
}

export async function deleteRoomBlock(id: string) {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM room_blocks WHERE id = ?', [id])
  if (!result.affectedRows) throw new AppError('Période bloquée introuvable', 404)
  return { id }
}
