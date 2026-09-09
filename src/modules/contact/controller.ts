import { Request, Response, NextFunction } from 'express'
import prisma from '../../utils/db'
import { sendContactEmail, sendEventInquiryEmail } from '../../utils/email'

export async function createContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, subject, message } = req.body

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    })

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
    const { name, email, phone, subject, message, eventDate, guestCount } = req.body

    const eventInquiry = await prisma.eventInquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        eventDate: new Date(eventDate),
        guestCount: parseInt(guestCount),
      },
    })

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
