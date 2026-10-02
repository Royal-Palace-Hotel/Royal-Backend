/**
 * Test global de l'API Royal Palace.
 *
 *   npm run dev          (dans un premier terminal)
 *   npm run test:api     (dans un second)
 *
 * Options :
 *   --base=http://host:port/api   cible une autre API (défaut : $API_URL ou localhost:4000/api)
 *   --email= --password=          identifiants admin (défaut : $TEST_ADMIN_EMAIL / $TEST_ADMIN_PASSWORD)
 *   --verbose                     affiche le détail de chaque réponse en échec
 *   --keep                        ne supprime pas les données créées par le test
 *
 * Le script est une boîte noire : il n'importe rien de src/. Il parle à l'API
 * en HTTP, puis nettoie derrière lui en SQL (réservations, messages et
 * inscriptions newsletter n'ayant pas d'endpoint de suppression).
 *
 * Il est rejouable : chaque exécution utilise un identifiant unique, et les
 * assertions portent sur la forme des réponses, pas sur le nombre de lignes —
 * ajouter des chambres depuis le back-office ne le fait donc pas échouer.
 */

import 'dotenv/config'
import { createConnection } from 'mysql2/promise'

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2)
const arg = (name: string) => {
  const match = argv.find(value => value.startsWith(`--${name}=`))
  return match ? match.slice(name.length + 3) : undefined
}
const flag = (name: string) => argv.includes(`--${name}`)

const API = (arg('base') || process.env.API_URL || 'http://localhost:4000/api').replace(/\/$/, '')
const ROOT = API.replace(/\/api$/, '')
const ADMIN_EMAIL = arg('email') || process.env.TEST_ADMIN_EMAIL || 'admin@royalpalaceantsirabe.com'
const ADMIN_PASSWORD = arg('password') || process.env.TEST_ADMIN_PASSWORD || 'admin123'
const VERBOSE = flag('verbose')
const KEEP = flag('keep')

/** Identifiant unique : rend le script rejouable et le nettoyage ciblé. */
const RUN = Date.now().toString(36)
const MAIL_DOMAIN = `${RUN}.apitest.local`
const mail = (who: string) => `${who}@${MAIL_DOMAIN}`

/* ------------------------------------------------------------------ */
/* Mini-harnais                                                        */
/* ------------------------------------------------------------------ */

const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m',
}

let passed = 0
let failed = 0
let rateLimited = 0
const failures: string[] = []

function section(title: string) {
  console.log(`\n${C.bold}${C.cyan}▸ ${title}${C.reset}`)
}

function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++
    console.log(`  ${C.green}✓${C.reset} ${label}`)
    return true
  }
  failed++
  failures.push(label)
  console.log(`  ${C.red}✗ ${label}${C.reset}`)
  if (detail !== undefined && (VERBOSE || detail)) {
    const text = typeof detail === 'string' ? detail : JSON.stringify(detail)
    console.log(`    ${C.dim}${text.slice(0, VERBOSE ? 2000 : 300)}${C.reset}`)
  }
  return false
}

function note(message: string) {
  console.log(`  ${C.dim}· ${message}${C.reset}`)
}

/* ------------------------------------------------------------------ */
/* Client HTTP                                                         */
/* ------------------------------------------------------------------ */

interface Result {
  status: number
  ok: boolean
  body: any
}

let token = ''

async function call(
  method: string,
  path: string,
  options: { body?: unknown; auth?: boolean; bearer?: string; root?: boolean } = {},
): Promise<Result> {
  const bearer = options.bearer ?? (options.auth ? token : '')
  // GET et HEAD ne peuvent pas porter de corps : fetch lève une TypeError.
  const sendBody = options.body !== undefined && method !== 'GET' && method !== 'HEAD'
  const res = await fetch(`${options.root ? ROOT : API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    ...(sendBody ? { body: JSON.stringify(options.body) } : {}),
    signal: AbortSignal.timeout(20_000),
  })
  let body: any = null
  try { body = await res.json() } catch { /* corps vide ou non-JSON */ }
  if (res.status === 429) rateLimited++
  return { status: res.status, ok: res.ok, body }
}

const isArray = (value: unknown): value is any[] => Array.isArray(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)

/**
 * Récupère un export CSV brut.
 *
 * On lit les octets plutôt que `res.text()` : le décodeur du navigateur retire
 * le BOM UTF-8, or c'est précisément lui qu'on veut vérifier (sans BOM, Excel
 * sous Windows affiche « Ã© » à la place de « é »).
 */
async function fetchCsv(path: string, bearer = token) {
  const res = await fetch(API + path, {
    headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    signal: AbortSignal.timeout(20_000),
  })
  const bytes = new Uint8Array(await res.arrayBuffer())
  const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
  return {
    status: res.status,
    type: res.headers.get('content-type') || '',
    hasBom,
    text: new TextDecoder('utf-8').decode(bytes.subarray(hasBom ? 3 : 0)),
  }
}

/* ------------------------------------------------------------------ */
/* Ressources créées, supprimées à la fin                              */
/* ------------------------------------------------------------------ */

const created = {
  rooms: [] as string[],
  menuSections: [] as string[],
  menuItems: [] as string[],
  eventRooms: [] as string[],
  spa: [] as string[],
  gallery: [] as string[],
  discover: [] as string[],
  users: [] as string[],
  uploads: [] as string[],
}

/* ------------------------------------------------------------------ */
/* Pré-vol                                                             */
/* ------------------------------------------------------------------ */

async function preflight() {
  console.log(`${C.bold}Test global de l'API Royal Palace${C.reset}`)
  console.log(`${C.dim}cible    ${API}`)
  console.log(`admin    ${ADMIN_EMAIL}`)
  console.log(`run      ${RUN}${C.reset}`)

  try {
    const res = await fetch(`${ROOT}/health`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (error) {
    console.error(`\n${C.red}✗ API injoignable sur ${ROOT}${C.reset}`)
    console.error(`  ${(error as Error).message}`)
    console.error(`\n  Démarre-la d'abord :  ${C.bold}npm run dev${C.reset}`)
    console.error(`  Ou vise une autre adresse :  npm run test:api -- --base=http://host:port/api`)
    process.exit(1)
  }
}

/* ------------------------------------------------------------------ */
/* 1. Infrastructure                                                   */
/* ------------------------------------------------------------------ */

async function testInfrastructure() {
  section('Infrastructure')

  const health = await call('GET', '/health', { root: true })
  check('GET /health répond 200', health.status === 200, health.body)
  check('  le corps contient status + timestamp',
    health.body?.status === 'ok' && typeof health.body?.timestamp === 'string', health.body)

  const unknown = await call('GET', '/route/inexistante')
  check('une route inconnue renvoie 404 en JSON',
    unknown.status === 404 && typeof unknown.body?.error === 'string', unknown)
}

/* ------------------------------------------------------------------ */
/* 2. Contenu public                                                   */
/* ------------------------------------------------------------------ */

async function testPublicContent() {
  section('Contenu public')

  const rooms = await call('GET', '/content/rooms')
  const roomList = rooms.body?.data
  check('GET /content/rooms', rooms.status === 200 && isArray(roomList), rooms)
  if (isArray(roomList) && roomList.length > 0) {
    const room = roomList[0]
    check('  chaque chambre porte slug, prix numérique, images et équipements',
      typeof room.slug === 'string' && typeof room.price === 'number' &&
      isArray(room.images) && isArray(room.amenities), room)
  } else {
    note('aucune chambre en base — lance `npm run db:seed`')
  }

  const menu = await call('GET', '/content/menu')
  const sections = menu.body?.data
  check('GET /content/menu', menu.status === 200 && isArray(sections), menu)
  if (isArray(sections) && sections.length > 0) {
    check('  chaque section porte titre FR/EN et une liste de plats',
      typeof sections[0].title === 'string' && typeof sections[0].titleEn === 'string' &&
      isArray(sections[0].items), sections[0])
  }

  const restaurant = await call('GET', '/restaurant/menu')
  check('GET /restaurant/menu renvoie la même carte',
    restaurant.status === 200 &&
    JSON.stringify(restaurant.body?.data) === JSON.stringify(sections), restaurant)

  const spa = await call('GET', '/content/spa')
  check('GET /content/spa', spa.status === 200 && isArray(spa.body?.data), spa)

  const events = await call('GET', '/content/events')
  check('GET /content/events', events.status === 200 && isArray(events.body?.data), events)

  for (const path of ['/content/gallery', '/content/discover']) {
    const res = await call('GET', path)
    check(`GET ${path}`, res.status === 200, res)
  }

  const bad = await call('GET', '/content/type-inconnu')
  check('GET /content/type-inconnu renvoie 404', bad.status === 404, bad)
}

/* ------------------------------------------------------------------ */
/* 3. Les routes publiques ne doivent JAMAIS exiger de jeton           */
/*    (garde-fou contre un routeur monté sur /api seul)                */
/* ------------------------------------------------------------------ */

async function testPublicRoutesAreOpen() {
  section('Les routes publiques restent ouvertes (sans jeton)')

  const probes: Array<[string, string, unknown?]> = [
    ['GET', '/content/rooms'],
    ['GET', '/restaurant/menu'],
    ['POST', '/bookings/availability', { checkIn: '2030-01-10', checkOut: '2030-01-12', rooms: 1 }],
    ['POST', '/bookings', {}],
    ['POST', '/contact', {}],
    ['POST', '/contact/event-inquiry', {}],
    ['POST', '/newsletter', {}],
    ['POST', '/auth/login', { email: mail('inconnu'), password: 'motdepasse' }],
  ]

  for (const [method, path, body] of probes) {
    const res = await call(method, path, { body })
    // 400 (payload volontairement vide) est acceptable ; 401 ne l'est jamais,
    // sauf pour /auth/login dont c'est la réponse normale si l'identifiant est faux.
    const authRequired = res.status === 401 && path !== '/auth/login'
    check(`${method} ${path} n'exige pas de jeton`, !authRequired,
      authRequired ? `reçu 401 : ${JSON.stringify(res.body)}` : undefined)
  }
}

/* ------------------------------------------------------------------ */
/* 4. Disponibilité                                                    */
/* ------------------------------------------------------------------ */

async function testAvailability() {
  section('Disponibilité')

  const whole = await call('POST', '/bookings/availability', {
    body: { checkIn: '2030-01-10', checkOut: '2030-01-12', rooms: 1 },
  })
  check('disponibilité sur tout l\'hôtel',
    whole.status === 200 && typeof whole.body?.available === 'boolean' &&
    typeof whole.body?.totalRooms === 'number', whole)

  const rooms = await call('GET', '/content/rooms')
  const slug = rooms.body?.data?.[0]?.slug
  if (slug) {
    const single = await call('POST', '/bookings/availability', {
      body: { checkIn: '2030-01-10', checkOut: '2030-01-12', rooms: 1, roomId: slug },
    })
    check('disponibilité pour une chambre précise (roomId pris en compte)',
      single.status === 200 && single.body?.roomId === slug &&
      single.body?.totalRooms <= whole.body?.totalRooms, single)
  }

  const unknown = await call('POST', '/bookings/availability', {
    body: { checkIn: '2030-01-10', checkOut: '2030-01-12', rooms: 1, roomId: 'chambre-fantome' },
  })
  check('roomId inconnu renvoie 404', unknown.status === 404, unknown)

  const inverted = await call('POST', '/bookings/availability', {
    body: { checkIn: '2030-01-12', checkOut: '2030-01-10', rooms: 1 },
  })
  check('dates inversées rejetées en 400', inverted.status === 400, inverted)

  const incomplete = await call('POST', '/bookings/availability', { body: { rooms: 1 } })
  check('payload incomplet rejeté en 400 avec le détail des champs',
    incomplete.status === 400 && isArray(incomplete.body?.details), incomplete)
}

/* ------------------------------------------------------------------ */
/* 5. Réservations                                                     */
/* ------------------------------------------------------------------ */

async function testBookings() {
  section('Réservations')

  const rooms = await call('GET', '/content/rooms')
  const slug = rooms.body?.data?.[0]?.slug

  // La chambre la moins chère accueille 2 personnes : on reste dans sa capacité.
  const withRoom = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Chambre', guestEmail: mail('reservation'), guestPhone: '+261 34 00 000 00',
      checkIn: '2030-02-01', checkOut: '2030-02-04', rooms: 1, adults: 1, children: 1, roomId: slug,
    },
  })
  const booking = withRoom.body?.data
  check('création avec une chambre choisie',
    withRoom.status === 201 && typeof booking?.id === 'string', withRoom)
  check('  la réponse contient le contenu complet de la chambre',
    booking?.room?.slug === slug && isArray(booking?.room?.amenities) &&
    isArray(booking?.room?.images), booking?.room)
  check('  le statut initial est "pending"', booking?.status === 'pending', booking?.status)

  const withoutRoom = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Sans Chambre', guestEmail: mail('auto'),
      checkIn: '2030-03-01', checkOut: '2030-03-03', rooms: 1, adults: 2, children: 0,
    },
  })
  check('création sans roomId : une chambre est attribuée automatiquement',
    withoutRoom.status === 201 && typeof withoutRoom.body?.data?.roomId === 'string', withoutRoom)

  const defaults = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Defaut', guestEmail: mail('defaut'),
      checkIn: '2030-04-01', checkOut: '2030-04-02', rooms: 1, adults: 1, roomId: slug,
    },
  })
  check('`children` absent prend bien la valeur par défaut 0',
    defaults.status === 201 && defaults.body?.data?.children === 0, defaults)

  const coerced = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Coercition', guestEmail: mail('coercition'),
      checkIn: '2030-05-01', checkOut: '2030-05-02',
      rooms: '1', adults: '2', children: '0', roomId: slug,
    },
  })
  check('les nombres envoyés en chaîne sont convertis',
    coerced.status === 201 && coerced.body?.data?.adults === 2, coerced)

  // Surréservation : on demande plus d'unités que la chambre n'en possède,
  // tout en restant sous le plafond de 10 chambres par réservation. Le nombre
  // d'unités n'est pas exposé publiquement, on le lit via la disponibilité.
  const capacity = await call('POST', '/bookings/availability', {
    body: { checkIn: '2030-02-01', checkOut: '2030-02-04', rooms: 1, roomId: slug },
  })
  const totalRooms = capacity.body?.totalRooms
  if (typeof totalRooms === 'number' && totalRooms < 10) {
    const tooMany = await call('POST', '/bookings', {
      body: {
        guestName: 'Test Survente', guestEmail: mail('survente'),
        checkIn: '2030-02-01', checkOut: '2030-02-04',
        rooms: totalRooms + 1, adults: 1, children: 0, roomId: slug,
      },
    })
    check('surréservation rejetée en 409', tooMany.status === 409, tooMany)
  } else {
    note(`chambre à ${totalRooms} unités : test de surréservation ignoré (plafond à 10)`)
  }

  const invalid = await call('POST', '/bookings', { body: { guestName: 'x' } })
  check('payload invalide rejeté en 400 avec le détail des champs',
    invalid.status === 400 && isArray(invalid.body?.details), invalid)

  const badEmail = await call('POST', '/bookings', {
    body: {
      guestName: 'Test', guestEmail: 'pas-un-email',
      checkIn: '2030-06-01', checkOut: '2030-06-02', rooms: 1, adults: 1, roomId: slug,
    },
  })
  check('adresse e-mail invalide rejetée en 400', badEmail.status === 400, badEmail)

  section('Réservations — bornes de bon sens')

  const past = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Passe', guestEmail: mail('passe'),
      checkIn: '2020-01-01', checkOut: '2020-01-03', rooms: 1, adults: 1, roomId: slug,
    },
  })
  check('une arrivée dans le passé est refusée en 400', past.status === 400, past)

  const tooLong = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Long', guestEmail: mail('long'),
      checkIn: '2030-01-01', checkOut: '2030-12-31', rooms: 1, adults: 1, roomId: slug,
    },
  })
  check('un séjour de plus de 90 nuits est refusé en 400', tooLong.status === 400, tooLong)

  const tooManyRooms = await call('POST', '/bookings', {
    body: {
      guestName: 'Test Rooms', guestEmail: mail('rooms'),
      checkIn: '2030-09-01', checkOut: '2030-09-02', rooms: 50, adults: 1, roomId: slug,
    },
  })
  check('plus de 10 chambres en une réservation est refusé en 400', tooManyRooms.status === 400, tooManyRooms)

  // Capacité : une chambre de N personnes ne peut pas accueillir plus.
  const rooms2 = await call('GET', '/content/rooms')
  const smallest = (rooms2.body?.data ?? [])
    .slice()
    .sort((a: any, b: any) => a.maxGuests - b.maxGuests)[0]
  if (smallest) {
    const overCapacity = await call('POST', '/bookings', {
      body: {
        guestName: 'Test Capacite', guestEmail: mail('capacite'),
        checkIn: '2030-09-10', checkOut: '2030-09-12',
        rooms: 1, adults: smallest.maxGuests + 3, children: 0, roomId: smallest.slug,
      },
    })
    check('un groupe trop grand pour la chambre choisie est refusé en 400',
      overCapacity.status === 400, overCapacity)

    const exactCapacity = await call('POST', '/bookings', {
      body: {
        guestName: 'Test Capacite OK', guestEmail: mail('capaciteok'),
        checkIn: '2030-09-10', checkOut: '2030-09-12',
        rooms: 1, adults: smallest.maxGuests, children: 0, roomId: smallest.slug,
      },
    })
    check('  un groupe pile à la capacité passe', exactCapacity.status === 201, exactCapacity)
  }

  // La disponibilité reste consultable sur une période passée : c'est une
  // lecture, elle n'engage rien.
  const pastAvailability = await call('POST', '/bookings/availability', {
    body: { checkIn: '2020-01-01', checkOut: '2020-01-03', rooms: 1 },
  })
  check('la disponibilité reste consultable sur une période passée',
    pastAvailability.status === 200, pastAvailability)
}

/* ------------------------------------------------------------------ */
/* 6. Concurrence : la dernière chambre ne peut être vendue qu'une fois */
/* ------------------------------------------------------------------ */

async function testConcurrency() {
  section('Concurrence (transaction + verrou sur la dernière unité)')

  const room = await call('POST', '/admin/rooms', {
    auth: true,
    body: {
      slug: `test-concurrence-${RUN}`, name: 'Test concurrence', nameEn: 'Concurrency test',
      description: 'Chambre temporaire', descriptionEn: 'Temporary room',
      price: 100, currency: 'EUR', size: 20, maxGuests: 2,
      totalUnits: 1, images: [], amenities: [],
    },
  })
  const roomId = room.body?.data?.id
  if (!check('chambre temporaire créée (1 seule unité)', room.status === 200 && !!roomId, room)) return
  created.rooms.push(roomId)

  const attempts = await Promise.all(
    Array.from({ length: 5 }, (unused, index) => call('POST', '/bookings', {
      body: {
        guestName: `Test Parallele ${index}`, guestEmail: mail(`parallele${index}`),
        checkIn: '2030-07-01', checkOut: '2030-07-03',
        rooms: 1, adults: 1, children: 0, roomId,
      },
    })),
  )

  const accepted = attempts.filter(result => result.status === 201).length
  const rejected = attempts.filter(result => result.status === 409).length
  const other = attempts.filter(result => result.status !== 201 && result.status !== 409)

  check('5 réservations simultanées : une seule aboutit',
    accepted === 1, `acceptées=${accepted} refusées=${rejected} autres=${other.map(r => r.status).join(',')}`)
  if (other.length > 0) {
    note(`réponses inattendues : ${other.map(r => `${r.status} ${JSON.stringify(r.body?.error)}`).join(' | ')}`)
  }
}

/* ------------------------------------------------------------------ */
/* 7. Contact et newsletter                                            */
/* ------------------------------------------------------------------ */

async function testContactAndNewsletter() {
  section('Contact, devis et newsletter')

  const contact = await call('POST', '/contact', {
    body: {
      name: 'Test Contact', email: mail('contact'), phone: '+261 34 00 000 00',
      subject: 'Demande de renseignement', message: 'Message de test suffisamment long.',
    },
  })
  check('POST /contact', contact.status === 201 && typeof contact.body?.data?.id === 'string', contact)

  const shortMessage = await call('POST', '/contact', {
    body: { name: 'Test', email: mail('court'), phone: '+261340000000', message: 'court' },
  })
  check('message trop court rejeté en 400', shortMessage.status === 400, shortMessage)

  const inquiry = await call('POST', '/contact/event-inquiry', {
    body: {
      name: 'Test Devis', email: mail('devis'), phone: '+261 34 00 000 00',
      subject: 'Mariage', message: 'Nous organisons un mariage, merci de nous recontacter.',
      eventDate: '2030-08-15', guestCount: '120',
    },
  })
  check('POST /contact/event-inquiry',
    inquiry.status === 201 && inquiry.body?.data?.guestCount === 120, inquiry)
  check('  la date de l\'événement est conservée',
    !!inquiry.body?.data?.eventDate, inquiry.body?.data)

  const fresh = await call('POST', '/newsletter', { body: { email: mail('newsletter') } })
  check('inscription newsletter', fresh.status === 201, fresh)

  const again = await call('POST', '/newsletter', { body: { email: mail('newsletter') } })
  check('réinscription de la même adresse renvoie 200 (et non une erreur)',
    again.status === 200, again)

  const invalid = await call('POST', '/newsletter', { body: { email: 'pas-un-email' } })
  check('adresse invalide rejetée en 400', invalid.status === 400, invalid)
}

/* ------------------------------------------------------------------ */
/* 8. Authentification                                                 */
/* ------------------------------------------------------------------ */

async function testAuth() {
  section('Authentification')

  const wrongPassword = await call('POST', '/auth/login', {
    body: { email: ADMIN_EMAIL, password: 'mauvais-mot-de-passe' },
  })
  check('mot de passe erroné rejeté en 401', wrongPassword.status === 401, wrongPassword)

  const unknownUser = await call('POST', '/auth/login', {
    body: { email: mail('inexistant'), password: 'mauvais-mot-de-passe' },
  })
  check('compte inexistant : même réponse qu\'un mot de passe erroné',
    unknownUser.status === 401 && unknownUser.body?.error === wrongPassword.body?.error,
    `${unknownUser.body?.error} / ${wrongPassword.body?.error}`)

  const login = await call('POST', '/auth/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  token = login.body?.data?.token || ''
  const loggedIn = check('connexion administrateur', login.status === 200 && !!token, login)
  if (!loggedIn) {
    console.error(`\n  ${C.yellow}Crée un compte :${C.reset} npm run create-admin -- ${ADMIN_EMAIL} <motdepasse> admin`)
    console.error(`  ${C.yellow}Ou passe les identifiants :${C.reset} npm run test:api -- --email=… --password=…`)
    process.exit(1)
  }
  check('  la réponse ne contient pas le hash du mot de passe',
    login.body?.data?.user?.password === undefined, login.body?.data?.user)

  const me = await call('GET', '/auth/me', { auth: true })
  check('GET /auth/me avec un jeton valide',
    me.status === 200 && me.body?.data?.user?.email === ADMIN_EMAIL.toLowerCase(), me)

  const anonymous = await call('GET', '/auth/me')
  check('GET /auth/me sans jeton renvoie 401', anonymous.status === 401, anonymous)

  const garbage = await call('GET', '/auth/me', { bearer: 'jeton.invalide.xxx' })
  check('GET /auth/me avec un jeton invalide renvoie 401', garbage.status === 401, garbage)

  const register = await call('POST', '/auth/register', {
    body: {
      email: mail('nouveau'), password: 'motdepasse123',
      role: 'admin', adminInviteCode: 'code-au-hasard',
    },
  })
  check('inscription refusée sans le bon code d\'invitation (403)',
    register.status === 403, register)
}

/* ------------------------------------------------------------------ */
/* 9. Le back-office est protégé                                       */
/* ------------------------------------------------------------------ */

async function testAdminIsProtected() {
  section('Le back-office exige un jeton')

  const routes: Array<[string, string]> = [
    ['GET', '/admin/rooms'],
    ['POST', '/admin/rooms'],
    ['GET', '/admin/menu/sections'],
    ['GET', '/admin/menu/items'],
    ['GET', '/admin/event-rooms'],
    ['GET', '/admin/bookings'],
    ['GET', '/admin/contact-messages'],
    ['DELETE', '/admin/rooms/peu-importe'],
  ]

  for (const [method, path] of routes) {
    const res = await call(method, path, { body: {} })
    check(`${method} ${path} sans jeton renvoie 401`, res.status === 401, res)
  }

  const garbage = await call('GET', '/admin/rooms', { bearer: 'jeton.bidon.xxx' })
  check('jeton invalide refusé en 401', garbage.status === 401, garbage)
}

/* ------------------------------------------------------------------ */
/* 10. CRUD chambres                                                   */
/* ------------------------------------------------------------------ */

async function testAdminRooms() {
  section('Back-office — chambres')

  const list = await call('GET', '/admin/rooms', { auth: true })
  check('GET /admin/rooms', list.status === 200 && isArray(list.body?.data), list)

  const slug = `test-chambre-${RUN}`
  const createdRoom = await call('POST', '/admin/rooms', {
    auth: true,
    body: {
      slug, name: 'Chambre de test', nameEn: 'Test room',
      description: 'Description FR', descriptionEn: 'Description EN',
      price: '150', currency: 'EUR', size: '30', maxGuests: '2', totalUnits: '3',
      images: ['/images/rooms/room-1.jpg', '/images/rooms/room-2.jpg'],
      amenities: ['wifi', 'tv', 'ac'],
    },
  })
  const room = createdRoom.body?.data
  const roomId = room?.id
  if (!check('création d\'une chambre', createdRoom.status === 200 && !!roomId, createdRoom)) return
  created.rooms.push(roomId)

  check('  les nombres envoyés en chaîne sont convertis',
    room.price === 150 && room.size === 30 && room.totalUnits === 3, room)
  check('  images et équipements enregistrés dans l\'ordre',
    room.images?.length === 2 && room.amenities?.join(',') === 'wifi,tv,ac', room)
  check('  translationKey est généré quand il n\'est pas fourni',
    typeof room.translationKey === 'string' && room.translationKey.length > 0, room)

  const one = await call('GET', `/admin/rooms/${roomId}`, { auth: true })
  check('GET /admin/rooms/:id', one.status === 200 && one.body?.data?.slug === slug, one)

  const onPublic = await call('GET', '/content/rooms')
  check('la chambre apparaît sur le site public',
    isArray(onPublic.body?.data) && onPublic.body.data.some((r: any) => r.slug === slug), undefined)

  const updated = await call('PUT', `/admin/rooms/${roomId}`, {
    auth: true,
    body: {
      slug, name: 'Chambre de test modifiée', nameEn: 'Test room updated',
      description: 'FR', descriptionEn: 'EN', price: 175, currency: 'EUR',
      size: 32, maxGuests: 3, totalUnits: 2, images: [], amenities: ['wifi'],
    },
  })
  check('PUT /admin/rooms/:id',
    updated.status === 200 && updated.body?.data?.price === 175 &&
    updated.body?.data?.name === 'Chambre de test modifiée', updated)
  check('  les listes sont remplacées, pas accumulées',
    updated.body?.data?.images?.length === 0 && updated.body?.data?.amenities?.length === 1,
    updated.body?.data)

  const duplicate = await call('POST', '/admin/rooms', {
    auth: true,
    body: {
      slug, name: 'Doublon', nameEn: 'Duplicate', description: 'x', descriptionEn: 'x',
      price: 10, currency: 'EUR', size: 10, maxGuests: 1, totalUnits: 1,
      images: [], amenities: [],
    },
  })
  check('un slug déjà pris est refusé en 409', duplicate.status === 409, duplicate)
  if (duplicate.status === 200 && duplicate.body?.data?.id) created.rooms.push(duplicate.body.data.id)

  // Le point sensible : un upsert sur la contrainte UNIQUE du slug écrasait
  // la chambre existante tout en répondant 404.
  const untouched = await call('GET', `/admin/rooms/${roomId}`, { auth: true })
  check('  la chambre visée par le doublon n\'a pas été écrasée',
    untouched.status === 200 && untouched.body?.data?.price === 175 &&
    untouched.body?.data?.name === 'Chambre de test modifiée', untouched.body?.data)

  const invalid = await call('POST', '/admin/rooms', { auth: true, body: { slug: '' } })
  check('chambre invalide rejetée en 400', invalid.status === 400, invalid)

  const missing = await call('GET', '/admin/rooms/identifiant-inexistant', { auth: true })
  check('GET /admin/rooms/:inconnu renvoie 404', missing.status === 404, missing)
}

/* ------------------------------------------------------------------ */
/* 11. CRUD carte du restaurant                                        */
/* ------------------------------------------------------------------ */

async function testAdminMenu() {
  section('Back-office — carte du restaurant')

  const sections = await call('GET', '/admin/menu/sections', { auth: true })
  check('GET /admin/menu/sections', sections.status === 200 && isArray(sections.body?.data), sections)

  const createdSection = await call('POST', '/admin/menu/sections', {
    auth: true, body: { title: `Section ${RUN}`, titleEn: `Section ${RUN} EN`, sortOrder: 99 },
  })
  const sectionId = createdSection.body?.data?.id
  if (!check('création d\'une section', createdSection.status === 200 && !!sectionId, createdSection)) return
  created.menuSections.push(sectionId)

  const updatedSection = await call('PUT', `/admin/menu/sections/${sectionId}`, {
    auth: true, body: { title: `Section ${RUN} v2`, titleEn: 'Section v2', sortOrder: 99 },
  })
  check('PUT /admin/menu/sections/:id',
    updatedSection.status === 200 && updatedSection.body?.data?.title === `Section ${RUN} v2`, updatedSection)

  const ghostSection = await call('PUT', '/admin/menu/sections/identifiant-inexistant', {
    auth: true, body: { title: 'x', titleEn: 'x', sortOrder: 0 },
  })
  check('modifier une section inexistante renvoie 404 (et ne la crée pas)',
    ghostSection.status === 404, ghostSection)

  const items = await call('GET', '/admin/menu/items', { auth: true })
  check('GET /admin/menu/items', items.status === 200 && isArray(items.body?.data), items)

  const createdItem = await call('POST', '/admin/menu/items', {
    auth: true,
    body: {
      name: `Plat ${RUN}`, nameEn: `Dish ${RUN}`, description: 'FR', descriptionEn: 'EN',
      price: '25000', sectionId, sortOrder: 0,
    },
  })
  const itemId = createdItem.body?.data?.id
  check('création d\'un plat', createdItem.status === 200 && !!itemId, createdItem)
  if (itemId) created.menuItems.push(itemId)
  check('  le prix envoyé en chaîne est converti',
    createdItem.body?.data?.price === 25000, createdItem.body?.data)

  const updatedItem = await call('PUT', `/admin/menu/items/${itemId}`, {
    auth: true,
    body: {
      name: `Plat ${RUN} v2`, nameEn: 'Dish v2', description: 'FR', descriptionEn: 'EN',
      price: 26000, sectionId, sortOrder: 1,
    },
  })
  check('PUT /admin/menu/items/:id',
    updatedItem.status === 200 && updatedItem.body?.data?.price === 26000, updatedItem)

  const orphan = await call('POST', '/admin/menu/items', {
    auth: true,
    body: {
      name: 'Orphelin', nameEn: 'Orphan', description: 'x', descriptionEn: 'x',
      price: 1, sectionId: 'section-inexistante', sortOrder: 0,
    },
  })
  check('un plat rattaché à une section inexistante est refusé en 404',
    orphan.status === 404, orphan)

  const onPublic = await call('GET', '/content/menu')
  const publicSection = onPublic.body?.data?.find((s: any) => s.id === sectionId)
  check('la section et son plat apparaissent sur la carte publique',
    !!publicSection && publicSection.items?.length === 1, publicSection)
}

/* ------------------------------------------------------------------ */
/* 12. CRUD salles de réunion                                          */
/* ------------------------------------------------------------------ */

async function testAdminEventRooms() {
  section('Back-office — salles de réunion')

  const list = await call('GET', '/admin/event-rooms', { auth: true })
  check('GET /admin/event-rooms', list.status === 200 && isArray(list.body?.data), list)

  const createdRoom = await call('POST', '/admin/event-rooms', {
    auth: true,
    body: {
      name: `Salle ${RUN}`, nameEn: `Hall ${RUN}`, description: 'FR', descriptionEn: 'EN',
      image: '/images/events/events-1.jpg', capacity: '80', schedule: '8h — 18h',
      price: '500', currency: 'EUR', sortOrder: 99,
    },
  })
  const eventRoomId = createdRoom.body?.data?.id
  if (!check('création d\'une salle', createdRoom.status === 200 && !!eventRoomId, createdRoom)) return
  created.eventRooms.push(eventRoomId)

  check('  capacité et prix envoyés en chaîne sont convertis',
    createdRoom.body?.data?.capacity === 80 && createdRoom.body?.data?.price === 500,
    createdRoom.body?.data)

  const nulled = await call('PUT', `/admin/event-rooms/${eventRoomId}`, {
    auth: true,
    body: {
      name: `Salle ${RUN}`, nameEn: `Hall ${RUN}`, description: 'FR', descriptionEn: 'EN',
      image: '/images/events/events-1.jpg', capacity: null, schedule: null,
      price: null, currency: null, sortOrder: 99,
    },
  })
  check('les champs facultatifs acceptent null',
    nulled.status === 200 && nulled.body?.data?.capacity === null &&
    nulled.body?.data?.price === null, nulled)

  const emptyStrings = await call('PUT', `/admin/event-rooms/${eventRoomId}`, {
    auth: true,
    body: {
      name: `Salle ${RUN}`, nameEn: `Hall ${RUN}`, description: 'FR', descriptionEn: 'EN',
      image: '/images/events/events-1.jpg', capacity: '', schedule: '',
      price: '', currency: '', sortOrder: 99,
    },
  })
  check('les champs vides du formulaire sont traités comme null',
    emptyStrings.status === 200 && emptyStrings.body?.data?.capacity === null, emptyStrings)

  const ghost = await call('PUT', '/admin/event-rooms/identifiant-inexistant', {
    auth: true,
    body: {
      name: 'x', nameEn: 'x', description: 'x', descriptionEn: 'x',
      image: '/x.jpg', sortOrder: 0,
    },
  })
  check('modifier une salle inexistante renvoie 404', ghost.status === 404, ghost)

  // `event_rooms.key` est UNIQUE : réutiliser une clé existante ne doit pas
  // écraser la salle qui la porte.
  const existing = (await call('GET', '/admin/event-rooms', { auth: true })).body?.data?.[0]
  if (existing?.key) {
    const snapshot = JSON.stringify(existing)
    const collision = await call('POST', '/admin/event-rooms', {
      auth: true,
      body: {
        key: existing.key, name: 'COLLISION', nameEn: 'COLLISION',
        description: 'x', descriptionEn: 'x', image: '/x.jpg', sortOrder: 0,
      },
    })
    check('une clé déjà prise est refusée en 409', collision.status === 409, collision)
    if (collision.status === 200 && collision.body?.data?.id) created.eventRooms.push(collision.body.data.id)

    const after = (await call('GET', '/admin/event-rooms', { auth: true }))
      .body?.data?.find((r: any) => r.id === existing.id)
    check('  la salle existante n\'a pas été écrasée',
      JSON.stringify(after) === snapshot, { avant: existing, apres: after })
  }

  const onPublic = await call('GET', '/content/events')
  check('la salle apparaît sur le site public',
    isArray(onPublic.body?.data) && onPublic.body.data.some((r: any) => r.id === eventRoomId), undefined)
}

/* ------------------------------------------------------------------ */
/* 13. Réservations et messages côté back-office                       */
/* ------------------------------------------------------------------ */

async function testAdminBookingsAndMessages() {
  section('Back-office — réservations et messages')

  const bookings = await call('GET', '/admin/bookings', { auth: true })
  check('GET /admin/bookings', bookings.status === 200 && isArray(bookings.body?.data), bookings)

  const mine = bookings.body?.data?.find((b: any) => String(b.guestEmail).endsWith(MAIL_DOMAIN))
  check('  les réservations créées plus haut sont listées', !!mine,
    `aucune réservation @${MAIL_DOMAIN}`)
  if (mine) {
    check('  chaque ligne porte le nom de la chambre jointe',
      'roomName' in mine && 'checkIn' in mine && 'status' in mine, mine)
  }

  const pending = await call('GET', '/admin/bookings?status=pending', { auth: true })
  check('filtre ?status=pending',
    pending.status === 200 && pending.body.data.every((b: any) => b.status === 'pending'), pending)

  const range = await call('GET', '/admin/bookings?from=2030-01-01&to=2031-01-01', { auth: true })
  check('filtre ?from=&to=', range.status === 200 && isArray(range.body?.data), range)

  const badFilter = await call('GET', '/admin/bookings?status=valeur-invalide', { auth: true })
  check('filtre invalide rejeté en 400', badFilter.status === 400, badFilter)

  if (mine) {
    const confirmed = await call('PATCH', `/admin/bookings/${mine.id}`, {
      auth: true, body: { status: 'confirmed' },
    })
    check('PATCH /admin/bookings/:id change le statut',
      confirmed.status === 200 && confirmed.body?.data?.status === 'confirmed', confirmed)

    const badStatus = await call('PATCH', `/admin/bookings/${mine.id}`, {
      auth: true, body: { status: 'statut-inconnu' },
    })
    check('statut invalide rejeté en 400', badStatus.status === 400, badStatus)
  }

  const ghostBooking = await call('PATCH', '/admin/bookings/identifiant-inexistant', {
    auth: true, body: { status: 'confirmed' },
  })
  check('PATCH sur une réservation inexistante renvoie 404', ghostBooking.status === 404, ghostBooking)

  const messages = await call('GET', '/admin/contact-messages', { auth: true })
  check('GET /admin/contact-messages', messages.status === 200 && isArray(messages.body?.data), messages)

  const events = await call('GET', '/admin/contact-messages?type=event', { auth: true })
  check('filtre ?type=event',
    events.status === 200 && events.body.data.every((m: any) => m.type === 'event'), events)

  const newOnes = await call('GET', '/admin/contact-messages?status=new', { auth: true })
  check('filtre ?status=new',
    newOnes.status === 200 && newOnes.body.data.every((m: any) => m.status === 'new'), newOnes)

  const myMessage = messages.body?.data?.find((m: any) => String(m.email).endsWith(MAIL_DOMAIN))
  check('  les messages créés plus haut sont listés', !!myMessage, `aucun message @${MAIL_DOMAIN}`)
  if (myMessage) {
    const read = await call('PATCH', `/admin/contact-messages/${myMessage.id}`, {
      auth: true, body: { status: 'read' },
    })
    check('PATCH /admin/contact-messages/:id change le statut',
      read.status === 200 && read.body?.data?.status === 'read', read)
  }

  const ghostMessage = await call('PATCH', '/admin/contact-messages/identifiant-inexistant', {
    auth: true, body: { status: 'read' },
  })
  check('PATCH sur un message inexistant renvoie 404', ghostMessage.status === 404, ghostMessage)
}

/* ------------------------------------------------------------------ */
/* 14. Suppressions                                                    */
/* ------------------------------------------------------------------ */

async function testDeletes() {
  section('Back-office — suppressions')

  const itemId = created.menuItems.pop()
  if (itemId) {
    const res = await call('DELETE', `/admin/menu/items/${itemId}`, { auth: true })
    check('DELETE /admin/menu/items/:id', res.status === 200, res)
  }

  const sectionId = created.menuSections.pop()
  if (sectionId) {
    const res = await call('DELETE', `/admin/menu/sections/${sectionId}`, { auth: true })
    check('DELETE /admin/menu/sections/:id', res.status === 200, res)
  }

  const eventRoomId = created.eventRooms.pop()
  if (eventRoomId) {
    const res = await call('DELETE', `/admin/event-rooms/${eventRoomId}`, { auth: true })
    check('DELETE /admin/event-rooms/:id', res.status === 200, res)
  }

  const ghost = await call('DELETE', '/admin/rooms/identifiant-inexistant', { auth: true })
  check('supprimer une ressource inexistante renvoie 404', ghost.status === 404, ghost)
}

/* ------------------------------------------------------------------ */
/* 15. Tableau de bord                                                 */
/* ------------------------------------------------------------------ */

async function testStats() {
  section('Tableau de bord')

  const res = await call('GET', '/admin/stats', { auth: true })
  const stats = res.body?.data
  if (!check('GET /admin/stats', res.status === 200 && !!stats, res)) return

  check('  compteurs de réservations',
    isNumber(stats.bookings?.total) && isNumber(stats.bookings?.pending) &&
    isNumber(stats.bookings?.confirmed) && isNumber(stats.bookings?.upcomingArrivals), stats.bookings)
  check('  vue du jour : arrivées, départs, chambres occupées',
    isNumber(stats.today?.arrivals) && isNumber(stats.today?.departures) &&
    isNumber(stats.today?.roomsOccupied), stats.today)
  check('  occupation : taux entre 0 et 100',
    isNumber(stats.occupancy?.rate) && stats.occupancy.rate >= 0 && stats.occupancy.rate <= 100,
    stats.occupancy)
  check('  occupation : nuitées <= capacité',
    stats.occupancy.nightsSold <= stats.occupancy.capacity, stats.occupancy)
  check('  chiffre d’affaires estimé', isNumber(stats.revenue?.estimatedThisMonth), stats.revenue)
  check('  messages et abonnés',
    isNumber(stats.messages?.unread) && isNumber(stats.newsletter?.subscribers), stats)
  check('  activité récente et répartitions',
    isArray(stats.recentBookings) && isArray(stats.recentMessages) &&
    isArray(stats.bookingsByRoom) && isArray(stats.bookingsByMonth), Object.keys(stats))
}

/* ------------------------------------------------------------------ */
/* 16. Spa, galerie, Découvrir                                         */
/* ------------------------------------------------------------------ */

async function testSpa() {
  section('Back-office — soins du spa')

  const list = await call('GET', '/admin/spa', { auth: true })
  check('GET /admin/spa', list.status === 200 && isArray(list.body?.data), list)

  const createdSpa = await call('POST', '/admin/spa', {
    auth: true,
    body: {
      name: `Soin ${RUN}`, nameEn: `Treatment ${RUN}`, duration: '60 min', durationEn: '60 min',
      description: 'FR', descriptionEn: 'EN', price: '55000', sortOrder: 99, isActive: true,
    },
  })
  const spaId = createdSpa.body?.data?.id
  if (!check('création d’un soin', createdSpa.status === 200 && !!spaId, createdSpa)) return
  created.spa.push(spaId)
  check('  le prix envoyé en chaîne est converti', createdSpa.body?.data?.price === 55000, createdSpa.body?.data)

  const onPublic = await call('GET', '/content/spa')
  check('le soin apparaît sur la page publique',
    isArray(onPublic.body?.data) && onPublic.body.data.some((row: any) => row.id === spaId), undefined)

  // isActive = false doit le retirer du site public, sans le supprimer.
  const hidden = await call('PUT', `/admin/spa/${spaId}`, {
    auth: true,
    body: {
      name: `Soin ${RUN}`, nameEn: `Treatment ${RUN}`, price: 55000, sortOrder: 99, isActive: false,
    },
  })
  check('PUT /admin/spa/:id — masquer le soin', hidden.status === 200, hidden)

  const afterHide = await call('GET', '/content/spa')
  check('un soin masqué disparaît du site public',
    !afterHide.body.data.some((row: any) => row.id === spaId), undefined)
  const stillInAdmin = await call('GET', '/admin/spa', { auth: true })
  check('  mais reste visible au back-office',
    stillInAdmin.body.data.some((row: any) => row.id === spaId), undefined)

  // `isActive: "false"` en chaîne ne doit pas être interprété comme vrai.
  const stringFalse = await call('PUT', `/admin/spa/${spaId}`, {
    auth: true,
    body: {
      name: `Soin ${RUN}`, nameEn: `Treatment ${RUN}`, price: 55000, sortOrder: 99, isActive: 'false',
    },
  })
  check('la chaîne "false" est bien lue comme faux',
    stringFalse.status === 200 && stringFalse.body?.data?.isActive === false, stringFalse.body?.data)

  const ghost = await call('PUT', '/admin/spa/identifiant-inexistant', {
    auth: true, body: { name: 'x', nameEn: 'x', price: 1, sortOrder: 0 },
  })
  check('modifier un soin inexistant renvoie 404', ghost.status === 404, ghost)
}

async function testGallery() {
  section('Back-office — galerie photo')

  const list = await call('GET', '/admin/gallery', { auth: true })
  check('GET /admin/gallery', list.status === 200 && isArray(list.body?.data), list)

  const filtered = await call('GET', '/admin/gallery?category=spa', { auth: true })
  check('filtre ?category=spa',
    filtered.status === 200 && filtered.body.data.every((row: any) => row.category === 'spa'), filtered)

  const badCategory = await call('GET', '/admin/gallery?category=inexistante', { auth: true })
  check('catégorie invalide rejetée en 400', badCategory.status === 400, badCategory)

  const createdImage = await call('POST', '/admin/gallery', {
    auth: true,
    body: {
      src: `/images/test-${RUN}.jpg`, alt: `Image de test ${RUN}`, altEn: 'Test image',
      category: 'gallery', sortOrder: 99,
    },
  })
  const imageId = createdImage.body?.data?.id
  if (!check('création d’une image', createdImage.status === 200 && !!imageId, createdImage)) return
  created.gallery.push(imageId)

  const onPublic = await call('GET', '/content/gallery')
  check('l’image apparaît sur l’API publique',
    isArray(onPublic.body?.data) && onPublic.body.data.some((row: any) => row.id === imageId), undefined)

  const updated = await call('PUT', `/admin/gallery/${imageId}`, {
    auth: true,
    body: {
      src: `/images/test-${RUN}.jpg`, alt: 'Légende modifiée', altEn: null,
      category: 'rooms', sortOrder: 98,
    },
  })
  check('PUT /admin/gallery/:id',
    updated.status === 200 && updated.body?.data?.category === 'rooms' &&
    updated.body?.data?.alt === 'Légende modifiée', updated.body?.data)

  const invalid = await call('POST', '/admin/gallery', {
    auth: true, body: { src: '/x.jpg', alt: 'x', category: 'pas-une-categorie', sortOrder: 0 },
  })
  check('catégorie invalide à la création rejetée en 400', invalid.status === 400, invalid)
}

async function testDiscover() {
  section('Back-office — page « Découvrir »')

  const list = await call('GET', '/admin/discover', { auth: true })
  check('GET /admin/discover', list.status === 200 && isArray(list.body?.data), list)

  const attractions = await call('GET', '/admin/discover?type=attraction', { auth: true })
  check('filtre ?type=attraction',
    attractions.status === 200 && attractions.body.data.every((row: any) => row.type === 'attraction'),
    attractions)

  const createdItem = await call('POST', '/admin/discover', {
    auth: true,
    body: {
      type: 'activity', title: `Activité ${RUN}`, titleEn: `Activity ${RUN}`,
      text: 'Description FR', textEn: 'Description EN',
      icon: 'Waves', image: '/images/discover/antsirabe-1.jpg', sortOrder: 99,
    },
  })
  const itemId = createdItem.body?.data?.id
  if (!check('création d’une activité', createdItem.status === 200 && !!itemId, createdItem)) return
  created.discover.push(itemId)

  const publicView = await call('GET', '/content/discover')
  check('l’API publique sépare activités et attractions',
    publicView.status === 200 && isArray(publicView.body?.data?.activities) &&
    isArray(publicView.body?.data?.attractions), publicView.body?.data)
  check('  la nouvelle activité y figure',
    publicView.body.data.activities.some((row: any) => row.id === itemId), undefined)

  // `key` est UNIQUE mais nullable : plusieurs éléments sans clé doivent passer.
  const noKey = await call('POST', '/admin/discover', {
    auth: true,
    body: { type: 'attraction', title: `Attraction ${RUN}`, titleEn: `Nearby ${RUN}`, sortOrder: 99 },
  })
  check('un second élément sans clé de traduction est accepté', noKey.status === 200, noKey)
  if (noKey.body?.data?.id) created.discover.push(noKey.body.data.id)

  const badType = await call('POST', '/admin/discover', {
    auth: true, body: { type: 'inconnu', title: 'x', titleEn: 'x', sortOrder: 0 },
  })
  check('type invalide rejeté en 400', badType.status === 400, badType)
}

/* ------------------------------------------------------------------ */
/* 17. Pagination, recherche, tri                                      */
/* ------------------------------------------------------------------ */

async function testListControls() {
  section('Pagination, recherche et tri')

  const page = await call('GET', '/admin/bookings?page=1&perPage=2', { auth: true })
  check('GET /admin/bookings?perPage=2 renvoie meta',
    page.status === 200 && isNumber(page.body?.meta?.total) && page.body.meta.perPage === 2,
    page.body?.meta)
  check('  au plus perPage lignes', (page.body?.data?.length ?? 0) <= 2, page.body?.meta)

  if ((page.body?.meta?.total ?? 0) > 2) {
    const second = await call('GET', '/admin/bookings?page=2&perPage=2', { auth: true })
    check('  la page 2 renvoie des lignes différentes',
      second.status === 200 &&
      second.body.data[0]?.id !== page.body.data[0]?.id, undefined)
  } else {
    note('moins de 3 réservations : test de seconde page ignoré')
  }

  const perPageTooBig = await call('GET', '/admin/bookings?perPage=9999', { auth: true })
  check('perPage au-delà de la limite est rejeté en 400', perPageTooBig.status === 400, perPageTooBig)

  const search = await call('GET', `/admin/bookings?q=${encodeURIComponent('Test Chambre')}`, { auth: true })
  check('recherche par nom de client',
    search.status === 200 && search.body.data.every((row: any) => /Test Chambre/i.test(row.guestName)),
    search.body?.data?.map((r: any) => r.guestName))

  const noMatch = await call('GET', '/admin/bookings?q=zzzzz-aucun-resultat', { auth: true })
  check('une recherche sans résultat renvoie une liste vide, pas une erreur',
    noMatch.status === 200 && noMatch.body.data.length === 0 && noMatch.body.meta.total === 0, noMatch)

  const sorted = await call('GET', '/admin/bookings?sort=checkIn&order=asc&perPage=50', { auth: true })
  const dates = (sorted.body?.data ?? []).map((row: any) => new Date(row.checkIn).getTime())
  check('tri par date d’arrivée croissante',
    sorted.status === 200 && dates.every((value: number, i: number) => i === 0 || dates[i - 1] <= value),
    dates)

  const badSort = await call('GET', '/admin/bookings?sort=guest_name;DROP', { auth: true })
  check('une colonne de tri non autorisée est rejetée en 400', badSort.status === 400, badSort)

  const messages = await call('GET', '/admin/contact-messages?perPage=1', { auth: true })
  check('les messages sont paginés de la même façon',
    messages.status === 200 && messages.body?.meta?.perPage === 1, messages.body?.meta)
}

/* ------------------------------------------------------------------ */
/* 18. Fiche détaillée                                                 */
/* ------------------------------------------------------------------ */

async function testDetails() {
  section('Fiches détaillées')

  const list = await call('GET', '/admin/bookings?perPage=1', { auth: true })
  const first = list.body?.data?.[0]
  if (!first) { note('aucune réservation : section ignorée'); return }

  const detail = await call('GET', `/admin/bookings/${first.id}`, { auth: true })
  check('GET /admin/bookings/:id',
    detail.status === 200 && detail.body?.data?.id === first.id, detail)
  check('  la fiche calcule le total estimé',
    isNumber(detail.body?.data?.estimatedTotal) && isNumber(detail.body?.data?.nights),
    detail.body?.data)

  const ghost = await call('GET', '/admin/bookings/identifiant-inexistant', { auth: true })
  check('réservation inexistante renvoie 404', ghost.status === 404, ghost)

  const messages = await call('GET', '/admin/contact-messages?perPage=1', { auth: true })
  const message = messages.body?.data?.[0]
  if (message) {
    const one = await call('GET', `/admin/contact-messages/${message.id}`, { auth: true })
    check('GET /admin/contact-messages/:id', one.status === 200 && one.body?.data?.id === message.id, one)
  }
}

/* ------------------------------------------------------------------ */
/* 19. Abonnés et exports CSV                                          */
/* ------------------------------------------------------------------ */

async function testSubscribersAndExports() {
  section('Abonnés à la newsletter')

  const list = await call('GET', '/admin/subscribers', { auth: true })
  check('GET /admin/subscribers',
    list.status === 200 && isArray(list.body?.data) && isNumber(list.body?.meta?.total), list)

  const mine = list.body?.data?.find((row: any) => String(row.email).endsWith(MAIL_DOMAIN))
  check('  l’inscription créée plus haut est listée', !!mine, `aucun abonné @${MAIL_DOMAIN}`)

  const search = await call('GET', `/admin/subscribers?q=${RUN}`, { auth: true })
  check('recherche par adresse',
    search.status === 200 && search.body.data.every((row: any) => row.email.includes(RUN)), search)

  if (mine) {
    const removed = await call('DELETE', `/admin/subscribers/${mine.id}`, { auth: true })
    check('DELETE /admin/subscribers/:id', removed.status === 200, removed)
  }
  const ghost = await call('DELETE', '/admin/subscribers/identifiant-inexistant', { auth: true })
  check('abonné inexistant renvoie 404', ghost.status === 404, ghost)

  section('Exports CSV')
  for (const [path, label] of [
    ['/admin/bookings/export', 'réservations'],
    ['/admin/contact-messages/export', 'messages'],
    ['/admin/subscribers/export', 'abonnés'],
  ] as const) {
    const csv = await fetchCsv(path)
    check(`export ${label} : 200 et type text/csv`,
      csv.status === 200 && csv.type.includes('text/csv'), `${csv.status} ${csv.type}`)
    check(`  ${label} : BOM UTF-8 et ligne d’en-têtes`,
      csv.hasBom && csv.text.includes('","'), `bom=${csv.hasBom} ${csv.text.slice(0, 60)}`)
  }

  const unauthorised = await fetchCsv('/admin/bookings/export', '')
  check('un export sans jeton renvoie 401', unauthorised.status === 401, unauthorised.status)

  // Protection contre l'injection de formules Excel : le nom vient d'un
  // visiteur et n'est pas contraint, contrairement à l'adresse e-mail.
  const payload = `=HYPERLINK("http://exemple.test")`
  const injected = await call('POST', '/contact', {
    body: {
      name: payload, email: mail('injection'), phone: '+261340000000',
      subject: 'Test injection CSV', message: 'Message de test pour l’export CSV.',
    },
  })
  if (injected.status === 201) {
    const csv = await fetchCsv('/admin/contact-messages/export')
    const line = csv.text.split('\r\n').find((row) => row.includes('HYPERLINK'))
    // Les guillemets internes sont doublés par l'échappement CSV ; ce qui
    // compte est l'apostrophe placée devant le « = ».
    check('une cellule commençant par « = » est neutralisée dans le CSV',
      !!line && line.includes(`"'=HYPERLINK`), line)
    check('  un numéro commençant par « + » l’est aussi',
      !!line && line.includes(`"'+261340000000"`), line)
  } else {
    note(`message piégé refusé (${injected.status}) : test d'injection CSV ignoré`)
  }
}

/* ------------------------------------------------------------------ */
/* 20. Comptes, rôles et journal                                       */
/* ------------------------------------------------------------------ */

async function testUsersAndRoles() {
  section('Comptes d’administration')

  const list = await call('GET', '/admin/users', { auth: true })
  check('GET /admin/users', list.status === 200 && isArray(list.body?.data), list)
  check('  aucun hash de mot de passe n’est renvoyé',
    (list.body?.data ?? []).every((row: any) => row.password === undefined), undefined)

  const staffEmail = mail('staff')
  const staffPassword = 'motdepasse-test-123'
  const createdStaff = await call('POST', '/admin/users', {
    auth: true,
    body: { email: staffEmail, password: staffPassword, name: 'Compte de test', role: 'staff' },
  })
  const staffId = createdStaff.body?.data?.id
  if (!check('création d’un compte « personnel »', createdStaff.status === 200 && !!staffId, createdStaff)) return
  created.users.push(staffId)

  const duplicate = await call('POST', '/admin/users', {
    auth: true, body: { email: staffEmail, password: staffPassword, role: 'staff' },
  })
  check('une adresse déjà utilisée est refusée en 409', duplicate.status === 409, duplicate)

  const weak = await call('POST', '/admin/users', {
    auth: true, body: { email: mail('faible'), password: '123', role: 'staff' },
  })
  check('un mot de passe trop court est refusé en 400', weak.status === 400, weak)

  // Connexion avec le nouveau compte.
  const staffLogin = await call('POST', '/auth/login', {
    body: { email: staffEmail, password: staffPassword },
  })
  const staffToken = staffLogin.body?.data?.token
  check('le compte « personnel » peut se connecter', staffLogin.status === 200 && !!staffToken, staffLogin)

  if (staffToken) {
    const allowed = await call('GET', '/admin/rooms', { bearer: staffToken })
    check('  il accède bien à la gestion du contenu', allowed.status === 200, allowed)

    const forbidden = await call('GET', '/admin/users', { bearer: staffToken })
    check('  mais pas à la gestion des comptes (403)', forbidden.status === 403, forbidden)

    const forbiddenAudit = await call('GET', '/admin/audit-log', { bearer: staffToken })
    check('  ni au journal des actions (403)', forbiddenAudit.status === 403, forbiddenAudit)
  }

  // Garde-fous sur son propre compte.
  const selfDemote = await call('PUT', `/admin/users/${list.body.data.find((u: any) => u.email === ADMIN_EMAIL.toLowerCase())?.id}`, {
    auth: true, body: { role: 'staff' },
  })
  check('on ne peut pas modifier son propre rôle', selfDemote.status === 400, selfDemote)

  const selfDisable = await call('PUT', `/admin/users/${list.body.data.find((u: any) => u.email === ADMIN_EMAIL.toLowerCase())?.id}`, {
    auth: true, body: { isActive: false },
  })
  check('on ne peut pas désactiver son propre compte', selfDisable.status === 400, selfDisable)

  // Désactivation : le jeton existant doit cesser de fonctionner immédiatement.
  if (staffToken) {
    const disabled = await call('PUT', `/admin/users/${staffId}`, { auth: true, body: { isActive: false } })
    check('désactivation du compte de test', disabled.status === 200, disabled)

    const revoked = await call('GET', '/admin/rooms', { bearer: staffToken })
    check('  son jeton est refusé dès la requête suivante (403)', revoked.status === 403, revoked)

    const blockedLogin = await call('POST', '/auth/login', {
      body: { email: staffEmail, password: staffPassword },
    })
    check('  et il ne peut plus se reconnecter (403)', blockedLogin.status === 403, blockedLogin)

    await call('PUT', `/admin/users/${staffId}`, { auth: true, body: { isActive: true } })
  }

  const ghost = await call('PUT', '/admin/users/identifiant-inexistant', {
    auth: true, body: { role: 'staff' },
  })
  check('compte inexistant renvoie 404', ghost.status === 404, ghost)

  section('Mot de passe et journal')

  const wrongCurrent = await call('PUT', '/admin/account/password', {
    auth: true, body: { currentPassword: 'pas-le-bon', newPassword: 'nouveau-mot-de-passe-1' },
  })
  check('changer son mot de passe exige l’actuel (400)', wrongCurrent.status === 400, wrongCurrent)

  const shortNew = await call('PUT', '/admin/account/password', {
    auth: true, body: { currentPassword: ADMIN_PASSWORD, newPassword: 'court' },
  })
  check('un nouveau mot de passe trop court est refusé (400)', shortNew.status === 400, shortNew)

  // Révocation des jetons au changement de mot de passe. On opère sur un
  // compte jetable : le compte d'administration principal n'est jamais touché.
  const victimEmail = mail('rotation')
  const firstPassword = 'motdepasse-rotation-1'
  const secondPassword = 'motdepasse-rotation-2'
  const victim = await call('POST', '/admin/users', {
    auth: true, body: { email: victimEmail, password: firstPassword, role: 'staff' },
  })
  if (victim.body?.data?.id) {
    created.users.push(victim.body.data.id)

    const session = await call('POST', '/auth/login', {
      body: { email: victimEmail, password: firstPassword },
    })
    const oldToken = session.body?.data?.token
    check('connexion du compte jetable', session.status === 200 && !!oldToken, session)

    const changed = await call('PUT', '/admin/account/password', {
      bearer: oldToken,
      body: { currentPassword: firstPassword, newPassword: secondPassword },
    })
    const newToken = changed.body?.data?.token
    check('le changement de mot de passe renvoie un jeton neuf',
      changed.status === 200 && !!newToken && newToken !== oldToken, changed)

    const withOld = await call('GET', '/admin/rooms', { bearer: oldToken })
    check('  l’ancien jeton est révoqué (401)', withOld.status === 401, withOld)

    const withNew = await call('GET', '/admin/rooms', { bearer: newToken })
    check('  le nouveau jeton fonctionne', withNew.status === 200, withNew)

    const reused = await call('PUT', '/admin/account/password', {
      bearer: newToken,
      body: { currentPassword: secondPassword, newPassword: secondPassword },
    })
    check('réutiliser le même mot de passe est refusé en 400', reused.status === 400, reused)

    // Une réinitialisation par un administrateur doit aussi couper les sessions.
    const reset = await call('PUT', `/admin/users/${victim.body.data.id}`, {
      auth: true, body: { password: 'motdepasse-rotation-3' },
    })
    check('un administrateur peut réinitialiser un mot de passe', reset.status === 200, reset)

    const afterReset = await call('GET', '/admin/rooms', { bearer: newToken })
    check('  la session de la personne concernée est coupée (401)', afterReset.status === 401, afterReset)
  }

  const audit = await call('GET', '/admin/audit-log?limit=50', { auth: true })
  check('GET /admin/audit-log', audit.status === 200 && isArray(audit.body?.data), audit)
  check('  les créations de ce test y figurent',
    (audit.body?.data ?? []).some((row: any) => row.action === 'create'),
    (audit.body?.data ?? []).slice(0, 3))
  check('  la connexion est tracée',
    (audit.body?.data ?? []).some((row: any) => row.action === 'login'), undefined)

  const filtered = await call('GET', '/admin/audit-log?action=create&limit=10', { auth: true })
  check('filtre ?action=create',
    filtered.status === 200 && filtered.body.data.every((row: any) => row.action === 'create'), filtered)
}

/* ------------------------------------------------------------------ */
/* 21. Envoi d'images                                                  */
/* ------------------------------------------------------------------ */

/** PNG 1×1 valide, pour ne dépendre d'aucun fichier du dépôt. */
const SAMPLE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

async function sendFiles(
  files: Array<[string, Buffer, string]>,
  bearer: string | null = token,
) {
  const body = new FormData()
  for (const [name, bytes, type] of files) {
    body.append('files', new Blob([new Uint8Array(bytes)], { type }), name)
  }
  const res = await fetch(`${API}/admin/uploads`, {
    method: 'POST',
    headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    body,
    signal: AbortSignal.timeout(20_000),
  })
  let payload: any = null
  try { payload = await res.json() } catch { /* corps non-JSON */ }
  return { status: res.status, body: payload }
}

async function testUploads() {
  section('Envoi d’images')

  const first = await sendFiles([['photo.png', SAMPLE_PNG, 'image/png']])
  const file = first.body?.data?.[0]
  if (!check('POST /admin/uploads accepte une image', first.status === 201 && !!file?.url, first)) return
  created.uploads.push(file.filename)

  check('  le chemin renvoyé est relatif (/uploads/…)', file.url.startsWith('/uploads/'), file.url)
  check('  le nom du fichier est régénéré', !file.filename.includes('photo'), file.filename)

  const many = await sendFiles([
    ['a.png', SAMPLE_PNG, 'image/png'],
    ['b.png', SAMPLE_PNG, 'image/png'],
  ])
  check('plusieurs fichiers en un seul envoi',
    many.status === 201 && many.body?.data?.length === 2, many)
  for (const row of many.body?.data ?? []) created.uploads.push(row.filename)
  check('  chaque fichier reçoit un nom distinct',
    new Set((many.body?.data ?? []).map((row: any) => row.filename)).size === 2, many.body?.data)

  const wrongType = await sendFiles([['script.php', Buffer.from('<?php ?>'), 'application/x-php']])
  check('un type non autorisé est refusé en 415', wrongType.status === 415, wrongType)

  // L'extension vient du type MIME, jamais du nom envoyé : « .php.png » ne
  // peut pas atterrir en « .php » sur le disque.
  const trap = await sendFiles([['piege.php.png', SAMPLE_PNG, 'image/png']])
  const trapped = trap.body?.data?.[0]
  check('un nom piégé « .php.png » perd son « .php »',
    trap.status === 201 && !!trapped && !trapped.filename.includes('.php'), trapped?.filename)
  if (trapped) created.uploads.push(trapped.filename)

  const tooBig = await sendFiles([['gros.png', Buffer.alloc(6 * 1024 * 1024, 1), 'image/png']])
  check('un fichier de plus de 5 Mo est refusé en 400', tooBig.status === 400, tooBig)

  const anonymous = await sendFiles([['x.png', SAMPLE_PNG, 'image/png']], null)
  check('sans jeton, l’envoi est refusé en 401', anonymous.status === 401, anonymous)

  const empty = await fetch(`${API}/admin/uploads`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: new FormData(),
  })
  check('un envoi sans fichier renvoie 400', empty.status === 400, empty.status)

  // Le fichier doit être servi, et lisible depuis l'origine du front.
  const served = await fetch(`${ROOT}${file.url}`, { signal: AbortSignal.timeout(10_000) })
  check('GET /uploads/<fichier> sert l’image',
    served.status === 200 && (served.headers.get('content-type') || '').startsWith('image/'),
    `${served.status} ${served.headers.get('content-type')}`)
  check('  en-tête nosniff', served.headers.get('x-content-type-options') === 'nosniff',
    served.headers.get('x-content-type-options'))
  check('  lisible depuis une autre origine (CORP)',
    served.headers.get('cross-origin-resource-policy') === 'cross-origin',
    served.headers.get('cross-origin-resource-policy'))
  const bytes = Buffer.from(await served.arrayBuffer())
  check('  le contenu servi est identique à l’original', bytes.equals(SAMPLE_PNG), bytes.length)

  const missing = await fetch(`${ROOT}/uploads/inexistant.png`)
  check('un fichier inconnu renvoie 404', missing.status === 404, missing.status)

  const traversal = await call('DELETE', '/admin/uploads/..%2F..%2Fpackage.json', { auth: true })
  check('une tentative de traversée de répertoire est refusée',
    traversal.status === 400 || traversal.status === 404, traversal)

  // Une image envoyée doit pouvoir servir de contenu, et ressortir côté public.
  const image = await call('POST', '/admin/gallery', {
    auth: true,
    body: { src: file.url, alt: `Image envoyée ${RUN}`, category: 'gallery', sortOrder: 99 },
  })
  check('une image envoyée peut être enregistrée en galerie', image.status === 200, image)
  if (image.body?.data?.id) {
    created.gallery.push(image.body.data.id)
    const publicGallery = await call('GET', '/content/gallery')
    const row = publicGallery.body?.data?.find((entry: any) => entry.id === image.body.data.id)
    check('  elle ressort côté public avec son chemin /uploads/', row?.src === file.url, row?.src)
  }
}

/* ------------------------------------------------------------------ */
/* Nettoyage                                                           */
/* ------------------------------------------------------------------ */

async function cleanup() {
  section('Nettoyage')

  if (KEEP) {
    note('--keep : les données de test sont conservées')
    note(`réservations / messages : adresses se terminant par @${MAIL_DOMAIN}`)
    return
  }

  // 1. Les lignes sans endpoint de suppression, et les réservations qui
  //    référencent les chambres de test (clé étrangère) : en SQL.
  const url = process.env.DATABASE_URL
  if (!url) {
    note('DATABASE_URL absent : nettoyage SQL ignoré')
  } else {
    try {
      const dsn = new URL(url)
      const connection = await createConnection({
        host: dsn.hostname,
        port: Number(dsn.port || 3306),
        user: decodeURIComponent(dsn.username),
        password: decodeURIComponent(dsn.password),
        database: decodeURIComponent(dsn.pathname.slice(1)),
      })
      try {
        const like = `%@${MAIL_DOMAIN}`
        const [bookings] = await connection.execute(
          'DELETE FROM bookings WHERE guest_email LIKE ?', [like],
        )
        const [messages] = await connection.execute(
          'DELETE FROM contact_messages WHERE email LIKE ?', [like],
        )
        const [subscribers] = await connection.execute(
          'DELETE FROM newsletter_subscribers WHERE email LIKE ?', [like],
        )
        // Le journal tracerait sinon les actions de chaque exécution.
        const [audit] = await connection.execute(
          'DELETE FROM admin_audit_log WHERE user_email LIKE ? OR summary LIKE ?',
          [like, `%${RUN}%`],
        )
        note(`SQL : ${(bookings as any).affectedRows} réservation(s), ` +
          `${(messages as any).affectedRows} message(s), ` +
          `${(subscribers as any).affectedRows} inscription(s), ` +
          `${(audit as any).affectedRows} ligne(s) de journal supprimée(s)`)
      } finally {
        await connection.end()
      }
    } catch (error) {
      note(`nettoyage SQL impossible : ${(error as Error).message}`)
    }
  }

  // 2. Le reste via l'API, une fois les réservations parties.
  let removed = 0
  for (const [path, ids] of [
    ['/admin/uploads', created.uploads],
    ['/admin/menu/items', created.menuItems],
    ['/admin/menu/sections', created.menuSections],
    ['/admin/event-rooms', created.eventRooms],
    ['/admin/spa', created.spa],
    ['/admin/gallery', created.gallery],
    ['/admin/discover', created.discover],
    ['/admin/users', created.users],
    ['/admin/rooms', created.rooms],
  ] as const) {
    for (const id of ids) {
      const res = await call('DELETE', `${path}/${id}`, { auth: true })
      if (res.status === 200) removed++
      else note(`échec suppression ${path}/${id} → ${res.status} ${JSON.stringify(res.body?.error)}`)
    }
  }
  note(`API : ${removed} ressource(s) supprimée(s)`)
}

/* ------------------------------------------------------------------ */
/* Exécution                                                           */
/* ------------------------------------------------------------------ */

async function main() {
  const startedAt = Date.now()
  await preflight()

  try {
    await testInfrastructure()
    await testPublicContent()
    await testPublicRoutesAreOpen()
    await testAvailability()
    await testBookings()
    await testContactAndNewsletter()
    await testAuth()               // renseigne `token`
    await testAdminIsProtected()
    await testStats()
    await testAdminRooms()
    await testAdminMenu()
    await testAdminEventRooms()
    await testSpa()
    await testGallery()
    await testDiscover()
    await testConcurrency()
    await testAdminBookingsAndMessages()
    await testListControls()
    await testDetails()
    await testSubscribersAndExports()
    await testUsersAndRoles()
    await testUploads()
    await testDeletes()
  } finally {
    if (token) await cleanup()
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
  const total = passed + failed

  console.log(`\n${'─'.repeat(60)}`)
  if (failed === 0) {
    console.log(`${C.green}${C.bold}✓ ${passed}/${total} vérifications réussies${C.reset}  ${C.dim}en ${seconds}s${C.reset}`)
  } else {
    console.log(`${C.red}${C.bold}✗ ${failed} échec(s) sur ${total} vérifications${C.reset}  ${C.dim}en ${seconds}s${C.reset}`)
    for (const failure of failures) console.log(`  ${C.red}·${C.reset} ${failure}`)
    console.log(`\n${C.dim}Relance avec --verbose pour voir les réponses complètes.${C.reset}`)
  }

  if (rateLimited > 0) {
    console.log(`\n${C.yellow}${C.bold}⚠ ${rateLimited} requête(s) bloquée(s) par la limite de débit (HTTP 429).${C.reset}`)
    console.log(`${C.yellow}  La suite consomme une bonne partie du quota (30 écritures / 15 min).`)
    console.log(`  Pour l'enchaîner plusieurs fois, démarre l'API avec :${C.reset}`)
    console.log(`    ${C.bold}DISABLE_RATE_LIMIT=true npm run dev${C.reset}   ${C.dim}(ignoré en production)${C.reset}`)
    console.log(`  ${C.dim}Redémarrer l'API remet aussi le compteur à zéro.${C.reset}`)
  }
  console.log('─'.repeat(60))

  process.exit(failed === 0 ? 0 : 1)
}

main().catch(error => {
  console.error(`\n${C.red}Le test s'est interrompu :${C.reset}`, error)
  process.exit(1)
})
