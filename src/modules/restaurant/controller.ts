import { Request, Response, NextFunction } from 'express'
import { getRestaurantMenu } from './service'

export async function listRestaurantMenu(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getRestaurantMenu() })
  } catch (error) {
    next(error)
  }
}
