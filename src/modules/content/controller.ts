import { Request, Response, NextFunction } from 'express'
import prisma from '../../utils/db'

export function getContent(type: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data

      switch (type) {
        case 'rooms':
          data = await prisma.room.findMany({ orderBy: { price: 'asc' } })
          break
        case 'menu':
          data = await prisma.menuSection.findMany({
            include: { items: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
          })
          break
        case 'spa':
          data = await prisma.spaTreatment.findMany({ orderBy: { order: 'asc' } })
          break
        case 'events':
          data = await prisma.eventRoom.findMany({ orderBy: { order: 'asc' } })
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
