import { RowDataPacket } from 'mysql2/promise'
import pool from '../../config/db'

interface CountRow extends RowDataPacket { n: number }
interface Row extends RowDataPacket { [key: string]: any }

const count = async (sql: string, values: any[] = []) => {
  const [rows] = await pool.execute<CountRow[]>(sql, values)
  return Number(rows[0]?.n ?? 0)
}

/**
 * Indicateurs de la page d'accueil du back-office.
 *
 * Les « nuitées vendues » et le « taux d'occupation » ne comptent que les
 * réservations confirmées ou en attente : une réservation annulée libère ses
 * nuits. Le chiffre d'affaires est une estimation au prix catalogue de la
 * chambre — l'API ne gère pas encore de tarif négocié.
 */
export async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const in30Days = new Date(today.getTime() + 30 * 24 * 3600 * 1000)

  const ACTIVE = "status IN ('pending', 'confirmed')"

  const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000)

  const [
    totalBookings, pendingBookings, confirmedBookings, cancelledBookings,
    bookingsThisMonth, newMessages, totalMessages, subscribers,
    roomsCount, upcomingArrivals,
    arrivalsToday, departuresToday, inHouse,
  ] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM bookings'),
    count("SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending'"),
    count("SELECT COUNT(*) AS n FROM bookings WHERE status = 'confirmed'"),
    count("SELECT COUNT(*) AS n FROM bookings WHERE status = 'cancelled'"),
    count('SELECT COUNT(*) AS n FROM bookings WHERE created_at >= ? AND created_at < ?',
      [startOfMonth, startOfNextMonth]),
    count("SELECT COUNT(*) AS n FROM contact_messages WHERE status = 'new'"),
    count('SELECT COUNT(*) AS n FROM contact_messages'),
    count('SELECT COUNT(*) AS n FROM newsletter_subscribers'),
    count('SELECT COALESCE(SUM(total_units), 0) AS n FROM rooms'),
    count(`SELECT COUNT(*) AS n FROM bookings WHERE ${ACTIVE} AND check_in >= ? AND check_in < ?`,
      [today, in30Days]),
    // Vue du jour pour la réception : qui arrive, qui part, qui est sur place.
    count(`SELECT COUNT(*) AS n FROM bookings WHERE ${ACTIVE} AND check_in >= ? AND check_in < ?`,
      [today, tomorrow]),
    count(`SELECT COUNT(*) AS n FROM bookings WHERE ${ACTIVE} AND check_out >= ? AND check_out < ?`,
      [today, tomorrow]),
    count(`SELECT COALESCE(SUM(rooms_count), 0) AS n FROM bookings
           WHERE ${ACTIVE} AND check_in <= ? AND check_out > ?`, [today, today]),
  ])

  // Nuitées vendues sur le mois en cours : on borne chaque séjour au mois.
  const [nightsRows] = await pool.execute<Row[]>(
    `SELECT COALESCE(SUM(
       rooms_count * DATEDIFF(LEAST(check_out, ?), GREATEST(check_in, ?))
     ), 0) AS nights
     FROM bookings
     WHERE ${ACTIVE} AND check_in < ? AND check_out > ?`,
    [startOfNextMonth, startOfMonth, startOfNextMonth, startOfMonth],
  )
  const nightsSold = Number(nightsRows[0]?.nights ?? 0)

  const daysInMonth = Math.round(
    (startOfNextMonth.getTime() - startOfMonth.getTime()) / (24 * 3600 * 1000),
  )
  const capacity = roomsCount * daysInMonth
  const occupancyRate = capacity > 0 ? Math.round((nightsSold / capacity) * 1000) / 10 : 0

  // Chiffre d'affaires estimé du mois, au prix catalogue.
  const [revenueRows] = await pool.execute<Row[]>(
    `SELECT COALESCE(SUM(
       b.rooms_count * DATEDIFF(LEAST(b.check_out, ?), GREATEST(b.check_in, ?)) * r.price
     ), 0) AS revenue
     FROM bookings b JOIN rooms r ON r.id = b.room_id
     WHERE b.${ACTIVE} AND b.check_in < ? AND b.check_out > ?`,
    [startOfNextMonth, startOfMonth, startOfNextMonth, startOfMonth],
  )

  const [recentBookings] = await pool.execute<Row[]>(
    `SELECT b.id, b.guest_name AS guestName, b.guest_email AS guestEmail,
            b.check_in AS checkIn, b.check_out AS checkOut, b.rooms_count AS rooms,
            b.status, b.created_at AS createdAt, r.name AS roomName, r.slug AS roomSlug
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
     ORDER BY b.created_at DESC LIMIT 8`,
  )

  const [recentMessages] = await pool.execute<Row[]>(
    `SELECT id, type, status, name, email, subject, created_at AS createdAt
     FROM contact_messages ORDER BY created_at DESC LIMIT 8`,
  )

  // Répartition des réservations par chambre, pour le graphique.
  const [byRoom] = await pool.execute<Row[]>(
    `SELECT COALESCE(r.name, r.slug) AS room, COUNT(*) AS bookings,
            COALESCE(SUM(b.rooms_count), 0) AS units
     FROM bookings b LEFT JOIN rooms r ON r.id = b.room_id
     WHERE b.${ACTIVE}
     GROUP BY b.room_id, r.name, r.slug ORDER BY bookings DESC`,
  )

  // Réservations créées sur les 6 derniers mois.
  const [monthly] = await pool.execute<Row[]>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS bookings
     FROM bookings WHERE created_at >= DATE_SUB(?, INTERVAL 5 MONTH)
     GROUP BY month ORDER BY month`,
    [startOfMonth],
  )

  return {
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      thisMonth: bookingsThisMonth,
      upcomingArrivals,
    },
    today: { arrivals: arrivalsToday, departures: departuresToday, roomsOccupied: inHouse },
    occupancy: {
      nightsSold,
      capacity,
      rate: occupancyRate,
      daysInMonth,
    },
    revenue: {
      estimatedThisMonth: Math.round(Number(revenueRows[0]?.revenue ?? 0) * 100) / 100,
      currency: 'EUR',
    },
    messages: { total: totalMessages, unread: newMessages },
    newsletter: { subscribers },
    recentBookings,
    recentMessages,
    bookingsByRoom: byRoom.map(row => ({
      room: row.room,
      bookings: Number(row.bookings),
      units: Number(row.units),
    })),
    bookingsByMonth: monthly.map(row => ({ month: row.month, bookings: Number(row.bookings) })),
  }
}
