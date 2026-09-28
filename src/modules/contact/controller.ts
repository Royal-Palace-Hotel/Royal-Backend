import { Request, Response, NextFunction } from 'express'
import { createContactMessage as insertContactMessage, createEventInquiry as insertEventInquiry } from './service'
import { sendContactEmail, sendEventInquiryEmail } from '../../utils/email'

export async function createContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const contactMessage = await insertContactMessage(req.body)

    // Send email notification
    await sendContactEmail(contactMessage)

    res.status(201).json({
      message: 'Contact message sent successfully',
      data: contactMessage,
    })
  } catch (error) {
    next(error)
  }
}

export async function createEventInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const eventInquiry = await insertEventInquiry(req.body)

    // Send email notification
    await sendEventInquiryEmail(eventInquiry)

    res.status(201).json({
      message: 'Event inquiry sent successfully',
      data: eventInquiry,
    })
  } catch (error) {
    next(error)
  }
}
