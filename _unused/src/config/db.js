import 'dotenv/config'
import { createPool } from 'mysql2/promise'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required (vérifie ton fichier .env)')
}

const url = new URL(databaseUrl)

if (url.protocol !== 'mysql:') {
  throw new Error('DATABASE_URL must use the mysql:// protocol')
}

export const connectionOptions = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password), // vide avec Laragon : normal
  database: decodeURIComponent(url.pathname.slice(1)),
  decimalNumbers: true,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

export const pool = createPool(connectionOptions)

pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'")
})

export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log('[db] MySQL connecté :', connectionOptions.database)
  } catch (err) {
    console.error('[db] Connexion MySQL échouée :', err.message)
    process.exit(1)
  }
}

export default pool