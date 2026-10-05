import { Request, Response, NextFunction } from 'express'
import {
  getDiscover, getEventRooms, getGallery, getMenu, getRooms, getSpaTreatments,
} from './service'
import { getAvailabilityCalendar } from '../bookings/availability'

const loaders: Record<string, () => Promise<unknown>> = {
  rooms: getRooms,
  menu: getMenu,
  spa: getSpaTreatments,
  events: getEventRooms,
  gallery: getGallery,
  discover: getDiscover,
}

/**
 * Calendrier public de disponibilité.
 *
 * Il ne dit que le nombre d'unités encore libres par jour : ni qui a réservé,
 * ni pourquoi une chambre est bloquée. Le détail reste au back-office.
 */
export async function availabilityCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as unknown as { from: string; to: string }
    const calendar = await getAvailabilityCalendar(new Date(from), new Date(to))
    res.json({
      data: calendar.map(room => ({
        roomId: room.roomId,
        slug: room.slug,
        name: room.name,
        nameEn: room.nameEn,
        totalUnits: room.totalUnits,
        days: room.days.map(day => ({ date: day.date, free: day.free })),
      })),
    })
  } catch (error) {
    next(error)
  }
}

export function getContent(type: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const load = loaders[type]
    if (!load) {
      return res.status(404).json({ error: 'Content type not found' })
    }
    try {
      res.json({ data: await load() })
    } catch (error) {
      next(error)
    }
  }
}
