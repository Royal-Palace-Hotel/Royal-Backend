import { Request, Response, NextFunction } from 'express'
import prisma from '../../utils/db'
import { AppError } from '../../middleware/errorHandler'

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      return res.status(200).json({
        message: 'Already subscribed',
        data: existing,
      })
    }

    // Create subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email },
    })

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      data: subscriber,
    })
  } catch (error) {
    next(error)
  }
}
