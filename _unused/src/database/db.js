import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createPool, createConnection } from 'mysql2/promise'
import bcrypt from 'bcryptjs'

/* ------------------------------------------------------------------ */
/* 1. CONNEXION                                                        */
/* ------------------------------------------------------------------ */

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const url = new URL(databaseUrl)
if (url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use the mysql:// protocol')

const DB_NAME = decodeURIComponent(url.pathname.slice(1))

export const connectionOptions = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: DB_NAME,
  decimalNumbers: true,
  timezone: 'Z',
}

export const pool = createPool({
  ...connectionOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'")
})

export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log('[db] MySQL connecté :', DB_NAME)
  } catch (err) {
    console.error('[db] Connexion MySQL échouée :', err.message)
    process.exit(1)
  }
}

/* ------------------------------------------------------------------ */
/* 2. SCHÉMA                                                           */
/* ------------------------------------------------------------------ */

const T = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'

const TABLES = [
  `CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(191) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    translation_key VARCHAR(191) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
    size INT NOT NULL,
    max_guests INT NOT NULL,
    total_units INT NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY rooms_slug_unique (slug)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS room_images (
    room_id VARCHAR(191) NOT NULL,
    image VARCHAR(1024) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (room_id, sort_order),
    CONSTRAINT room_images_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS room_amenities (
    room_id VARCHAR(191) NOT NULL,
    amenity VARCHAR(191) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (room_id, sort_order),
    CONSTRAINT room_amenities_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(191) NOT NULL,
    guest_name VARCHAR(191) NOT NULL,
    guest_email VARCHAR(191) NOT NULL,
    guest_phone VARCHAR(64) NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME NOT NULL,
    rooms_count INT NOT NULL,
    adults INT NOT NULL,
    children INT NOT NULL DEFAULT 0,
    room_id VARCHAR(191) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY bookings_check_in_check_out_idx (check_in, check_out),
    KEY bookings_room_id_idx (room_id),
    CONSTRAINT bookings_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS menu_sections (
    id VARCHAR(191) NOT NULL,
    title VARCHAR(191) NOT NULL,
    title_en VARCHAR(191) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    name_en VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    section_id VARCHAR(191) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY menu_items_section_id_idx (section_id),
    CONSTRAINT menu_items_section_fk FOREIGN KEY (section_id) REFERENCES menu_sections (id) ON DELETE CASCADE
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS spa_treatments (
    id VARCHAR(191) NOT NULL,
    \`key\` VARCHAR(191) NOT NULL,
    duration_key VARCHAR(191) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY spa_treatments_key_unique (\`key\`)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS event_rooms (
    id VARCHAR(191) NOT NULL,
    \`key\` VARCHAR(191) NOT NULL,
    image VARCHAR(1024) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY event_rooms_key_unique (\`key\`)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(191) NOT NULL,
    type ENUM('contact', 'event') NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(64) NULL,
    subject VARCHAR(191) NULL,
    message TEXT NOT NULL,
    event_date DATETIME NULL,
    guest_count INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY contact_messages_type_status_idx (type, status)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY newsletter_subscribers_email_unique (email)
  ) ${T}`,

  `CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'admin',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY admin_users_email_unique (email)
  ) ${T}`,
]

// Ordre : enfants avant parents (les FK sont aussi désactivées pendant le reset)
const DROP_ORDER = [
  'admin_users', 'newsletter_subscribers', 'contact_messages', 'event_rooms',
  'spa_treatments', 'menu_items', 'menu_sections', 'bookings',
  'room_amenities', 'room_images', 'rooms',
]

/* ------------------------------------------------------------------ */
/* 3. DONNÉES DE DÉPART                                                */
/* ------------------------------------------------------------------ */

const SEED = [
  `INSERT INTO rooms (id, slug, translation_key, price, currency, size, max_guests, total_units) VALUES
    ('classic', 'chambre-classique', 'classic', 65, 'EUR', 22, 2, 10),
    ('superior', 'chambre-superieure', 'superior', 95, 'EUR', 28, 3, 8),
    ('deluxe', 'chambre-deluxe', 'deluxe', 130, 'EUR', 34, 3, 6),
    ('suite', 'suite-royale', 'suite', 220, 'EUR', 55, 4, 4)
  ON DUPLICATE KEY UPDATE
    slug = VALUES(slug), translation_key = VALUES(translation_key), price = VALUES(price),
    currency = VALUES(currency), size = VALUES(size), max_guests = VALUES(max_guests), total_units = VALUES(total_units)`,

  `INSERT INTO room_images (room_id, image, sort_order) VALUES
    ('classic', '/images/rooms/room-4.jpg', 0), ('classic', '/images/rooms/room-1.jpg', 1),
    ('superior', '/images/rooms/room-1.jpg', 0), ('superior', '/images/rooms/room-2.jpg', 1),
    ('deluxe', '/images/rooms/room-2.jpg', 0), ('deluxe', '/images/rooms/room-3.jpg', 1),
    ('suite', '/images/rooms/room-3.jpg', 0), ('suite', '/images/rooms/room-4.jpg', 1)
  ON DUPLICATE KEY UPDATE image = VALUES(image)`,

  `INSERT INTO room_amenities (room_id, amenity, sort_order) VALUES
    ('classic', 'ac', 0), ('classic', 'wifi', 1), ('classic', 'tv', 2), ('classic', 'bathroom', 3),
    ('superior', 'ac', 0), ('superior', 'wifi', 1), ('superior', 'tv', 2), ('superior', 'minibar', 3), ('superior', 'safe', 4), ('superior', 'bathroom', 5),
    ('deluxe', 'ac', 0), ('deluxe', 'wifi', 1), ('deluxe', 'tv', 2), ('deluxe', 'minibar', 3), ('deluxe', 'safe', 4), ('deluxe', 'bathroom', 5), ('deluxe', 'balcony', 6),
    ('suite', 'ac', 0), ('suite', 'wifi', 1), ('suite', 'tv', 2), ('suite', 'minibar', 3), ('suite', 'safe', 4), ('suite', 'bathroom', 5), ('suite', 'balcony', 6), ('suite', 'lounge', 7)
  ON DUPLICATE KEY UPDATE amenity = VALUES(amenity)`,

  `INSERT INTO menu_sections (id, title, title_en, sort_order) VALUES
    ('starters', 'Entrées', 'Starters', 0),
    ('mains', 'Plats Principaux', 'Main Courses', 1),
    ('desserts', 'Desserts', 'Desserts', 2),
    ('drinks', 'Bar & Boissons', 'Bar & Drinks', 3)
  ON DUPLICATE KEY UPDATE title = VALUES(title), title_en = VALUES(title_en), sort_order = VALUES(sort_order)`,

  `INSERT INTO menu_items (id, name, name_en, description, description_en, price, sort_order, section_id) VALUES
    ('s1', 'Salade de crudités du jardin', 'Garden salad', 'Légumes frais de notre potager, vinaigrette maison', 'Fresh vegetables from our garden, homemade dressing', 12000, 0, 'starters'),
    ('s2', 'Samoussas malgaches', 'Malagasy samosas', 'Trois pièces, viande ou légumes, sauce pimentée', 'Three pieces, meat or vegetable, chili sauce', 10000, 1, 'starters'),
    ('s3', 'Soupe de courge et gingembre', 'Squash and ginger soup', 'Velouté onctueux, crème fraîche', 'Creamy velouté, fresh cream', 11000, 2, 'starters'),
    ('m1', 'Romazava traditionnel malgache', 'Traditional Malagasy Romazava', 'Bouillon de viande et brèdes mafana, riz blanc', 'Meat broth with mafana greens, white rice', 28000, 0, 'mains'),
    ('m2', 'Poisson grillé, sauce vanille de Madagascar', 'Grilled fish, Madagascar vanilla sauce', 'Poisson du jour, sauce vanille bourbon, légumes de saison', 'Catch of the day, bourbon vanilla sauce, seasonal vegetables', 32000, 1, 'mains'),
    ('m3', 'Filet de zébu au poivre sauvage', 'Zebu filet with wild pepper', 'Poivre sauvage de Madagascar, gratin de pommes de terre', 'Madagascar wild pepper, potato gratin', 35000, 2, 'mains'),
    ('m4', 'Curry de crevettes au lait de coco', 'Shrimp curry with coconut milk', 'Riz parfumé, brochette de légumes grillés', 'Fragrant rice, grilled vegetable skewer', 34000, 3, 'mains'),
    ('d1', 'Assiette de fruits tropicaux', 'Tropical fruit plate', 'Fruits frais du jardin de l''hôtel', 'Fresh fruits from the hotel''s garden', 9000, 0, 'desserts'),
    ('d2', 'Mousse au chocolat et vanille de Madagascar', 'Chocolate mousse with Madagascar vanilla', 'Chocolat noir 70%, éclats de vanille bourbon', '70% dark chocolate, bourbon vanilla shavings', 12000, 1, 'desserts'),
    ('b1', 'Cocktail signature "Royal Palace"', '"Royal Palace" signature cocktail', 'Rhum arrangé maison, fruits de la passion', 'House-infused rum, passion fruit', 15000, 0, 'drinks'),
    ('b2', 'Jus frais naturel', 'Fresh natural juice', 'Ananas, mangue ou fruit de la passion', 'Pineapple, mango or passion fruit', 7000, 1, 'drinks'),
    ('b3', 'Sélection de vins', 'Wine selection', 'Vins locaux et importés au verre ou en bouteille', 'Local and imported wines by the glass or bottle', 18000, 2, 'drinks')
  ON DUPLICATE KEY UPDATE
    name = VALUES(name), name_en = VALUES(name_en), description = VALUES(description),
    description_en = VALUES(description_en), price = VALUES(price), sort_order = VALUES(sort_order), section_id = VALUES(section_id)`,

  `INSERT INTO spa_treatments (id, \`key\`, duration_key, price, sort_order) VALUES
    ('t1', 'treatment1', 'treatment1Duration', 45000, 0),
    ('t2', 'treatment2', 'treatment2Duration', 60000, 1),
    ('t3', 'treatment3', 'treatment3Duration', 40000, 2),
    ('t4', 'treatment4', 'treatment4Duration', 42000, 3),
    ('t5', 'treatment5', 'treatment5Duration', 95000, 4)
  ON DUPLICATE KEY UPDATE \`key\` = VALUES(\`key\`), duration_key = VALUES(duration_key), price = VALUES(price), sort_order = VALUES(sort_order)`,

  `INSERT INTO event_rooms (id, \`key\`, image, sort_order) VALUES
    ('room1', 'room1', '/images/events/events-1.jpg', 0),
    ('room2', 'room2', '/images/events/events-2.jpg', 1),
    ('room3', 'room3', '/images/events/events-3.jpg', 2)
  ON DUPLICATE KEY UPDATE \`key\` = VALUES(\`key\`), image = VALUES(image), sort_order = VALUES(sort_order)`,
]

/* ------------------------------------------------------------------ */
/* 4. COMMANDES (schéma, seed, reset, admin)                           */
/* ------------------------------------------------------------------ */

// Connexion sans base sélectionnée : permet de créer la base si elle n'existe pas
async function withServerConnection(fn) {
  const conn = await createConnection({ ...connectionOptions, database: undefined })
  try {
    return await fn(conn)
  } finally {
    await conn.end()
  }
}

export async function createSchema() {
  await withServerConnection(async (conn) => {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await conn.query(`USE \`${DB_NAME}\``)
    for (const sql of TABLES) await conn.query(sql)
  })
  console.log(`[db] Schéma créé (${TABLES.length} tables)`)
}

export async function seedDatabase() {
  await withServerConnection(async (conn) => {
    await conn.query(`USE \`${DB_NAME}\``)
    for (const sql of SEED) await conn.query(sql)
  })
  console.log('[db] Données de départ insérées')
}

export async function resetDatabase({ force = false } = {}) {
  if (process.env.NODE_ENV === 'production' && !force) {
    throw new Error('Reset refusé en production. Ajoute --force si tu es sûr.')
  }
  await withServerConnection(async (conn) => {
    await conn.query(`USE \`${DB_NAME}\``)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    for (const table of DROP_ORDER) await conn.query(`DROP TABLE IF EXISTS \`${table}\``)
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
  })
  console.log('[db] Toutes les tables supprimées')
}

function ask(prompt) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((res) => rl.question(prompt, (answer) => { rl.close(); res(answer) }))
}

export async function createAdmin() {
  const [rows] = await pool.query('SELECT COUNT(*) AS admin_count FROM admin_users')
  if (Number(rows[0].admin_count) > 0) {
    console.log('Un compte admin existe déjà. Utilise l\'endpoint d\'inscription pour en ajouter.')
    return
  }

  const email = (await ask('Email admin : ')).trim().toLowerCase()
  const password = await ask('Mot de passe (min 6 caractères) : ')
  const role = (await ask('Rôle (admin/staff, défaut : admin) : ')).trim() || 'admin'

  if (!email || password.length < 6 || !['admin', 'staff'].includes(role)) {
    throw new Error('Email requis, mot de passe de 6 caractères minimum, rôle admin ou staff.')
  }

  const hash = await bcrypt.hash(password, 10)
  await pool.execute(
    'INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, ?)',
    [randomUUID(), email, hash, role]
  )
  console.log(`Compte créé : ${email} (${role})`)
}

/* ------------------------------------------------------------------ */
/* 5. LIGNE DE COMMANDE : node database/db.js <commande>               */
/* ------------------------------------------------------------------ */

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const command = process.argv[2]
  const force = process.argv.includes('--force')

  const commands = {
    test: testConnection,
    schema: createSchema,
    seed: seedDatabase,
    reset: () => resetDatabase({ force }),
    fresh: async () => {            // reset + schéma + seed
      await resetDatabase({ force })
      await createSchema()
      await seedDatabase()
    },
    admin: createAdmin,
  }

  if (!commands[command]) {
    console.log('Usage : node database/db.js <test|schema|seed|reset|fresh|admin> [--force]')
    process.exit(1)
  }

  commands[command]()
    .catch((err) => {
      console.error('[db] Erreur :', err.message)
      process.exitCode = 1
    })
    .finally(() => pool.end())
}

export default pool