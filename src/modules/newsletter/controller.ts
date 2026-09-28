import { Request, Response, NextFunction } from 'express'
import { subscribe as subscribeToNewsletter } from './service'

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { subscriber, alreadySubscribed } = await subscribeToNewsletter(req.body.email)

    if (alreadySubscribed) {
      return res.status(200).json({
        message: 'Already subscribed',
        data: subscriber,
      })
    }

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      data: subscriber,
    })
  } catch (error) {
    next(error)
  }
}
