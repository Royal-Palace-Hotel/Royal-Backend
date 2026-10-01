import { Request, Response, NextFunction } from 'express'
import {
  getDiscover, getEventRooms, getGallery, getMenu, getRooms, getSpaTreatments,
} from './service'

const loaders: Record<string, () => Promise<unknown>> = {
  rooms: getRooms,
  menu: getMenu,
  spa: getSpaTreatments,
  events: getEventRooms,
  gallery: getGallery,
  discover: getDiscover,
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
