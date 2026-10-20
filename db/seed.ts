import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createConnection } from 'mysql2/promise'
import { connectionOptions } from '../src/config/db'
import { runSql } from './run-sql'

const adminId = 'local-dev-admin'
const adminEmail = 'admin@royalpalace.test'
const adminPassword = 'DevAdmin123!'
const developmentSalt = '$2b$10$abcdefghijklmnopqrstuu'

async function main() {
  await runSql('db/seed.sql')

  const passwordHash = await bcrypt.hash(adminPassword, developmentSalt)
  const connection = await createConnection(connectionOptions)
  try {
    await connection.execute(
      `INSERT INTO admin_users (id, email, password, role) VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
      [adminId, adminEmail, passwordHash],
    )
  } finally {
    await connection.end()
  }

  console.log(`Local development admin is ready: ${adminEmail}`)
}

main().catch(error => {
  console.error('Database seed failed:', error)
  process.exitCode = 1
})