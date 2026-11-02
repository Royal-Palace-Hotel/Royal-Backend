import { PoolConnection, RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'

/**
 * Disponibilité des chambres — source unique pour le site public et le
 * back-office.
 *
 * Deux choses occupent une unité : une réservation active (`pending` ou
 * `confirmed` — une annulation rend ses nuits) et un blocage (`room_blocks` :
 * travaux, fermeture, réservation reçue hors du site).
 *
 * Les bornes de fin sont **exclusives** : un séjour du 12 au 15 occupe les nuits
 * du 12, 13 et 14, et laisse le 15 libre pour l'arrivée suivante.
 *
 * Tout se calcule **nuit par nuit**, jamais en cumulant les réservations d'une
 * période. La nuance n'est pas cosmétique : dans une catégorie de 2 unités où
 * une réservation occupe la nuit du 12 et une autre celle du 13, un cumul sur
 * le séjour du 12 au 14 conclurait « 0 disponible », alors qu'une unité est
 * libre chacune des deux nuits. Le minimum nuit par nuit est la seule réponse
 * juste — et c'est aussi celle qu'affiche le calendrier, donc les deux ne
 * peuvent pas se contredire.
 */

type Executor = PoolConnection | typeof pool

/**
 * Série des nuits de la période, `to` exclusive.
 *
 * Les comparaisons passent par `DATE(...)` sur les colonnes DATETIME : la nuit
 * à laquelle une réservation est rattachée ne doit dépendre d'aucune heure
 * résiduelle dans la donnée.
 */
const NIGHTS = `WITH RECURSIVE nights (d) AS (
  SELECT DATE(?)
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM nights WHERE d + INTERVAL 1 DAY < DATE(?)
)`

/**
 * Unités occupées pour `room_alias`, la nuit `nights.d`.
 *
 * Le `b.id <> ?` sert à la modification d'une réservation : elle doit pouvoir
 * se déplacer sans buter sur le stock qu'elle occupe encore. Hors de ce cas,
 * le paramètre vaut la chaîne vide, qu'aucun identifiant ne porte.
 */
const BOOKED = (alias: string) => `COALESCE((
  SELECT SUM(b.rooms_count) FROM bookings b
  WHERE b.room_id = ${alias}.id AND b.status IN ('pending', 'confirmed') AND b.id <> ?
    AND DATE(b.check_in) <= nights.d AND DATE(b.check_out) > nights.d
), 0)`

const BLOCKED = (alias: string) => `COALESCE((
  SELECT SUM(k.units) FROM room_blocks k
  WHERE k.room_id = ${alias}.id
    AND k.start_date <= nights.d AND k.end_date > nights.d
), 0)`

interface NightRow extends RowDataPacket {
  roomId: string
  slug: string
  name: string | null
  nameEn: string | null
  maxGuests: number
  totalUnits: number
  day: string
  booked: number | string
  blocked: number | string
}

/**
 * Occupation de chaque chambre, pour chaque nuit de la période.
 *
 * `executor` permet d'exécuter la requête dans la transaction qui tient les
 * verrous pendant une réservation, plutôt que sur une connexion séparée qui ne
 * les verrait pas.
 */
async function nightlyRows(
  executor: Executor,
  from: Date | string,
  to: Date | string,
  filters: { roomId?: string; minGuests?: number; ignoreBookingId?: string } = {},
): Promise<NightRow[]> {
  const conditions: string[] = []
  // `ignoreBookingId` : une réservation en cours de modification ne doit pas se
  // compter elle-même, sinon déplacer un séjour d'un jour se heurterait au
  // stock qu'elle occupe déjà.
  const values: Array<Date | string | number> = [from, to, filters.ignoreBookingId ?? '']

  if (filters.roomId) {
    conditions.push('(r.id = ? OR r.slug = ? OR r.translation_key = ?)')
    values.push(filters.roomId, filters.roomId, filters.roomId)
  }
  if (filters.minGuests && filters.minGuests > 1) {
    conditions.push('r.max_guests >= ?')
    values.push(filters.minGuests)
  }

  const [rows] = await executor.query<NightRow[]>(
    `${NIGHTS}
     SELECT r.id AS roomId, r.slug, r.name, r.name_en AS nameEn,
            r.max_guests AS maxGuests, r.total_units AS totalUnits,
            DATE_FORMAT(nights.d, '%Y-%m-%d') AS day,
            ${BOOKED('r')} AS booked,
            ${BLOCKED('r')} AS blocked
     FROM rooms r CROSS JOIN nights
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY r.price, r.slug, nights.d`,
    values,
  )
  return rows
}

/** Unités libres cette nuit-là, jamais négatif : un blocage peut excéder le stock. */
const freeThatNight = (row: NightRow) =>
  Math.max(0, Number(row.totalUnits) - Number(row.booked) - Number(row.blocked))

export interface FreeUnits {
  /** Pire nuit du séjour : c'est elle qui décide. */
  free: number
  booked: number
  blocked: number
}

/**
 * Unités réellement réservables dans une catégorie, sur tout le séjour.
 *
 * `totalUnits` est passé par l'appelant parce qu'il détient déjà la ligne
 * verrouillée : la valeur doit venir de ce qu'il a lu, pas d'une relecture.
 */
export async function countFreeUnits(
  executor: Executor, roomId: string, totalUnits: number, checkIn: Date, checkOut: Date,
  ignoreBookingId?: string,
): Promise<FreeUnits> {
  const rows = await nightlyRows(executor, checkIn, checkOut, { roomId, ignoreBookingId })
  if (rows.length === 0) return { free: totalUnits, booked: 0, blocked: 0 }

  return {
    free: Math.min(...rows.map(freeThatNight)),
    booked: Math.max(...rows.map(row => Number(row.booked))),
    blocked: Math.max(...rows.map(row => Number(row.blocked))),
  }
}

/**
 * Disponibilité de l'hôtel entier sur la période, limitée aux catégories qui
 * peuvent accueillir `minGuestsPerRoom` personnes.
 *
 * Le reste à vendre est plafonné catégorie par catégorie avant d'être
 * additionné : sans cela, une catégorie bloquée au-delà de son stock viendrait
 * masquer les unités libres d'une autre.
 */
export async function getHotelAvailability(
  checkIn: Date, checkOut: Date, minGuestsPerRoom = 1,
) {
  const rows = await nightlyRows(pool, checkIn, checkOut, { minGuests: minGuestsPerRoom })

  const freePerNight = new Map<string, number>()
  const totalUnits = new Map<string, number>()
  let booked = 0
  let blocked = 0

  for (const row of rows) {
    freePerNight.set(row.day, (freePerNight.get(row.day) ?? 0) + freeThatNight(row))
    totalUnits.set(row.roomId, Number(row.totalUnits))
    booked = Math.max(booked, Number(row.booked))
    blocked = Math.max(blocked, Number(row.blocked))
  }

  const total = [...totalUnits.values()].reduce((sum, units) => sum + units, 0)
  const free = freePerNight.size === 0 ? 0 : Math.min(...freePerNight.values())
  return { total, booked, blocked, free }
}

export interface DayAvailability {
  date: string
  total: number
  booked: number
  blocked: number
  free: number
}

export interface RoomAvailability {
  roomId: string
  slug: string
  name: string | null
  nameEn: string | null
  totalUnits: number
  maxGuests: number
  days: DayAvailability[]
}

/**
 * Calendrier jour par jour, pour chaque catégorie de chambre.
 * `from` est inclusive, `to` exclusive.
 */
export async function getAvailabilityCalendar(
  from: Date, to: Date, ignoreBookingId?: string,
): Promise<RoomAvailability[]> {
  const rows = await nightlyRows(pool, from, to, { ignoreBookingId })

  const byRoom = new Map<string, RoomAvailability>()
  for (const row of rows) {
    let room = byRoom.get(row.roomId)
    if (!room) {
      room = {
        roomId: row.roomId,
        slug: row.slug,
        name: row.name,
        nameEn: row.nameEn,
        totalUnits: Number(row.totalUnits),
        maxGuests: Number(row.maxGuests),
        days: [],
      }
      byRoom.set(row.roomId, room)
    }

    room.days.push({
      // Le jour est formaté en SQL plutôt que reconstruit depuis un objet Date :
      // aucun fuseau n'intervient, donc aucune date ne peut glisser d'un jour.
      date: row.day,
      total: room.totalUnits,
      booked: Number(row.booked),
      blocked: Number(row.blocked),
      free: freeThatNight(row),
    })
  }

  return [...byRoom.values()]
}
