import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@royalpalaceantsirabe.com'
const HOTEL_EMAIL = 'royalpalace.resa@moov.mg' // Hotel's email from frontend

export async function sendBookingEmail(booking: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: HOTEL_EMAIL,
      subject: `New Booking Request - ${booking.guestName}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Guest:</strong> ${booking.guestName}</p>
        <p><strong>Email:</strong> ${booking.guestEmail}</p>
        <p><strong>Phone:</strong> ${booking.guestPhone || 'Not provided'}</p>
        <p><strong>Room:</strong> ${booking.room?.translationKey || booking.roomId}</p>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
        <p><strong>Rooms:</strong> ${booking.rooms}</p>
        <p><strong>Adults:</strong> ${booking.adults}</p>
        <p><strong>Children:</strong> ${booking.children}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
    } else {
      console.log('Booking email sent:', data)
    }
  } catch (error) {
    console.error('Failed to send booking email:', error)
  }
}

export async function sendContactEmail(contact: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: HOTEL_EMAIL,
      subject: `Contact Form - ${contact.subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
        <p><strong>Sent:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
    } else {
      console.log('Contact email sent:', data)
    }
  } catch (error) {
    console.error('Failed to send contact email:', error)
  }
}

export async function sendEventInquiryEmail(inquiry: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: HOTEL_EMAIL,
      subject: `Event Inquiry - ${inquiry.name}`,
      html: `
        <h2>New Event Inquiry</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${inquiry.subject || 'Not provided'}</p>
        <p><strong>Event Date:</strong> ${new Date(inquiry.eventDate).toLocaleDateString()}</p>
        <p><strong>Guest Count:</strong> ${inquiry.guestCount}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiry.message}</p>
        <p><strong>Sent:</strong> ${new Date(inquiry.createdAt).toLocaleString()}</p>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
    } else {
      console.log('Event inquiry email sent:', data)
    }
  } catch (error) {
    console.error('Failed to send event inquiry email:', error)
  }
}
