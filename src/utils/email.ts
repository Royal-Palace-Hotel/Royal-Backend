import { Resend } from 'resend'
import { MAIL_FROM, MAIL_TO, RESEND_API_KEY } from '../config/env'

const configured = Boolean(RESEND_API_KEY && MAIL_FROM && MAIL_TO)
const resend = configured ? new Resend(RESEND_API_KEY) : null

/** Guest-supplied values land in an HTML body, so they must be escaped. */
const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!
  ))

const multiline = (value: unknown) => esc(value).replace(/\n/g, '<br>')

const date = (value: unknown, fallback = 'Non précisée') =>
  value ? new Date(value as string).toLocaleDateString('fr-FR') : fallback

interface EmailField {
  label: string
  value: unknown
}

const emailFields = (fields: EmailField[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse">
    ${fields.map(({ label, value }) => `
      <tr>
        <td style="width:34%;padding:11px 12px 11px 0;border-bottom:1px solid #eceae4;color:#77766f;font-size:13px;vertical-align:top">${esc(label)}</td>
        <td style="padding:11px 0;border-bottom:1px solid #eceae4;color:#252720;font-size:14px;font-weight:600;line-height:1.5;vertical-align:top">${String(value ?? '').trim() ? esc(value) : '—'}</td>
      </tr>
    `).join('')}
  </table>
`

const emailSection = (title: string, content: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0;border:1px solid #eceae4;border-radius:8px;border-collapse:separate">
    <tr>
      <td style="padding:18px 20px">
        <h2 style="margin:0 0 8px;color:#26352e;font-size:15px;line-height:1.4">${esc(title)}</h2>
        ${content}
      </td>
    </tr>
  </table>
`

const emailMessage = (message: unknown) => `
  <div style="padding:15px 16px;background:#f7f6f2;border-left:3px solid #c9a961;border-radius:3px;color:#34352f;font-size:14px;line-height:1.7">
    ${multiline(message)}
  </div>
`

const emailBadge = (label: string, background = '#f6f0df', color = '#80652c') => `
  <span style="display:inline-block;padding:6px 10px;background:${background};border-radius:20px;color:${color};font-size:11px;font-weight:700;letter-spacing:0.7px;text-transform:uppercase">${esc(label)}</span>
`

const emailShell = (title: string, preview: string, content: string) => `
  <!doctype html>
  <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${esc(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f2ed;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preview)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f2ed">
        <tr>
          <td align="center" style="padding:30px 12px">
            <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border-collapse:separate;border-spacing:0;border-radius:10px;overflow:hidden">
              <tr><td style="height:5px;background:#c9a961;font-size:0;line-height:0">&nbsp;</td></tr>
              <tr>
                <td style="padding:25px 32px;background:#263a32">
                  <div style="color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:2px">ROYAL PALACE</div>
                  <div style="margin-top:5px;color:#ddc990;font-size:10px;font-weight:700;letter-spacing:2.4px">ANTSIRABE · MADAGASCAR</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 32px 32px">
                  <div style="margin-bottom:10px;color:#9a7b3d;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Royal Palace Antsirabe</div>
                  <h1 style="margin:0;color:#252720;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:600;line-height:1.3">${esc(title)}</h1>
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px;background:#f7f6f2;border-top:1px solid #eceae4;color:#77766f;font-size:12px;line-height:1.6">
                  Royal Palace Antsirabe<br>
                  <span style="color:#9a7b3d">Une attention particulière, à chaque séjour.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

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
  if (!resend) {
    console.warn(`${label} email skipped: RESEND_API_KEY, MAIL_FROM, or MAIL_TO is not configured`)
    return false
  }
  try {
    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
    })
    if (error) {
      console.error(`Failed to send ${label} email:`, error)
      return false
    }
    console.log(`${label} email sent:`, data.id)
    return true
  } catch (error) {
    console.error(`Failed to send ${label} email:`, error)
    return false
  }
}

export async function sendBookingEmail(booking: any) {
  const guestName = booking.guestName || 'Client'
  const status = booking.status === 'confirmed'
    ? 'Confirmée'
    : booking.status === 'cancelled'
      ? 'Annulée'
      : 'En attente'

  await send('Booking', {
    to: MAIL_TO,
    replyTo: booking.guestEmail,
    subject: `Nouvelle réservation - ${guestName}`,
    html: emailShell(
      'Nouvelle demande de réservation',
      `${guestName} · ${date(booking.checkIn)} au ${date(booking.checkOut)}`,
      `
        <p style="margin:13px 0 0;color:#686961;font-size:14px;line-height:1.6">
          Une nouvelle demande vient d'être reçue sur le site.
        </p>
        <div style="margin-top:18px">${emailBadge('Nouvelle demande')}</div>
        ${emailSection('Coordonnées du client', emailFields([
          { label: 'Nom', value: guestName },
          { label: 'E-mail', value: booking.guestEmail },
          { label: 'Téléphone', value: booking.guestPhone || 'Non renseigné' },
        ]))}
        ${emailSection('Détails du séjour', emailFields([
          { label: 'Chambre', value: booking.room?.name || booking.room?.translationKey || booking.roomId },
          { label: 'Arrivée', value: date(booking.checkIn) },
          { label: 'Départ', value: date(booking.checkOut) },
          { label: 'Chambres', value: booking.rooms },
          { label: 'Adultes', value: booking.adults },
          { label: 'Enfants', value: booking.children },
          { label: 'Statut', value: status },
          { label: 'Référence', value: booking.id },
        ]))}
        <p style="margin:22px 0 0;color:#77766f;font-size:13px;line-height:1.6">
          Vous pouvez répondre directement à cet e-mail pour contacter le client.
        </p>
      `,
    ),
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
    replyTo: MAIL_TO,
    subject: 'Nous avons bien reçu votre demande de réservation',
    html: emailShell(
      'Votre demande a bien été reçue',
      `Votre demande de réservation au Royal Palace Antsirabe est en attente de confirmation.`,
      `
        <p style="margin:14px 0 0;color:#34352f;font-size:15px;line-height:1.7">Bonjour ${esc(booking.guestName)},</p>
        <p style="margin:10px 0 0;color:#686961;font-size:14px;line-height:1.7">
          Merci d'avoir choisi le Royal Palace Antsirabe. Notre équipe a bien reçu votre demande et vous répondra prochainement.
        </p>
        <div style="margin-top:18px">${emailBadge('En attente de confirmation')}</div>
        ${emailSection('Récapitulatif de votre séjour', emailFields([
          { label: 'Chambre', value: roomName },
          { label: 'Arrivée', value: date(booking.checkIn) },
          { label: 'Départ', value: date(booking.checkOut) },
          { label: 'Durée', value: `${nights} nuit(s)` },
          { label: 'Chambres', value: booking.rooms },
          { label: 'Voyageurs', value: `${booking.adults} adulte(s)${booking.children ? `, ${booking.children} enfant(s)` : ''}` },
          { label: 'Référence', value: booking.id },
        ]))}
        <p style="margin:22px 0 0;color:#686961;font-size:14px;line-height:1.7">Pour toute question, répondez simplement à ce message.</p>
      `,
    ),
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
    ? `Bonne nouvelle : votre réservation au Royal Palace Antsirabe est confirmée. Nous avons hâte de vous accueillir.`
    : `Nous vous informons que votre réservation au Royal Palace Antsirabe a été annulée. Nous sommes désolés de ne pouvoir vous accueillir à ces dates.`

  return send(`Booking ${booking.status} (guest)`, {
    to: booking.guestEmail,
    replyTo: MAIL_TO,
    subject: confirmed
      ? 'Votre réservation est confirmée — Royal Palace Antsirabe'
      : 'Votre réservation a été annulée — Royal Palace Antsirabe',
    html: emailShell(
      confirmed ? 'Votre réservation est confirmée' : 'Mise à jour de votre réservation',
      confirmed ? 'Votre séjour au Royal Palace Antsirabe est confirmé.' : 'Votre demande de réservation a été annulée.',
      `
        <p style="margin:14px 0 0;color:#34352f;font-size:15px;line-height:1.7">Bonjour ${esc(booking.guestName)},</p>
        <p style="margin:10px 0 0;color:#686961;font-size:14px;line-height:1.7">${esc(opening)}</p>
        <div style="margin-top:18px">${confirmed
          ? emailBadge('Réservation confirmée', '#eaf2eb', '#41684a')
          : emailBadge('Réservation annulée', '#f7eaea', '#954d4d')}</div>
        ${confirmed ? `
          <p style="margin:18px 0 0;color:#686961;font-size:14px;line-height:1.7">
            L'arrivée se fait à partir de 14 h et le départ jusqu'à 12 h. Pour organiser un transfert ou signaler une arrivée tardive, répondez à ce message.
          </p>
        ` : ''}
        ${emailSection('Récapitulatif de votre séjour', emailFields([
          { label: 'Chambre', value: roomName },
          { label: 'Arrivée', value: date(booking.checkIn) },
          { label: 'Départ', value: date(booking.checkOut) },
          { label: 'Durée', value: `${nights} nuit(s)` },
          { label: 'Chambres', value: booking.rooms },
          { label: 'Voyageurs', value: `${booking.adults} adulte(s)${booking.children ? `, ${booking.children} enfant(s)` : ''}` },
          { label: 'Référence', value: booking.id },
        ]))}
      `,
    ),
  })
}

export async function sendContactEmail(contact: any) {
  await send('Contact', {
    to: MAIL_TO,
    replyTo: contact.email,
    subject: `Formulaire de contact - ${contact.subject || 'Sans sujet'}`,
    html: emailShell(
      'Nouveau message de contact',
      `${contact.name} vous a envoyé un message depuis le site.`,
      `
        <p style="margin:13px 0 0;color:#686961;font-size:14px;line-height:1.6">Un nouveau message a été envoyé depuis le formulaire du site.</p>
        ${emailSection('Coordonnées', emailFields([
          { label: 'Nom', value: contact.name },
          { label: 'E-mail', value: contact.email },
          { label: 'Téléphone', value: contact.phone || 'Non renseigné' },
          { label: 'Sujet', value: contact.subject || 'Sans sujet' },
          { label: 'Date', value: date(contact.createdAt, '-') },
        ]))}
        ${emailSection('Message', emailMessage(contact.message))}
        <p style="margin:22px 0 0;color:#77766f;font-size:13px;line-height:1.6">Vous pouvez répondre directement à cet e-mail pour contacter l'expéditeur.</p>
      `,
    ),
  })
}

export async function sendEventInquiryEmail(inquiry: any) {
  const eventDate = date(inquiry.eventDate)

  // 1. Notification à l'hôtel — « Répondre » écrit directement au client.
  await send('Event inquiry (hotel)', {
    to: MAIL_TO,
    replyTo: inquiry.email,
    subject: `Demande de devis événement - ${inquiry.name}`,
    html: emailShell(
      'Nouvelle demande de devis',
      `${inquiry.name} demande un devis pour un événement.`,
      `
        <p style="margin:13px 0 0;color:#686961;font-size:14px;line-height:1.6">Une demande de devis événementiel a été envoyée depuis le site.</p>
        ${emailSection('Coordonnées', emailFields([
          { label: 'Nom', value: inquiry.name },
          { label: 'E-mail', value: inquiry.email },
          { label: 'Téléphone', value: inquiry.phone || 'Non renseigné' },
          { label: 'Sujet', value: inquiry.subject || 'Non renseigné' },
        ]))}
        ${emailSection('Détails de l’événement', emailFields([
          { label: 'Date souhaitée', value: eventDate },
          { label: 'Nombre d’invités', value: inquiry.guestCount },
        ]))}
        ${emailSection('Message', emailMessage(inquiry.message))}
        <p style="margin:22px 0 0;color:#77766f;font-size:13px;line-height:1.6">Vous pouvez répondre directement à cet e-mail pour contacter l'expéditeur.</p>
      `,
    ),
  })

  // 2. Accusé de réception au client.
  await send('Event inquiry (guest)', {
    to: inquiry.email,
    replyTo: MAIL_TO,
    subject: 'Nous avons bien reçu votre demande de devis',
    html: emailShell(
      'Votre demande de devis a bien été reçue',
      'Notre équipe événementielle vous répondra prochainement.',
      `
        <p style="margin:14px 0 0;color:#34352f;font-size:15px;line-height:1.7">Bonjour ${esc(inquiry.name)},</p>
        <p style="margin:10px 0 0;color:#686961;font-size:14px;line-height:1.7">Merci pour votre demande. Notre équipe événementielle vous répondra dans les plus brefs délais.</p>
        ${emailSection('Récapitulatif de votre demande', emailFields([
          { label: 'Date souhaitée', value: eventDate },
          { label: 'Nombre d’invités', value: inquiry.guestCount },
        ]))}
        <p style="margin:22px 0 0;color:#686961;font-size:14px;line-height:1.7">Cordialement,<br>L'équipe Royal Palace Antsirabe</p>
      `,
    ),
  })
}
