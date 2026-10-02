import { Resend } from 'resend'
import { FROM_EMAIL, HOTEL_EMAIL, RESEND_API_KEY } from '../config/env'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

/** Guest-supplied values land in an HTML body, so they must be escaped. */
const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!
  ))

const multiline = (value: unknown) => esc(value).replace(/\n/g, '<br>')

const date = (value: unknown, fallback = 'Non précisée') =>
  value ? new Date(value as string).toLocaleDateString('fr-FR') : fallback

async function send(label: string, payload: Parameters<Resend['emails']['send']>[0]) {
  if (!resend) {
    console.warn(`${label} email skipped: RESEND_API_KEY is not configured`)
    return
  }
  try {
    const { data, error } = await resend.emails.send(payload)
    if (error) console.error(`${label} email error:`, error)
    else console.log(`${label} email sent:`, data?.id)
  } catch (error) {
    console.error(`Failed to send ${label} email:`, error)
  }
}

export async function sendBookingEmail(booking: any) {
  await send('Booking', {
    from: FROM_EMAIL,
    to: HOTEL_EMAIL,
    replyTo: booking.guestEmail,
    subject: `Nouvelle réservation - ${booking.guestName}`,
    html: `
      <h2>Nouvelle demande de réservation</h2>
      <p><strong>Client :</strong> ${esc(booking.guestName)}</p>
      <p><strong>Email :</strong> ${esc(booking.guestEmail)}</p>
      <p><strong>Téléphone :</strong> ${esc(booking.guestPhone) || 'Non renseigné'}</p>
      <p><strong>Chambre :</strong> ${esc(booking.room?.name || booking.room?.translationKey || booking.roomId)}</p>
      <p><strong>Arrivée :</strong> ${date(booking.checkIn)}</p>
      <p><strong>Départ :</strong> ${date(booking.checkOut)}</p>
      <p><strong>Chambres :</strong> ${esc(booking.rooms)}</p>
      <p><strong>Adultes :</strong> ${esc(booking.adults)}</p>
      <p><strong>Enfants :</strong> ${esc(booking.children)}</p>
      <p><strong>Statut :</strong> ${esc(booking.status)}</p>
      <p><strong>Référence :</strong> ${esc(booking.id)}</p>
    `,
  })
}

/**
 * Accusé de réception au client.
 *
 * Le libellé reste prudent : la réservation arrive en statut « en attente »,
 * elle n'est pas confirmée tant que l'hôtel ne l'a pas validée au back-office.
 */
export async function sendBookingConfirmationToGuest(booking: any) {
  const roomName = booking.room?.name || booking.room?.slug || booking.roomId
  const nights = Math.max(Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000,
  ), 1)

  await send('Booking (guest)', {
    from: FROM_EMAIL,
    to: booking.guestEmail,
    replyTo: HOTEL_EMAIL,
    subject: 'Nous avons bien reçu votre demande de réservation',
    html: `
      <p>Bonjour ${esc(booking.guestName)},</p>
      <p>Merci d'avoir choisi le Royal Palace Antsirabe. Votre demande nous est
      bien parvenue ; notre équipe la confirme sous peu par retour d'e-mail.</p>
      <p><strong>Récapitulatif :</strong><br>
      Chambre : ${esc(roomName)}<br>
      Arrivée : ${date(booking.checkIn)}<br>
      Départ : ${date(booking.checkOut)}<br>
      Durée : ${nights} nuit(s)<br>
      Chambres : ${esc(booking.rooms)}<br>
      Voyageurs : ${esc(booking.adults)} adulte(s)${booking.children ? `, ${esc(booking.children)} enfant(s)` : ''}<br>
      Référence : ${esc(booking.id)}</p>
      <p>Pour toute question, répondez simplement à ce message.</p>
      <p>Cordialement,<br>L'équipe Royal Palace Antsirabe</p>
    `,
  })
}

export async function sendContactEmail(contact: any) {
  await send('Contact', {
    from: FROM_EMAIL,
    to: HOTEL_EMAIL,
    replyTo: contact.email,
    subject: `Formulaire de contact - ${contact.subject || 'Sans sujet'}`,
    html: `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${esc(contact.name)}</p>
      <p><strong>Email :</strong> ${esc(contact.email)}</p>
      <p><strong>Téléphone :</strong> ${esc(contact.phone) || 'Non renseigné'}</p>
      <p><strong>Sujet :</strong> ${esc(contact.subject) || 'Non renseigné'}</p>
      <p><strong>Message :</strong></p>
      <p>${multiline(contact.message)}</p>
      <p><strong>Envoyé le :</strong> ${date(contact.createdAt, '-')}</p>
    `,
  })
}

export async function sendEventInquiryEmail(inquiry: any) {
  const eventDate = date(inquiry.eventDate)

  // 1. Notification à l'hôtel — « Répondre » écrit directement au client.
  await send('Event inquiry (hotel)', {
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
      <p>${multiline(inquiry.message)}</p>
    `,
  })

  // 2. Accusé de réception au client.
  await send('Event inquiry (guest)', {
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
}
