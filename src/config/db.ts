import 'dotenv/config'
import { createPool } from 'mysql2/promise'

const databaseUrl = process.env.DATABASE_URL || 'mysql://royal:royal@127.0.0.1:3306/royal_palace'

const url = new URL(databaseUrl)

if (url.protocol !== 'mysql:') {
  throw new Error('DATABASE_URL must use the mysql:// protocol')
}

export const connectionOptions = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  decimalNumbers: true,
  timezone: 'Z' as const,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = createPool(connectionOptions)

pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'")
})

export default pool