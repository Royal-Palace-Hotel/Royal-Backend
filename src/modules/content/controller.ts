import { Request, Response, NextFunction } from 'express'
import { getEventRooms, getMenu, getRooms, getSpaTreatments } from './service'

export function getContent(type: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data

      switch (type) {
        case 'rooms':
          data = await getRooms()
          break
        case 'menu':
          data = await getMenu()
          break
        case 'spa':
          data = await getSpaTreatments()
          break
        case 'events':
          data = await getEventRooms()
          break
        case 'gallery':
          // Gallery will be static for now, or we can add a GalleryImage model later
          data = { message: 'Gallery endpoint - implement if needed' }
          break
        case 'discover':
          // Discover content will be static for now
          data = { message: 'Discover endpoint - implement if needed' }
          break
        default:
          return res.status(404).json({ error: 'Content type not found' })
      }

      res.json({ data })
    } catch (error) {
      next(error)
    }
  }
}
