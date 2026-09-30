import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@royalpalaceantsirabe.com'
const HOTEL_EMAIL = process.env.ADMIN_EMAIL || 'royalpalace.resa@moov.mg'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  )
export async function sendBookingEmail(booking: any) {
  try {
    if (!resend) {
      console.warn('Booking email skipped: RESEND_API_KEY is not configured')
      return
    }
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
    if (!resend) {
      console.warn('Contact email skipped: RESEND_API_KEY is not configured')
      return
    }
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
    if (!resend) {
      console.warn('Event inquiry email skipped: RESEND_API_KEY is not configured')
      return
    }

    const eventDate = inquiry.eventDate
      ? new Date(inquiry.eventDate).toLocaleDateString('fr-FR')
      : 'Non précisée'

    // 1. Email à l'admin (Répondre → écrit au client)
    const adminRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: HOTEL_EMAIL,
      replyTo: inquiry.email,
      subject: `Demande de devis événement - ${inquiry.name}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <p><strong>Nom :</strong> ${esc(inquiry.name)}</p>
        <p><strong>Email :</strong> ${esc(inquiry.email)}</p>
        <p><strong>Téléphone :</strong> ${esc(inquiry.phone) || 'Non renseigné'}</p>
        <p><strong>Sujet :</strong> ${esc(inquiry.subject) || 'Non renseigné'}</p>
        <p><strong>Date :</strong> ${eventDate}</p>
        <p><strong>Invités :</strong> ${esc(inquiry.guestCount)}</p>
        <p><strong>Message :</strong></p>
        <p>${esc(inquiry.message).replace(/\n/g, '<br>')}</p>
      `,
    })
    if (adminRes.error) console.error('Admin email error:', adminRes.error)

    // 2. Confirmation au client
    const clientRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: inquiry.email,
      replyTo: HOTEL_EMAIL,
      subject: 'Nous avons bien reçu votre demande de devis',
      html: `
        <p>Bonjour ${esc(inquiry.name)},</p>
        <p>Merci pour votre demande. Notre équipe événementielle vous répondra dans les plus brefs délais.</p>
        <p><strong>Récapitulatif :</strong><br>
        Date : ${eventDate}<br>
        Invités : ${esc(inquiry.guestCount)}</p>
        <p>Cordialement,<br>L'équipe Royal Palace</p>
      `,
    })
    if (clientRes.error) console.error('Client email error:', clientRes.error)
  } catch (error) {
    console.error('Failed to send event inquiry email:', error)
  }
}