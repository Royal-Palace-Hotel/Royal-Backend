import { Request, Response, NextFunction } from 'express'
import * as bookingService from './service'

export async function checkAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await bookingService.checkAvailability(req.body)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking(req.body)

    res.status(201).json({
      message: 'Booking created successfully',
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}
