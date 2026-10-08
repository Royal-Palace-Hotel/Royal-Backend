import nodemailer, { Transporter } from 'nodemailer'
import { FROM_EMAIL, FROM_NAME, GMAIL_APP_PASSWORD, GMAIL_USER, HOTEL_EMAIL } from '../config/env'

const configured = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD)

/**
 * Le transport est créé une fois et réutilisé : `pool` garde la connexion SMTP
 * ouverte entre deux envois, ce qui évite de refaire la poignée de main TLS à
 * chaque réservation.
 *
 * Port 587 + STARTTLS (`secure: false`) plutôt que 465 : c'est le port que les
 * hébergeurs laissent passer le plus souvent.
 */
const transporter: Transporter | null = configured
  ? nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    pool: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })
  : null

/** Guest-supplied values land in an HTML body, so they must be escaped. */
const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!
  ))

const multiline = (value: unknown) => esc(value).replace(/\n/g, '<br>')

const date = (value: unknown, fallback = 'Non précisée') =>
  value ? new Date(value as string).toLocaleDateString('fr-FR') : fallback

interface Mail {
  to: string
  replyTo?: string
  subject: string
  html: string
}

/**
 * Envoie un e-mail sans jamais propager d'erreur : une notification ratée ne
 * doit pas annuler l'opération métier qui vient d'aboutir en base. Renvoie un
 * booléen pour que l'appelant puisse en rendre compte au back-office.
 */
async function send(label: string, mail: Mail) {
  if (!transporter) {
    console.warn(`${label} email skipped: GMAIL_USER / GMAIL_APP_PASSWORD are not configured`)
    return false
  }
  try {
    // L'adresse d'envoi reste celle du compte Gmail authentifié ; seul le nom
    // affiché est habillé, pour que le client lise « Royal Palace Antsirabe ».
    const info = await transporter.sendMail({
      from: { name: FROM_NAME, address: FROM_EMAIL },
      ...mail,
    })
    console.log(`${label} email sent:`, info.messageId)
    return true
  } catch (error) {
    console.error(`Failed to send ${label} email:`, error)
    return false
  }
}

export async function sendBookingEmail(booking: any) {
  await send('Booking', {
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
  // Une réservation saisie au back-office peut n'avoir aucune adresse : il n'y a
  // alors personne à prévenir, et ce n'est pas une anomalie.
  if (!booking.guestEmail) return false

  const roomName = booking.room?.name || booking.room?.slug || booking.roomId
  const nights = Math.max(Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000,
  ), 1)

  await send('Booking (guest)', {
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

/**
 * Réponse au client après décision de l'hôtel au back-office.
 *
 * Un seul envoi couvre la confirmation et l'annulation : les deux messages
 * partagent le même récapitulatif, seuls l'objet et le paragraphe d'ouverture
 * changent — les garder ensemble évite qu'ils divergent avec le temps.
 */
export async function sendBookingDecisionToGuest(booking: any) {
  const confirmed = booking.status === 'confirmed'
  const roomName = booking.roomName || booking.room?.name || booking.room?.slug || booking.roomId
  const nights = Math.max(Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000,
  ), 1)

  const opening = confirmed
    ? `<p>Bonne nouvelle : votre réservation au Royal Palace Antsirabe est
       <strong>confirmée</strong>. Nous avons hâte de vous accueillir.</p>
       <p>L'arrivée se fait à partir de 14 h et le départ jusqu'à 12 h. Si vous
       arrivez en soirée ou si vous souhaitez organiser un transfert, prévenez-nous
       en répondant à ce message.</p>`
    : `<p>Nous vous informons que votre réservation au Royal Palace Antsirabe a été
       <strong>annulée</strong>. Nous sommes désolés de ne pouvoir vous accueillir
       à ces dates.</p>
       <p>Si cette annulation ne vient pas de vous ou si vous souhaitez d'autres
       dates, répondez simplement à ce message : notre équipe cherchera une
       solution avec vous.</p>`

  return send(`Booking ${booking.status} (guest)`, {
    to: booking.guestEmail,
    replyTo: HOTEL_EMAIL,
    subject: confirmed
      ? 'Votre réservation est confirmée — Royal Palace Antsirabe'
      : 'Votre réservation a été annulée — Royal Palace Antsirabe',
    html: `
      <p>Bonjour ${esc(booking.guestName)},</p>
      ${opening}
      <p><strong>Récapitulatif :</strong><br>
      Chambre : ${esc(roomName)}<br>
      Arrivée : ${date(booking.checkIn)}<br>
      Départ : ${date(booking.checkOut)}<br>
      Durée : ${nights} nuit(s)<br>
      Chambres : ${esc(booking.rooms)}<br>
      Voyageurs : ${esc(booking.adults)} adulte(s)${booking.children ? `, ${esc(booking.children)} enfant(s)` : ''}<br>
      Référence : ${esc(booking.id)}</p>
      <p>Cordialement,<br>L'équipe Royal Palace Antsirabe</p>
    `,
  })
}

export async function sendContactEmail(contact: any) {
  await send('Contact', {
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
