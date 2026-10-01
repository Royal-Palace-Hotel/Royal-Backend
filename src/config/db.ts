import { createPool, type PoolOptions } from 'mysql2/promise'
import { DATABASE_URL } from './env'

const url = new URL(DATABASE_URL)

if (url.protocol !== 'mysql:') {
  throw new Error('DATABASE_URL must use the mysql:// protocol')
}

export const connectionOptions: PoolOptions = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  // An empty password is valid (default Laragon / XAMPP setup).
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  decimalNumbers: true,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

export const databaseName = connectionOptions.database as string

export const pool = createPool(connectionOptions)

pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'")
})

/** Fails fast at startup instead of letting every request 500 on a bad DSN. */
export async function assertDatabaseConnection() {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
  } finally {
    connection.release()
  }
}

export default pool
